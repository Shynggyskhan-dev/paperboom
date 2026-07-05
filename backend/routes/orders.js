/**
 * routes/orders.js
 * All routes are JWT-protected via authMiddleware.
 *
 * POST /api/orders
 *   Body: { items: [{ product_id, unit_type, quantity }] }
 *   unit_type: 'piece' | 'pack' | 'box'
 *   Fetches real prices from DB — client-side prices are IGNORED.
 *
 * GET /api/orders
 *   Returns the authenticated user's full order history with line items.
 */

const express = require('express');
const db      = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { items } = req.body;
    const user_id   = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    // Map unit_type → the correct price column name in the products table
    const priceColumn = { piece: 'price_piece', pack: 'price_pack', box: 'price_box' };

    let total_sum = 0;
    const enriched = [];

    for (const item of items) {
      const unit_type = item.unit_type || 'piece';
      const col       = priceColumn[unit_type];

      if (!col) {
        return res.status(400).json({
          error: `Неверный тип единицы: ${unit_type}. Допустимые: piece, pack, box`,
        });
      }

      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          error: `Некорректная позиция: product_id=${item.product_id}, quantity=${item.quantity}`,
        });
      }

      // Fetch product and read the correct price column for this unit type
      const product = db.get(
        `SELECT id, article, name, ${col} AS unit_price FROM products WHERE id = ?`,
        [item.product_id]
      );

      if (!product) {
        return res.status(400).json({ error: `Товар ${item.product_id} не найден` });
      }

      if (!product.unit_price || product.unit_price === 0) {
        return res.status(400).json({
          error: `Товар "${product.name}" не продаётся в этой фасовке (${unit_type})`,
        });
      }

      const qty = parseInt(item.quantity, 10);
      total_sum += product.unit_price * qty;

      enriched.push({
        product_id:        product.id,
        article:           product.article,
        name:              product.name,
        unit_type,
        quantity:          qty,
        price_at_purchase: product.unit_price,
      });
    }

    total_sum = Math.round(total_sum * 100) / 100;

    // Insert order header
    const orderResult = db.run(
      'INSERT INTO orders (user_id, total_sum) VALUES (?, ?)',
      [user_id, total_sum]
    );
    const order_id = orderResult.lastInsertRowid;

    // Insert each line item — unit_type column exists in schema
    for (const item of enriched) {
      db.run(
        `INSERT INTO order_items
           (order_id, product_id, unit_type, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?, ?)`,
        [order_id, item.product_id, item.unit_type, item.quantity, item.price_at_purchase]
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

// ── GET /api/orders ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const user_id = req.user.id;

    const orders = db.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    const result = orders.map(order => {
      const items = db.all(
        `SELECT oi.id,
                oi.quantity,
                oi.unit_type,
                oi.price_at_purchase,
                p.id      AS product_id,
                p.article,
                p.name,
                p.category,
                p.subcategory
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