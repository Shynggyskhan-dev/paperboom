/**
 * routes/favorites.js
 * All routes are JWT-protected via authMiddleware.
 *
 * GET    /api/favorites        — list user's favourite products
 * POST   /api/favorites        — add product to favourites   { product_id }
 * DELETE /api/favorites/:id    — remove product from favourites (id = product_id)
 */

const express = require('express');
const db      = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// ── GET /api/favorites ───────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const favorites = db.all(
      `SELECT p.*
       FROM   favorites f
       JOIN   products p ON p.id = f.product_id
       WHERE  f.user_id = ?
       ORDER  BY p.category, p.name`,
      [req.user.id]
    );
    res.json(favorites);
  } catch (err) {
    console.error('[GET /favorites]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── POST /api/favorites ──────────────────────────────────────────────────────
// Body: { product_id }
router.post('/', (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: 'product_id обязателен' });
    }

    const product = db.get('SELECT id FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    db.run(
      'INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product_id]
    );

    res.status(201).json({ message: 'Добавлено в избранное', product_id });
  } catch (err) {
    console.error('[POST /favorites]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── DELETE /api/favorites/:id ────────────────────────────────────────────────
// :id is the product_id (article string, e.g. "10002")
router.delete('/:id', (req, res) => {
  try {
    db.run(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.id]
    );
    res.json({ message: 'Удалено из избранного', product_id: req.params.id });
  } catch (err) {
    console.error('[DELETE /favorites]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
