/**
 * server.js — PaperBoom API Server
 * Express + PostgreSQL (Supabase) + JWT Auth
 *
 * Start:   npm run dev
 * Port:    3000  (override with PORT env var)
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Route modules
const authRouter      = require('./routes/auth');
const productsRouter  = require('./routes/products');
const ordersRouter    = require('./routes/orders');
const favoritesRouter = require('./routes/favorites');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5500',
    'https://paperboom.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// ── Serve Frontend ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api',          authRouter);       // POST /api/register, /api/login
app.use('/api/products', productsRouter);   // GET  /api/products, /api/products/categories
app.use('/api/orders',   ordersRouter);     // GET/POST /api/orders   [JWT]
app.use('/api/favorites', favoritesRouter); // GET/POST/DELETE /api/favorites [JWT]

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    const pool = require('./db/database');
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── 404 for unknown API routes ────────────────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
// pg.Pool connects automatically on first query — no manual connect() needed.
app.listen(PORT, () => {
  console.log('');
  console.log('🚀  PaperBoom backend started');
  console.log(`    Frontend:  http://localhost:${PORT}`);
  console.log(`    API base:  http://localhost:${PORT}/api`);
  console.log(`    Health:    http://localhost:${PORT}/api/health`);
  console.log('');
});