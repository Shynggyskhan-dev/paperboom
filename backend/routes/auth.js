/**
 * routes/auth.js
 * POST /api/register  — create account
 * POST /api/login     — authenticate, receive JWT
 */

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/register ───────────────────────────────────────────────────────
// Body: { company_name, phone, password }
router.post('/register', async (req, res) => {
  try {
    const { company_name, phone, password } = req.body;

    if (!company_name || !phone || !password) {
      return res.status(400).json({ error: 'Заполните все поля: company_name, phone, password' });
    }

    // Normalize phone: strip everything except digits and leading +
    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    if (normalizedPhone.length < 10) {
      return res.status(400).json({ error: 'Некорректный номер телефона' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    const existing = db.get('SELECT id FROM users WHERE phone = ?', [normalizedPhone]);
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким номером уже зарегистрирован' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = db.run(
      'INSERT INTO users (company_name, phone, password_hash) VALUES (?, ?, ?)',
      [company_name.trim(), normalizedPhone, password_hash]
    );

    const user = db.get(
      'SELECT id, company_name, phone, created_at FROM users WHERE id = ?',
      [result.lastInsertRowid]
    );

    const token = jwt.sign(
      { id: user.id, phone: user.phone, company_name: user.company_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'Регистрация успешна', token, user });
  } catch (err) {
    console.error('[register]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ── POST /api/login ──────────────────────────────────────────────────────────
// Body: { phone, password }
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Введите номер телефона и пароль' });
    }

    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    const user = db.get('SELECT * FROM users WHERE phone = ?', [normalizedPhone]);

    if (!user) {
      return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, company_name: user.company_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Вход выполнен', token, user: safeUser });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
