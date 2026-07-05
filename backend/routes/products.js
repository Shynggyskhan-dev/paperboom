/**
 * routes/products.js
 * GET /api/products               — full catalogue
 * GET /api/products?search=...    — search by article OR name (case-insensitive)
 * GET /api/products?volume=250    — filter by volume (ml)
 * GET /api/products?category=...  — filter by category
 * GET /api/products?subcategory=. — filter by subcategory
 * (all params can be combined)
 *
 * GET /api/categories             — grouped category → subcategory tree
 */

const express = require('express');
const db      = require('../db/database');

const router = express.Router();

// ── GET /api/products ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { search, volume, category, subcategory } = req.query;

    let sql    = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Full-text search: matches article id OR product name (case-insensitive)
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ' AND (LOWER(id) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?))';
      params.push(term, term);
    }

    // Volume filter (exact integer match in the volume column)
    if (volume) {
      const v = parseInt(volume, 10);
      if (!isNaN(v)) {
        sql += ' AND volume = ?';
        params.push(v);
      }
    }

    // Category filter
    if (category && category.trim()) {
      sql += ' AND category = ?';
      params.push(category.trim());
    }

    // Subcategory filter
    if (subcategory && subcategory.trim()) {
      sql += ' AND subcategory = ?';
      params.push(subcategory.trim());
    }

    sql += ' ORDER BY category, subcategory, name';

    const products = db.all(sql, params);
    res.json(products);
  } catch (err) {
    console.error('[GET /products]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── GET /api/categories ──────────────────────────────────────────────────────
// Returns: [{ category, subcategories: ["...", "..."] }]
router.get('/categories', (_req, res) => {
  try {
    const rows = db.all(
      'SELECT DISTINCT category, subcategory FROM products ORDER BY category, subcategory'
    );

    const map = {};
    rows.forEach(({ category, subcategory }) => {
      if (!map[category]) map[category] = [];
      map[category].push(subcategory);
    });

    const result = Object.entries(map).map(([category, subcategories]) => ({
      category,
      subcategories,
    }));

    res.json(result);
  } catch (err) {
    console.error('[GET /categories]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
