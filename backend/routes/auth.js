/**
 * routes/auth.js
 * POST /api/register  — create account
 * POST /api/login     — authenticate, receive JWT
 *
 * Schema (Supabase):
 *   users(id UUID, email, password_hash, company_name, bin_iin, role, created_at)
 */

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/register ────────────────────────────────────────────────────────
// Body: { email, password, company_name, bin_iin (optional) }
router.post('/register', async (req, res) => {
  try {
    const { email, password, company_name, bin_iin } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    if (bin_iin && bin_iin.trim().length !== 12) {
      return res.status(400).json({ error: 'БИН/ИИН должен содержать ровно 12 символов' });
    }

    // ── Check for duplicate email ─────────────────────────────────────────────
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    // ── Hash password and insert ──────────────────────────────────────────────
    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, company_name, bin_iin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, company_name, bin_iin, role, created_at`,
      [
        normalizedEmail,
        password_hash,
        company_name ? company_name.trim() : null,
        bin_iin      ? bin_iin.trim()       : null,
      ]
    );
    const user = rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, company_name: user.company_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'Регистрация успешна', token, user });
  } catch (err) {
    console.error('[register]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── POST /api/login ───────────────────────────────────────────────────────────
// Body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch full row including password_hash for bcrypt comparison
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = rows[0];

    // Return identical error for both "not found" and "wrong password"
    // to avoid leaking which emails are registered (timing-safe UX)
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, company_name: user.company_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Strip password_hash before sending — never expose it to the client
    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Вход выполнен', token, user: safeUser });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;