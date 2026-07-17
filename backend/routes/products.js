/**
 * routes/products.js
 * GET /api/products               — full catalogue
 * GET /api/products?search=...    — search by sku OR name (ILIKE, case-insensitive)
 * GET /api/products?category=...  — filter by category
 * GET /api/products?subcategory=. — filter by subcategory
 * (all params combinable)
 *
 * GET /api/products/categories    — grouped category → subcategory tree
 */

const express = require('express');
const pool    = require('../db/database');

const router = express.Router();

// ── GET /api/products/categories ──────────────────────────────────────────────
// Declared BEFORE GET '/' — otherwise Express matches "categories" as a search term.
router.get('/categories', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT category, subcategory
       FROM   products
       WHERE  category IS NOT NULL
       ORDER  BY category, subcategory`
    );

    const map = {};
    rows.forEach(({ category, subcategory }) => {
      if (!map[category]) map[category] = [];
      if (subcategory) map[category].push(subcategory);
    });

    const result = Object.entries(map).map(([category, subcategories]) => ({
      category,
      subcategories,
    }));

    res.json(result);
  } catch (err) {
    console.error('[GET /products/categories]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, category, subcategory } = req.query;

    const conditions = ['1=1'];
    const params     = [];
    let   idx        = 1;

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(`(sku ILIKE $${idx} OR name ILIKE $${idx + 1})`);
      params.push(term, term);
      idx += 2;
    }

    if (category && category.trim()) {
      conditions.push(`category = $${idx}`);
      params.push(category.trim());
      idx += 1;
    }

    if (subcategory && subcategory.trim()) {
      conditions.push(`subcategory = $${idx}`);
      params.push(subcategory.trim());
      idx += 1;
    }

    const { rows } = await pool.query(
      `SELECT *
       FROM   products
       WHERE  ${conditions.join(' AND ')}
       ORDER  BY category, subcategory, name`,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error('[GET /products]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;