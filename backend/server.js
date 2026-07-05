/**
 * server.js — PaperBoom API Server
 * Express + sql.js (SQLite) + JWT Auth
 *
 * Setup:   npm run setup   (init DB + seed products)
 * Start:   npm run dev
 * Port:    3000  (override with PORT env var)
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db/database');

// Route modules
const authRouter      = require('./routes/auth');
const productsRouter  = require('./routes/products');
const ordersRouter    = require('./routes/orders');
const favoritesRouter = require('./routes/favorites');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',  // Tighten this to your frontend domain in production
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Serve Frontend ────────────────────────────────────────────────────────────
// Serves index.html from the sibling "frontend" folder at http://localhost:3000
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', authRouter);                    // POST /api/register, /api/login
app.use('/api/products', productsRouter);       // GET  /api/products, /api/categories
app.use('/api/orders',   ordersRouter);         // GET/POST /api/orders   [JWT]
app.use('/api/favorites', favoritesRouter);     // GET/POST/DELETE /api/favorites [JWT]

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
async function start() {
  await db.connect();
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀  PaperBoom backend started');
    console.log(`    Frontend:  http://localhost:${PORT}`);
    console.log(`    API base:  http://localhost:${PORT}/api`);
    console.log(`    Health:    http://localhost:${PORT}/api/health`);
    console.log('');
  });
}

start().catch(err => {
  console.error('❌  Failed to start server:', err.message);
  process.exit(1);
});
