/**
 * routes/orders.js
 * All routes are JWT-protected via authMiddleware.
 *
 * POST /api/orders
 *   Body: { items: [{ product_id, unit_type, quantity }] }
 *   unit_type: 'piece' | 'pack' | 'box'
 *   Fetches real prices from DB — client-side prices are IGNORED.
 *   Wrapped in a full BEGIN/COMMIT/ROLLBACK transaction.
 *
 * GET /api/orders
 *   Returns the authenticated user's full order history with line items.
 */

const express        = require('express');
const pool           = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { items } = req.body;
    const user_id   = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    // Map unit_type → the correct price column in the products table
    const priceColumn = {
      piece: 'price_piece',
      pack:  'price_pack',
      box:   'price_box',
    };

    // ── Validate all items before touching the DB ────────────────────────────
    for (const item of items) {
      const unit_type = item.unit_type || 'piece';
      if (!priceColumn[unit_type]) {
        return res.status(400).json({
          error: `Неверный тип единицы: ${unit_type}. Допустимые: piece, pack, box`,
        });
      }
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          error: `Некорректная позиция: product_id=${item.product_id}, quantity=${item.quantity}`,
        });
      }
    }

    // ── BEGIN transaction ────────────────────────────────────────────────────
    await client.query('BEGIN');

    // ── Fetch real prices from DB — never trust the client ───────────────────
    let total_sum = 0;
    const enriched = [];

    for (const item of items) {
      const unit_type = item.unit_type || 'piece';
      const col       = priceColumn[unit_type];

      const { rows } = await client.query(
        `SELECT id, sku, name, ${col} AS unit_price
         FROM   products
         WHERE  id = $1`,
        [item.product_id]
      );

      const product = rows[0];
      if (!product) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Товар ${item.product_id} не найден` });
      }

      const unitPrice = parseFloat(product.unit_price);
      if (!unitPrice || unitPrice === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Товар "${product.name}" не продаётся в этой фасовке (${unit_type})`,
        });
      }

      const qty = parseInt(item.quantity, 10);
      total_sum += unitPrice * qty;

      enriched.push({
        product_id:    product.id,
        sku:           product.sku,
        name:          product.name,
        unit_type,
        quantity:      qty,
        price_per_unit: unitPrice,
      });
    }

    total_sum = Math.round(total_sum * 100) / 100;

    // ── Insert order header ──────────────────────────────────────────────────
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, total_amount)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, total_sum]
    );
    const order = orderRows[0];

    // ── Insert line items ────────────────────────────────────────────────────
    const savedItems = [];
    for (const item of enriched) {
      const { rows: itemRows } = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_type, price_per_unit)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [order.id, item.product_id, item.quantity, item.unit_type, item.price_per_unit]
      );
      savedItems.push({ ...itemRows[0], name: item.name, sku: item.sku });
    }

    // ── COMMIT ───────────────────────────────────────────────────────────────
    await client.query('COMMIT');

    res.status(201).json({
      message:   'Заказ успешно создан',
      order,
      items:     savedItems,
      total_sum,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[POST /orders]', err.message);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  } finally {
    client.release();
  }
});

// ── GET /api/orders ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const user_id = req.user.id;

    // Fetch all orders for this user
    const { rows: orders } = await pool.query(
      `SELECT *
       FROM   orders
       WHERE  user_id = $1
       ORDER  BY created_at DESC`,
      [user_id]
    );

    // Fetch line items for all orders in one query (avoid N+1)
    const orderIds = orders.map(o => o.id);

    let itemsByOrderId = {};
    if (orderIds.length > 0) {
      const { rows: allItems } = await pool.query(
        `SELECT oi.id,
                oi.order_id,
                oi.quantity,
                oi.price_type,
                oi.price_per_unit,
                p.id          AS product_id,
                p.sku,
                p.name,
                p.category
         FROM   order_items oi
         JOIN   products p ON p.id = oi.product_id
         WHERE  oi.order_id = ANY($1::int[])
         ORDER  BY oi.id ASC`,
        [orderIds]
      );

      // Group items by order_id
      for (const item of allItems) {
        if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = [];
        itemsByOrderId[item.order_id].push(item);
      }
    }

    const result = orders.map(order => ({
      ...order,
      items: itemsByOrderId[order.id] || [],
    }));

    res.json(result);

  } catch (err) {
    console.error('[GET /orders]', err.message);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

module.exports = router;