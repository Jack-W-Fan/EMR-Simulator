const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const { initDb } = require('./database');

dotenv.config();

let genAI = null;
try {
  genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn('GEMINI_API_KEY not set. AI features will be unavailable.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false, // Set to true if using HTTPS
    path: '/', // Ensure cookie is available on all paths
  }
}));

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const ehrUploadRoutes = require('./routes/ehr-upload');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/ehr', upload.single('file'), ehrUploadRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Auth middleware for EMR route
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/public/emr.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'emr.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`EMR Simulator running on http://localhost:${PORT}`);
    try {
      const cases = require('./cases/index');
      console.log(`[startup] Loaded ${cases.length} AI cases. Specialties: ${[...new Set(cases.map(c => c.specialty))].join(', ')}`);
    } catch (e) {
      console.error('[startup] ERROR loading cases:', e.message);
    }
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = { app, genAI };
