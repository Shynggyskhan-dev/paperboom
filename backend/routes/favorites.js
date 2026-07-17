/**
 * routes/favorites.js
 * All routes are JWT-protected via authMiddleware.
 *
 * GET    /api/favorites      — list user's favourite products
 * POST   /api/favorites      — add product to favourites { product_id }
 * DELETE /api/favorites/:id  — remove product (id = product_id)
 *
 * Schema (Supabase):
 *   favorites(user_id UUID, product_id INTEGER, PRIMARY KEY (user_id, product_id))
 */

const express        = require('express');
const pool           = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ── GET /api/favorites ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*
       FROM   favorites f
       JOIN   products  p ON p.id = f.product_id
       WHERE  f.user_id = $1
       ORDER  BY p.category, p.name`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /favorites]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── POST /api/favorites ───────────────────────────────────────────────────────
// Body: { product_id }
// ON CONFLICT DO NOTHING replaces SQLite's INSERT OR IGNORE —
// if the (user_id, product_id) pair already exists the query
// succeeds silently without throwing a unique-constraint error.
router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id обязателен' });
    }

    // Verify the product exists before inserting
    const { rows: productRows } = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [product_id]
    );
    if (!productRows.length) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    await pool.query(
      `INSERT INTO favorites (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.id, product_id]
    );

    res.status(201).json({ message: 'Добавлено в избранное', product_id });
  } catch (err) {
    console.error('[POST /favorites]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── DELETE /api/favorites/:id ─────────────────────────────────────────────────
// :id is the product_id integer
router.delete('/:id', async (req, res) => {
  try {
    const product_id = parseInt(req.params.id, 10);

    if (isNaN(product_id)) {
      return res.status(400).json({ error: 'Некорректный product_id' });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Запись не найдена в избранном' });
    }

    res.json({ message: 'Удалено из избранного', product_id });
  } catch (err) {
    console.error('[DELETE /favorites]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;