const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'emr.db');
let db = null;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  initSchema();
  seedData();
  seedClinicalData();
  persist();
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function dbGet(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const hasRow = stmt.step();
  const row = hasRow ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function dbAll(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function dbRun(sql, params) {
  if (params) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
  const changes = db.getRowsModified();
  persist();
  const rows = db.exec("SELECT last_insert_rowid() AS id");
  const id = rows.length > 0 ? rows[0].values[0][0] : null;
  return {
    lastInsertRowid: id,
    changes: changes,
  };
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dob TEXT NOT NULL,
      sex TEXT NOT NULL,
      mr TEXT NOT NULL UNIQUE,
      cc TEXT NOT NULL,
      appt TEXT,
      sched TEXT,
      status TEXT DEFAULT 'waiting',
      age INTEGER DEFAULT 0,
      phone TEXT DEFAULT '—',
      ins TEXT DEFAULT '—',
      allergy TEXT DEFAULT 'None',
  bp TEXT DEFAULT '—',
  hr TEXT DEFAULT '—',
  temp TEXT DEFAULT '—',
  wt TEXT DEFAULT '—',
  is_shared INTEGER DEFAULT 0,
  profile_pic TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dose TEXT,
      freq TEXT,
      route TEXT,
      start TEXT,
      prescriber TEXT,
      type TEXT DEFAULT 'existing',
      is_shared INTEGER DEFAULT 0,
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add type column to existing medications table if it doesn't exist
  try {
    db.run('ALTER TABLE medications ADD COLUMN type TEXT DEFAULT "existing"');
  } catch (e) {
    // Column already exists, ignore error
  }
  try {
    db.run('ALTER TABLE medications ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE medications ADD COLUMN is_shared INTEGER DEFAULT 0');
  } catch (e) {}
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      name TEXT NOT NULL,
      priority TEXT DEFAULT 'Routine',
      order_date TEXT,
      status TEXT DEFAULT 'Pending',
      ordered_by TEXT,
      notes TEXT,
      is_shared INTEGER DEFAULT 0,
      result TEXT,
      result_unlocked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  // Drop and recreate problems table with annotation field
  db.run('DROP TABLE IF EXISTS problems');
  db.run(`
    CREATE TABLE problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'active',
      annotation TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      specialty TEXT NOT NULL,
      requested_date TEXT,
      status TEXT DEFAULT 'Pending',
      consultant TEXT,
      summary TEXT,
      requested_by TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS studies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      study_date TEXT,
      result TEXT,
      status TEXT DEFAULT 'Final',
      ordered_by TEXT,
      notes TEXT,
      image_data TEXT,
      is_shared INTEGER DEFAULT 0,
      result_unlocked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  // Create physician_notes table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS physician_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      chief_complaint TEXT,
      history_present_illness TEXT,
      past_medical_history TEXT,
      surgical_history TEXT,
      hospitalizations TEXT,
      health_maintenance TEXT,
      family_history TEXT,
      social_history TEXT,
      review_of_systems TEXT,
      physical_exam TEXT,
      assessment TEXT,
      plan TEXT,
      visit_type TEXT,
      visit_date TEXT,
      nursing_notes TEXT,
      medical_decision_making TEXT,
      allergies TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      created_by TEXT,
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add new columns to physician_notes table if they don't exist
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN visit_type TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN visit_date TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN nursing_notes TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN medical_decision_making TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN allergies TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}

  // Add review_of_systems column if it doesn't exist
  try {
    const columns = dbAll(`PRAGMA table_info(physician_notes)`);
    const hasColumn = columns.some(col => col.name === 'review_of_systems');
    if (!hasColumn) {
      db.run(`ALTER TABLE physician_notes ADD COLUMN review_of_systems TEXT`);
    }
  } catch (err) {
    console.error('Error checking/adding review_of_systems column:', err);
  }

  // Add edited_at column for tracking note edits
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN edited_at TEXT');
  } catch (e) {}

  // Add differential_diagnosis column
  try {
    db.run('ALTER TABLE physician_notes ADD COLUMN differential_diagnosis TEXT');
  } catch (e) {}
  db.run(`
    CREATE TABLE IF NOT EXISTS nursing_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      nurse_name TEXT,
      time TEXT,
      blood_pressure TEXT,
      heart_rate TEXT,
      temperature TEXT,
      weight TEXT,
      note TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS imaging (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      image_data TEXT,
      annotations TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS allergies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      allergen TEXT NOT NULL,
      type TEXT NOT NULL,
      reaction TEXT,
      first_encounter TEXT,
      is_shared INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create patient_locks table to track user-patient locks
  db.run(`
    CREATE TABLE IF NOT EXISTS patient_locks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      locked_at TEXT DEFAULT (datetime('now')),
      UNIQUE(patient_mr, user_id),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS interview_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      chat_data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS patient_vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      bp TEXT,
      hr TEXT,
      temp TEXT,
      wt TEXT,
      resp_rate TEXT,
      o2_sat TEXT,
      height TEXT,
      bmi TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(patient_mr, user_id),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS patient_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_mr TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      name TEXT,
      dob TEXT,
      sex TEXT,
      phone TEXT,
      ins TEXT,
      allergy TEXT,
      cc TEXT,
      appt TEXT,
      sched TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(patient_mr, user_id),
      FOREIGN KEY (patient_mr) REFERENCES patients(mr),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add columns if they don't exist (for existing databases)
  try {
    db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
  } catch (e) {}
  try {
    db.run('ALTER TABLE patients ADD COLUMN is_shared INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE orders ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE orders ADD COLUMN is_shared INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE orders ADD COLUMN result TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE orders ADD COLUMN result_unlocked INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE orders ADD COLUMN category TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE problems ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE consultations ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE consultations ADD COLUMN is_shared INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE studies ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE studies ADD COLUMN is_shared INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE studies ADD COLUMN result_unlocked INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE nursing_notes ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE imaging ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE allergies ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1');
  } catch (e) {}
  try {
    db.run('ALTER TABLE allergies ADD COLUMN is_shared INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE patients ADD COLUMN profile_pic TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE patients ADD COLUMN is_generated INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE patients ADD COLUMN resp_rate TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE patients ADD COLUMN o2_sat TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE patients ADD COLUMN height TEXT');
  } catch (e) {}
  try {
    db.run('ALTER TABLE patients ADD COLUMN bmi TEXT');
  } catch (e) {}
}

function seedData() {
  const count = dbGet('SELECT COUNT(*) AS cnt FROM patients');
  if (count && count.cnt > 0) return;

  const demoUser = dbGet('SELECT id FROM users WHERE email = ?', ['Admin@gmail.com']);
  let userId;
  if (demoUser) {
    userId = demoUser.id;
    // Update demo user to admin role
    dbRun('UPDATE users SET role = ? WHERE email = ?', ['admin', 'Admin@gmail.com']);
  } else {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('SecureP@ssw0rd!', 10);
    dbRun('INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)', ['Admin@gmail.com', hash, 'Dr. Demo', 'admin']);
    const newUser = dbGet('SELECT id FROM users WHERE email = ?', ['Admin@gmail.com']);
    userId = newUser ? newUser.id : null;
  }

  const demoPatients = [
    { name:"Carter, James",   dob:"03/14/1958", sex:"M", mr:"MR-00421", cc:"Chest pain, shortness of breath",  appt:"8:00 AM",  sched:"Dr. Smith",  status:"complete" },
    { name:"Nguyen, Linda",   dob:"07/22/1975", sex:"F", mr:"MR-00538", cc:"Follow-up hypertension",           appt:"8:30 AM",  sched:"Dr. Smith",  status:"complete" },
    { name:"Patel, Raj",      dob:"11/05/1982", sex:"M", mr:"MR-00619", cc:"Knee pain after fall",             appt:"9:00 AM",  sched:"Dr. Jones",  status:"ready"    },
    { name:"Morris, Susan",   dob:"05/30/1965", sex:"F", mr:"MR-00712", cc:"Diabetes annual review",           appt:"9:30 AM",  sched:"Dr. Smith",  status:"ready"    },
    { name:"Thompson, David", dob:"09/12/1990", sex:"M", mr:"MR-00884", cc:"Persistent cough, fever",          appt:"10:00 AM", sched:"Dr. Lee",    status:"waiting" },
    { name:"Garcia, Maria",   dob:"02/18/1978", sex:"F", mr:"MR-00933", cc:"Abdominal pain, nausea",           appt:"10:30 AM", sched:"Dr. Smith",  status:"ready"   },
    { name:"Robinson, Earl",  dob:"12/01/1950", sex:"M", mr:"MR-01045", cc:"Routine physical exam",            appt:"11:00 AM", sched:"Dr. Jones",  status:"waiting" },
    { name:"Kim, Yuna",       dob:"08/27/2001", sex:"F", mr:"MR-01102", cc:"Migraine, light sensitivity",      appt:"11:30 AM", sched:"Dr. Lee",    status:"cancelled" },
  ];

  const extra = {
    "MR-00421": { age:66, phone:"(805) 555-0121", ins:"BlueCross PPO", allergy:"Penicillin", bp:"138/88", hr:72, temp:"98.6°F", wt:"185 lbs" },
    "MR-00538": { age:49, phone:"(805) 555-0234", ins:"Aetna HMO",    allergy:"None",       bp:"142/90", hr:68, temp:"98.4°F", wt:"142 lbs" },
    "MR-00619": { age:41, phone:"(805) 555-0312", ins:"United PPO",   allergy:"Sulfa",      bp:"120/78", hr:76, temp:"98.8°F", wt:"176 lbs" },
    "MR-00712": { age:59, phone:"(805) 555-0445", ins:"Medicare",     allergy:"Aspirin",    bp:"128/82", hr:70, temp:"98.5°F", wt:"158 lbs" },
    "MR-00884": { age:33, phone:"(805) 555-0561", ins:"Cigna HMO",    allergy:"None",       bp:"118/74", hr:88, temp:"100.2°F",wt:"192 lbs" },
    "MR-00933": { age:46, phone:"(805) 555-0677", ins:"Medi-Cal",     allergy:"Codeine",    bp:"115/72", hr:82, temp:"99.1°F", wt:"134 lbs" },
    "MR-01045": { age:73, phone:"(805) 555-0789", ins:"Medicare",     allergy:"Latex",      bp:"146/92", hr:66, temp:"97.9°F", wt:"201 lbs" },
    "MR-01102": { age:22, phone:"(805) 555-0892", ins:"Covered CA",   allergy:"Ibuprofen",  bp:"110/68", hr:74, temp:"98.7°F", wt:"118 lbs" },
  };

  for (const p of demoPatients) {
    const e = extra[p.mr] || {};
    dbRun(
      `INSERT INTO patients (user_id, name, dob, sex, mr, cc, appt, sched, status, age, phone, ins, allergy, bp, hr, temp, wt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, p.name, p.dob, p.sex, p.mr, p.cc, p.appt, p.sched, p.status,
       e.age || 0, e.phone || '—', e.ins || '—', e.allergy || 'None',
       e.bp || '—', e.hr || '—', e.temp || '—', e.wt || '—']
    );
  }

  const medsData = [
    { mr:"MR-00421", name:"Lisinopril",  dose:"10mg",  freq:"Once daily",  route:"Oral", start:"01/15/2024", prescriber:"Dr. Smith", type:"existing" },
    { mr:"MR-00421", name:"Atorvastatin",dose:"20mg",  freq:"Once daily",  route:"Oral", start:"03/02/2024", prescriber:"Dr. Smith", type:"existing" },
    { mr:"MR-00421", name:"Aspirin",     dose:"81mg",  freq:"Once daily",  route:"Oral", start:"01/15/2024", prescriber:"Dr. Smith", type:"existing" },
    { mr:"MR-00538", name:"Amlodipine",  dose:"5mg",   freq:"Once daily",  route:"Oral", start:"06/10/2023", prescriber:"Dr. Smith", type:"existing" },
    { mr:"MR-00538", name:"HCTZ",        dose:"25mg",  freq:"Once daily",  route:"Oral", start:"06/10/2023", prescriber:"Dr. Smith", type:"existing" },
    { mr:"MR-00712", name:"Metformin",   dose:"500mg", freq:"Twice daily", route:"Oral", start:"11/20/2021", prescriber:"Dr. Smith", type:"existing" },
    { mr:"MR-00712", name:"Glipizide",   dose:"5mg",   freq:"Once daily",  route:"Oral", start:"02/14/2023", prescriber:"Dr. Smith", type:"existing" },
  ];

  for (const m of medsData) {
    dbRun('INSERT INTO medications (patient_mr, user_id, name, dose, freq, route, start, prescriber, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [m.mr, userId, m.name, m.dose, m.freq, m.route, m.start, m.prescriber, m.type]);
  }

  seedClinicalData();
}

function seedClinicalData() {
  const count = dbGet('SELECT COUNT(*) AS cnt FROM orders');
  if (count && count.cnt > 0) return;

  // Get the demo user ID
  const demoUser = dbGet('SELECT id FROM users WHERE email = ?', ['demo@gmail.com']);
  const userId = demoUser ? demoUser.id : 1;

  const ordersData = [
    { mr:"MR-00421", type:"labs",     name:"CBC",              priority:"STAT",    order_date:"06/01/2026", status:"Completed", ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00421", type:"labs",     name:"Troponin",         priority:"STAT",    order_date:"06/01/2026", status:"Completed", ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00421", type:"imaging",  name:"Chest X-Ray",      priority:"STAT",    order_date:"06/01/2026", status:"Completed", ordered_by:"Dr. Smith", notes:"PA and lateral" },
    { mr:"MR-00421", type:"consults", name:"Cardiology",       priority:"Urgent",  order_date:"06/02/2026", status:"Pending",   ordered_by:"Dr. Smith", notes:"Chest pain workup" },
    { mr:"MR-00538", type:"labs",     name:"BMP",              priority:"Routine", order_date:"06/05/2026", status:"Completed", ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00538", type:"labs",     name:"Lipid Panel",      priority:"Routine", order_date:"06/05/2026", status:"Pending",   ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00619", type:"imaging",  name:"X-Ray Knee",       priority:"Routine", order_date:"06/08/2026", status:"Pending",   ordered_by:"Dr. Jones", notes:"Right knee" },
    { mr:"MR-00712", type:"labs",     name:"HbA1c",            priority:"Routine", order_date:"06/07/2026", status:"Completed", ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00884", type:"labs",     name:"CBC",              priority:"Routine", order_date:"06/09/2026", status:"Pending",   ordered_by:"Dr. Lee",   notes:"" },
    { mr:"MR-00884", type:"imaging",  name:"Chest X-Ray",      priority:"Routine", order_date:"06/09/2026", status:"Pending",   ordered_by:"Dr. Lee",   notes:"" },
  ];

  for (const o of ordersData) {
    dbRun(
      'INSERT INTO orders (patient_mr, user_id, type, name, priority, order_date, status, ordered_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [o.mr, userId, o.type, o.name, o.priority, o.order_date, o.status, o.ordered_by, o.notes]
    );
  }

  const problemsData = [
    { mr:"MR-00421", name:"Hypertension",           category:"Cardiovascular",   status:"active" },
    { mr:"MR-00421", name:"Hyperlipidemia",         category:"Cardiovascular",   status:"active" },
    { mr:"MR-00421", name:"Coronary Artery Disease",category:"Cardiovascular",   status:"active" },
    { mr:"MR-00538", name:"Hypertension",           category:"Cardiovascular",   status:"active" },
    { mr:"MR-00712", name:"Type 2 Diabetes",        category:"Endocrine",        status:"active" },
    { mr:"MR-00712", name:"Obesity",                category:"Endocrine",        status:"active" },
    { mr:"MR-01102", name:"Migraine",               category:"Neurological",     status:"active" },
  ];

  for (const prob of problemsData) {
    dbRun(
      'INSERT INTO problems (patient_mr, user_id, name, category, status) VALUES (?, ?, ?, ?, ?)',
      [prob.mr, userId, prob.name, prob.category, prob.status]
    );
  }

  const consultsData = [
    { mr:"MR-00421", specialty:"Cardiology",       requested_date:"06/02/2026", status:"Pending",   consultant:"Dr. Williams", summary:"Evaluate chest pain and abnormal EKG", requested_by:"Dr. Smith" },
    { mr:"MR-00619", specialty:"Orthopedics",      requested_date:"06/08/2026", status:"Pending",   consultant:"Dr. Chen",     summary:"Right knee injury after fall",         requested_by:"Dr. Jones" },
    { mr:"MR-00712", specialty:"Endocrinology",    requested_date:"05/15/2026", status:"Completed", consultant:"Dr. Patel",    summary:"Diabetes management — A1c 7.2%, adjust regimen", requested_by:"Dr. Smith" },
    { mr:"MR-00933", specialty:"Gastroenterology", requested_date:"06/09/2026", status:"Pending",   consultant:"Dr. Rivera",   summary:"Abdominal pain and nausea workup",     requested_by:"Dr. Smith" },
  ];

  for (const c of consultsData) {
    dbRun(
      'INSERT INTO consultations (patient_mr, user_id, specialty, requested_date, status, consultant, summary, requested_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [c.mr, userId, c.specialty, c.requested_date, c.status, c.consultant, c.summary, c.requested_by]
    );
  }

  const studiesData = [
    { mr:"MR-00421", name:"EKG",              study_date:"06/01/2026", result:"Sinus rhythm, no acute ST changes", status:"Final",   ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00421", name:"Echocardiogram",   study_date:"06/03/2026", result:"EF 55%, mild LVH",                  status:"Final",   ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00538", name:"EKG",              study_date:"06/05/2026", result:"Normal sinus rhythm",               status:"Final",   ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-00712", name:"Diabetic Eye Exam",study_date:"04/10/2026", result:"No diabetic retinopathy",         status:"Final",   ordered_by:"Dr. Smith", notes:"" },
    { mr:"MR-01045", name:"PFT",              study_date:"06/09/2026", result:"",                                  status:"Pending", ordered_by:"Dr. Jones", notes:"Scheduled" },
  ];

  for (const s of studiesData) {
    dbRun(
      'INSERT INTO studies (patient_mr, user_id, name, study_date, result, status, ordered_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [s.mr, userId, s.name, s.study_date, s.result, s.status, s.ordered_by, s.notes]
    );
  }
}

module.exports = { initDb, getDb, dbGet, dbAll, dbRun };
