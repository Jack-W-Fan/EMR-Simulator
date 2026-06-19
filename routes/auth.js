const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, dbGet, dbRun } = require('../database');

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, displayName } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  getDb();
  const existing = dbGet('SELECT id FROM users WHERE username = ?', [username]);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = dbRun('INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)',
    [username, hash, displayName || username]);

  req.session.userId = result.lastInsertRowid;
  req.session.username = username;
  req.session.displayName = displayName || username;

  res.json({ success: true, user: { username, displayName: displayName || username } });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  getDb();
  const user = dbGet('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.displayName = user.display_name || user.username;

  res.json({ success: true, user: { username: user.username, displayName: user.display_name || user.username } });
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
  res.json({
    user: {
      username: req.session.username,
      displayName: req.session.displayName,
    }
  });
});

router.put('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { displayName, username, password } = req.body;
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

  if (username && username !== user.username) {
    const existing = dbGet('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.session.userId]);
    if (existing) {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    updates.push('username = ?');
    params.push(username);
    req.session.username = username;
  }

  if (password && password.length >= 4) {
    const hash = bcrypt.hashSync(password, 10);
    updates.push('password_hash = ?');
    params.push(hash);
  } else if (password && password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  if (updates.length === 0) {
    return res.json({ success: true, user: { username: req.session.username, displayName: req.session.displayName } });
  }

  params.push(req.session.userId);
  dbRun(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

  res.json({ success: true, user: { username: req.session.username, displayName: req.session.displayName } });
});

module.exports = router;
