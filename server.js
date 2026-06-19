const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const { initDb } = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  }
}));

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`EMR Simulator running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
