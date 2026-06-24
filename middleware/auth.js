const { getDb, dbGet } = require('../database');

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.userId) {
    getDb();
    const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
    if (user && user.role === 'admin') {
      return next();
    }
  }
  res.status(403).json({ error: 'Admin access required' });
}

module.exports = { requireAuth, requireAdmin };
