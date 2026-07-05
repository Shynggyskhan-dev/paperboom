/**
 * routes/orders.js
 * All routes are JWT-protected via authMiddleware.
 *
 * POST /api/orders
 *   Body: { items: [{ product_id, quantity }] }
 *   Fetches real prices from DB — client-side prices are IGNORED.
 *   Saves to orders + order_items tables.
 *
 * GET /api/orders
 *   Returns the authenticated user's full order history with line items.
 */

const express = require('express');
const db      = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All order routes require a valid JWT
router.use(authMiddleware);

// ── POST /api/orders ─────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { items } = req.body;
    const user_id   = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    // Validate items shape
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          error: `Некорректная позиция: product_id=${item.product_id}, quantity=${item.quantity}`,
        });
      }
    }

    // Fetch REAL prices from DB — never trust the client
    let total_sum = 0;
    const enriched = [];

    for (const item of items) {
      const product = db.get('SELECT id, name, price FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(400).json({ error: `Товар с артикулом ${item.product_id} не найден` });
      }

      const qty = parseInt(item.quantity, 10);
      total_sum += product.price * qty;
      enriched.push({
        product_id:        product.id,
        quantity:          qty,
        price_at_purchase: product.price,
        name:              product.name,
      });
    }

    // Round to 2 decimal places
    total_sum = Math.round(total_sum * 100) / 100;

    // Insert order header
    const orderResult = db.run(
      'INSERT INTO orders (user_id, total_sum) VALUES (?, ?)',
      [user_id, total_sum]
    );
    const order_id = orderResult.lastInsertRowid;

    // Insert each line item
    for (const item of enriched) {
      db.run(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.price_at_purchase]
      );
    }

    const savedOrder = db.get('SELECT * FROM orders WHERE id = ?', [order_id]);
    res.status(201).json({
      message:   'Заказ успешно создан',
      order:     savedOrder,
      items:     enriched,
      total_sum,
    });
  } catch (err) {
    console.error('[POST /orders]', err.message);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// ── GET /api/orders ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const user_id = req.user.id;

    const orders = db.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    // Attach line items + product info to each order
    const result = orders.map(order => {
      const items = db.all(
        `SELECT oi.id, oi.quantity, oi.price_at_purchase,
                p.id AS product_id, p.name, p.category, p.subcategory
         FROM   order_items oi
         JOIN   products p ON p.id = oi.product_id
         WHERE  oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items };
    });

    res.json(result);
  } catch (err) {
    console.error('[GET /orders]', err.message);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

module.exports = router;
