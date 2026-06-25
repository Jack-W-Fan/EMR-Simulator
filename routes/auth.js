const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, dbGet, dbRun } = require('../database');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  getDb();
  const existing = dbGet('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email already exists.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = dbRun('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
    [email, hash, displayName || email]);

  req.session.userId = result.lastInsertRowid;
  req.session.email = email;
  req.session.displayName = displayName || email;

  res.json({ success: true, user: { email, displayName: displayName || email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  getDb();
  const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.displayName = user.display_name || user.email;

  res.json({ success: true, user: { email: user.email, displayName: user.display_name || user.email } });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  getDb();
  const user = dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
  res.json({
    user: {
      email: req.session.email,
      displayName: req.session.displayName,
      role: user.role || 'user',
    }
  });
});

router.get('/user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  getDb();
  const user = dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
  res.json({
    id: user.id,
    email: user.email,
    lastName: user.last_name,
    firstName: user.first_name,
    displayName: user.display_name || user.email,
    role: user.role || 'user',
  });
});

router.put('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { displayName, email, password } = req.body;
  getDb();

  const user = dbGet('SELECT * FROM users WHERE id = ?', [req.session.userId]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let updates = [];
  let params = [];

  if (displayName && displayName !== user.display_name) {
    updates.push('display_name = ?');
    params.push(displayName);
    req.session.displayName = displayName;
  }

  if (email && email !== user.email) {
    const existing = dbGet('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.session.userId]);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    updates.push('email = ?');
    params.push(email);
    req.session.email = email;
  }

  if (password && password.length >= 4) {
    const hash = bcrypt.hashSync(password, 10);
    updates.push('password_hash = ?');
    params.push(hash);
  } else if (password && password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  if (updates.length === 0) {
    return res.json({ success: true, user: { email: req.session.email, displayName: req.session.displayName } });
  }

  params.push(req.session.userId);
  dbRun(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

  res.json({ success: true, user: { email: req.session.email, displayName: req.session.displayName } });
});

module.exports = router;
