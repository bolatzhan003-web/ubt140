const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || (!phone && !email) || !password) {
      return res.status(400).json({ error: 'Аты-жөніңізді, телефон нөміріңізді және құпиясөзді енгізіңіз' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Құпиясөз кемінде 6 таңбадан тұруы керек' });
    }

    if (phone) {
      const cleanPhone = db.normalizePhone(phone);
      if (cleanPhone.length < 10) {
        return res.status(400).json({ error: 'Телефон нөмірін толық енгізіңіз (+7 7XX XXX-XX-XX)' });
      }
      const existingPhone = db.findUserByPhone(phone);
      if (existingPhone) {
        return res.status(400).json({ error: 'Бұл телефон нөмірі тіркелген. Кіру бетіне өтіңіз' });
      }
    }

    if (email) {
      const existingEmail = db.findUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Бұл email тіркелген' });
      }
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const user = db.createUser({ name, phone, email, password_hash });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { login, email, phone, password } = req.body;
    const identifier = login || phone || email;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Телефон нөмірі мен құпиясөзді енгізіңіз' });
    }

    const user = db.findUserByLogin(identifier);
    if (!user) {
      return res.status(400).json({ error: 'Телефон нөмірі немесе құпиясөз қате' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Телефон нөмірі немесе құпиясөз қате' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updated = db.updateUser(req.user.id, {
      ...(name ? { name } : {}),
      ...(avatar ? { avatar } : {})
    });
    res.json({ user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
