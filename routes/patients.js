const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, dbGet, dbAll, dbRun } = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

let genAI = null;
try {
  const { GoogleGenAI } = require('@google/genai');
  genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn('GEMINI_API_KEY not set. AI interview feature will be unavailable.');
}

const allCases = require('../cases/index');

const router = express.Router();

function calculateAge(dob) {
  if (!dob) return null;
  let birth;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    birth = new Date(dob + 'T00:00:00');
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dob)) {
    const [m, d, y] = dob.split('/');
    birth = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  } else {
    return null;
  }
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

// ── Bulk access status for all patients (must be before /:mr routes) ──
router.get('/access-status-all', requireAuth, (req, res) => {
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role === 'admin') {
    return res.json({});
  }

  const patients = dbAll(
    'SELECT mr, password_hash FROM patients WHERE user_id = ? OR is_shared = 1',
    [req.session.userId]
  );

  const result = {};
  for (const p of patients) {
    if (p.password_hash) {
      const access = dbGet(
        'SELECT id FROM student_patient_access WHERE user_id = ? AND patient_mr = ?',
        [req.session.userId, p.mr]
      );
      result[p.mr] = { hasPassword: true, isUnlocked: !!access };
    } else {
      result[p.mr] = { hasPassword: false, isUnlocked: true };
    }
  }
  res.json(result);
});

function getPatientForUser(mr, userId) {
  getDb();
  return dbGet('SELECT * FROM patients WHERE mr = ? AND (user_id = ? OR is_shared = 1)', [mr, userId]);
}

function getPatientClinicalData(mr, userId) {
  const user = dbGet('SELECT role FROM users WHERE id = ?', [userId]);
  const isAdmin = user && user.role === 'admin';

  // Check if patient is locked for this user (student has generated report)
  const patientLocked = isPatientLocked(mr, userId);

  // For orders (labs):
  // - Admin sees all shared orders with results
  // - Students see their own orders PLUS shared admin orders; own results hidden until report generated
  let ordersQuery;
  if (isAdmin) {
    ordersQuery = 'SELECT * FROM orders WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC';
  } else if (patientLocked) {
    ordersQuery = 'SELECT id, patient_mr, user_id, type, category, name, priority, order_date, status, ordered_by, notes, is_shared, result_unlocked, created_at, CASE WHEN is_shared = 1 THEN result WHEN result_unlocked = 1 THEN result ELSE NULL END as result FROM orders WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC';
  } else {
    ordersQuery = 'SELECT id, patient_mr, user_id, type, category, name, priority, order_date, status, ordered_by, notes, is_shared, result_unlocked, created_at, CASE WHEN is_shared = 1 THEN result ELSE NULL END as result FROM orders WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC';
  }

  // For studies:
  // - Admin sees all shared studies
  // - Students see their own studies PLUS shared admin studies; own results hidden until report generated
  let studiesQuery;
  if (isAdmin) {
    studiesQuery = 'SELECT * FROM studies WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC';
  } else if (patientLocked) {
    studiesQuery = 'SELECT id, patient_mr, user_id, name, study_date, status, ordered_by, notes, image_data, is_shared, result_unlocked, created_at, CASE WHEN is_shared = 1 THEN result WHEN result_unlocked = 1 THEN result ELSE NULL END as result FROM studies WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC';
  } else {
    studiesQuery = 'SELECT id, patient_mr, user_id, name, study_date, status, ordered_by, notes, image_data, is_shared, result_unlocked, created_at, CASE WHEN is_shared = 1 THEN result ELSE NULL END as result FROM studies WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC';
  }

  return {
    medications: dbAll('SELECT * FROM medications WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id', [mr, userId]),
    orders: dbAll(ordersQuery, [mr, userId]),
    problems: dbAll('SELECT * FROM problems WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id', [mr, userId]),
    consultations: dbAll('SELECT * FROM consultations WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC', [mr, userId]),
    studies: dbAll(studiesQuery, [mr, userId]),
    physicianNotes: dbAll('SELECT * FROM physician_notes WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC', [mr, userId]),
    nursingNotes: dbAll('SELECT * FROM nursing_notes WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC', [mr, userId]),
    imaging: dbAll('SELECT * FROM imaging WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC', [mr, userId]),
    allergies: dbAll('SELECT * FROM allergies WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id', [mr, userId]),
  };
}

function isPatientLocked(mr, userId) {
  const lock = dbGet('SELECT id FROM patient_locks WHERE patient_mr = ? AND user_id = ?', [mr, userId]);
  return !!lock;
}

router.get('/', requireAuth, (req, res) => {
  getDb();
  // Get user's own patients plus shared patients from admins
  const patients = dbAll(`
    SELECT *, (password_hash IS NOT NULL) AS has_password FROM patients
    WHERE user_id = ? OR is_shared = 1
    ORDER BY id
  `, [req.session.userId]);
  // Strip password_hash from response and auto-calculate age from DOB
  const safe = patients.map(p => {
    const { password_hash, ...rest } = p;
    rest.age = calculateAge(rest.dob);
    return rest;
  });
  res.json(safe);
});

router.post('/', requireAdmin, (req, res) => {
  const { name, dob, sex, cc, appt } = req.body;
  if (!name || !dob || !cc) {
    return res.status(400).json({ error: 'Name, DOB, and Chief Complaint are required.' });
  }

  const mr = 'MR-' + String(Math.floor(Math.random() * 90000) + 10000);
  const apptFmt = appt || 'TBD';
  getDb();
  const displayName = req.session.displayName || req.session.username;

  // Check if user is admin to mark patient as shared
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  const isShared = user && user.role === 'admin' ? 1 : 0;

  dbRun(
    `INSERT INTO patients (user_id, name, dob, sex, mr, cc, appt, sched, status, is_shared)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?)`,
    [req.session.userId, name, dob, sex, mr, cc, apptFmt, displayName, isShared]
  );

  const patient = dbGet('SELECT * FROM patients WHERE mr = ?', [mr]);
  res.status(201).json(patient);
});

router.post('/:mr/medications', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { name, dose, freq, route, start, prescriber, type } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Medication name is required.' });
  }

  const result = dbRun(
    'INSERT INTO medications (patient_mr, user_id, name, dose, freq, route, start, prescriber, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, name, dose || '', freq || '', route || '', start || '', prescriber || '', type || 'existing']
  );

  const medication = dbGet('SELECT * FROM medications WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(medication);
});

router.delete('/:mr/medications/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM medications WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Medication not found' });
  res.json({ success: true });
});

router.post('/:mr/orders', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { type, category, name, priority, order_date, status, notes, result: resultValue } = req.body;
  if (!type || !name) {
    return res.status(400).json({ error: 'Order type and name are required.' });
  }

  // Admin's orders are shared so students can match against them
  const isAdminUser = user && user.role === 'admin';
  const isShared = isAdminUser ? 1 : 0;
  // Only admin can set results; non-admin always gets empty result
  const finalResult = isAdminUser ? (resultValue || '') : '';
  // If admin sets a result, it's immediately unlocked (visible to admin, used for matching)
  const unlocked = finalResult ? 1 : 0;

  const orderedBy = req.session.displayName || req.session.username;
  const insertResult = dbRun(
    'INSERT INTO orders (patient_mr, user_id, type, category, name, priority, order_date, status, ordered_by, notes, is_shared, result, result_unlocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, type, category || null, name, priority || 'Routine', order_date || null, status || 'Pending', orderedBy, notes || '', isShared, finalResult, unlocked]
  );

  const order = dbGet('SELECT * FROM orders WHERE id = ?', [insertResult.lastInsertRowid]);
  res.status(201).json(order);
});

router.delete('/:mr/orders/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM orders WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true });
});

router.post('/:mr/problems', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { name, category, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Problem name is required.' });

  const existing = dbGet('SELECT id FROM problems WHERE patient_mr = ? AND name = ? AND user_id = ?', [req.params.mr, name, req.session.userId]);
  if (existing) return res.status(409).json({ error: 'Problem already on list.' });

  const result = dbRun(
    'INSERT INTO problems (patient_mr, user_id, name, category, status) VALUES (?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, name, category || 'Other', status || 'active']
  );

  const problem = dbGet('SELECT * FROM problems WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(problem);
});

router.delete('/:mr/problems/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM problems WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Problem not found' });
  res.json({ success: true });
});

router.delete('/:mr/problems', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  dbRun('DELETE FROM problems WHERE patient_mr = ?', [req.params.mr]);
  res.json({ success: true });
});

router.post('/:mr/consultations', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { specialty, requested_date, status, consultant, summary } = req.body;
  if (!specialty) return res.status(400).json({ error: 'Specialty is required.' });

  const requestedBy = req.session.displayName || req.session.username;
  const result = dbRun(
    'INSERT INTO consultations (patient_mr, user_id, specialty, requested_date, status, consultant, summary, requested_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, specialty, requested_date || null, status || 'Pending', consultant || '', summary || '', requestedBy]
  );

  const consultation = dbGet('SELECT * FROM consultations WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(consultation);
});

router.delete('/:mr/consultations/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM consultations WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Consultation not found' });
  res.json({ success: true });
});

router.post('/:mr/studies', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { name, study_date, result, status, notes, image_data } = req.body;
  if (!name) return res.status(400).json({ error: 'Study name is required.' });

  const isAdminUser = user && user.role === 'admin';
  const isShared = isAdminUser ? 1 : 0;
  const finalResult = isAdminUser ? (result || '') : '';
  const unlocked = finalResult ? 1 : 0;

  const orderedBy = req.session.displayName || req.session.username;
  const studyResult = dbRun(
    'INSERT INTO studies (patient_mr, user_id, name, study_date, result, status, ordered_by, notes, image_data, is_shared, result_unlocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, name, study_date || null, finalResult, status || 'Pending', orderedBy, notes || '', image_data || '', isShared, unlocked]
  );

  const study = dbGet('SELECT * FROM studies WHERE id = ?', [studyResult.lastInsertRowid]);
  res.status(201).json(study);
});

router.delete('/:mr/studies/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM studies WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Study not found' });
  res.json({ success: true });
});

router.get('/:mr', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const clinical = getPatientClinicalData(req.params.mr, req.session.userId);

  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  const isAdmin = user && user.role === 'admin';

  let userVitals = null;
  let userOverrides = null;
  if (!isAdmin) {
    userVitals = dbGet('SELECT * FROM patient_vitals WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
    userOverrides = dbGet('SELECT * FROM patient_overrides WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
  }

  const result = { ...patient, ...clinical };
  if (userOverrides) {
    if (userOverrides.name) result.name = userOverrides.name;
    if (userOverrides.dob) result.dob = userOverrides.dob;
    if (userOverrides.sex) result.sex = userOverrides.sex;
    if (userOverrides.phone) result.phone = userOverrides.phone;
    if (userOverrides.ins) result.ins = userOverrides.ins;
    if (userOverrides.allergy) result.allergy = userOverrides.allergy;
    if (userOverrides.cc) result.cc = userOverrides.cc;
    if (userOverrides.appt) result.appt = userOverrides.appt;
    if (userOverrides.sched) result.sched = userOverrides.sched;
  }
  if (userVitals) {
    if (userVitals.bp) result.bp = userVitals.bp;
    if (userVitals.hr) result.hr = userVitals.hr;
    if (userVitals.temp) result.temp = userVitals.temp;
    if (userVitals.wt) result.wt = userVitals.wt;
    if (userVitals.resp_rate) result.resp_rate = userVitals.resp_rate;
    if (userVitals.o2_sat) result.o2_sat = userVitals.o2_sat;
    if (userVitals.height) result.height = userVitals.height;
    if (userVitals.bmi) result.bmi = userVitals.bmi;
  }

  result.age = calculateAge(result.dob);

  res.json(result);
});

router.put('/:mr', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { name, dob, age, sex, cc, appt, status, phone, ins, allergy, bp, hr, temp, wt, resp_rate, o2_sat, height, bmi } = req.body;

  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  const isAdmin = user && user.role === 'admin';

  if (isAdmin) {
    dbRun(
      `UPDATE patients SET
        name = COALESCE(?, name),
        dob = COALESCE(?, dob),
        age = COALESCE(?, age),
        sex = COALESCE(?, sex),
        cc = COALESCE(?, cc),
        appt = COALESCE(?, appt),
        status = COALESCE(?, status),
        phone = COALESCE(?, phone),
        ins = COALESCE(?, ins),
        allergy = COALESCE(?, allergy),
        bp = COALESCE(?, bp),
        hr = COALESCE(?, hr),
        temp = COALESCE(?, temp),
        wt = COALESCE(?, wt),
        resp_rate = COALESCE(?, resp_rate),
        o2_sat = COALESCE(?, o2_sat),
        height = COALESCE(?, height),
        bmi = COALESCE(?, bmi),
        updated_at = datetime('now')
      WHERE mr = ?`,
      [name || null, dob || null, age || null, sex || null, cc || null, appt || null, status || null,
       phone || null, ins || null, allergy || null, bp || null, hr || null, temp || null, wt || null,
       resp_rate || null, o2_sat || null, height || null, bmi || null,
       req.params.mr]
    );
  } else {
    // Save patient info overrides (name, dob, sex, etc.) per-user
    dbRun(
      `INSERT INTO patient_overrides (patient_mr, user_id, name, dob, sex, phone, ins, allergy, cc, appt, sched, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(patient_mr, user_id) DO UPDATE SET
         name = COALESCE(?, name),
         dob = COALESCE(?, dob),
         sex = COALESCE(?, sex),
         phone = COALESCE(?, phone),
         ins = COALESCE(?, ins),
         allergy = COALESCE(?, allergy),
         cc = COALESCE(?, cc),
         appt = COALESCE(?, appt),
         sched = COALESCE(?, sched),
         updated_at = datetime('now')`,
      [req.params.mr, req.session.userId,
       name || null, dob || null, sex || null, phone || null, ins || null, allergy || null, cc || null, appt || null, req.body.sched || null,
       name || null, dob || null, sex || null, phone || null, ins || null, allergy || null, cc || null, appt || null, req.body.sched || null]
    );

    // Save vitals overrides per-user
    if (bp || hr || temp || wt || resp_rate || o2_sat || height || bmi) {
      dbRun(
        `INSERT INTO patient_vitals (patient_mr, user_id, bp, hr, temp, wt, resp_rate, o2_sat, height, bmi, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(patient_mr, user_id) DO UPDATE SET
           bp = COALESCE(?, bp),
           hr = COALESCE(?, hr),
           temp = COALESCE(?, temp),
           wt = COALESCE(?, wt),
           resp_rate = COALESCE(?, resp_rate),
           o2_sat = COALESCE(?, o2_sat),
           height = COALESCE(?, height),
           bmi = COALESCE(?, bmi),
           updated_at = datetime('now')`,
        [req.params.mr, req.session.userId,
         bp || null, hr || null, temp || null, wt || null, resp_rate || null, o2_sat || null, height || null, bmi || null,
         bp || null, hr || null, temp || null, wt || null, resp_rate || null, o2_sat || null, height || null, bmi || null]
      );
    }

    // Save age directly to patients table (not in overrides table)
    if (age != null) {
      dbRun('UPDATE patients SET age = ? WHERE mr = ?', [age, req.params.mr]);
    }
  }

  const updated = dbGet('SELECT * FROM patients WHERE mr = ?', [req.params.mr]);

  if (!isAdmin) {
    const uv = dbGet('SELECT * FROM patient_vitals WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
    const uo = dbGet('SELECT * FROM patient_overrides WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
    if (uo) {
      if (uo.name) updated.name = uo.name;
      if (uo.dob) updated.dob = uo.dob;
      if (uo.sex) updated.sex = uo.sex;
      if (uo.phone) updated.phone = uo.phone;
      if (uo.ins) updated.ins = uo.ins;
      if (uo.allergy) updated.allergy = uo.allergy;
      if (uo.cc) updated.cc = uo.cc;
      if (uo.appt) updated.appt = uo.appt;
      if (uo.sched) updated.sched = uo.sched;
    }
    if (uv) {
      if (uv.bp) updated.bp = uv.bp;
      if (uv.hr) updated.hr = uv.hr;
      if (uv.temp) updated.temp = uv.temp;
      if (uv.wt) updated.wt = uv.wt;
      if (uv.resp_rate) updated.resp_rate = uv.resp_rate;
      if (uv.o2_sat) updated.o2_sat = uv.o2_sat;
      if (uv.height) updated.height = uv.height;
      if (uv.bmi) updated.bmi = uv.bmi;
    }
  }

  updated.age = calculateAge(updated.dob);

  res.json(updated);
});

router.put('/:mr/profile-pic', requireAuth, (req, res) => {
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admin can change profile picture' });
  }
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const { profile_pic } = req.body;
  dbRun('UPDATE patients SET profile_pic = ?, updated_at = datetime(\'now\') WHERE mr = ?', [profile_pic || null, req.params.mr]);
  res.json({ success: true, profile_pic });
});

router.delete('/:mr', requireAdmin, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const mr = req.params.mr;
  dbRun('DELETE FROM medications WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM orders WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM problems WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM consultations WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM studies WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM physician_notes WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM nursing_notes WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM imaging WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM allergies WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM patient_locks WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM interview_history WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM student_patient_access WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM patients WHERE mr = ?', [mr]);
  res.json({ success: true });
});

router.delete('/:mr/generate-only', requireAuth, (req, res) => {
  const mr = req.params.mr;
  const patient = dbGet('SELECT * FROM patients WHERE mr = ? AND user_id = ? AND is_generated = 1', [mr, req.session.userId]);
  if (!patient) {
    return res.status(403).json({ error: 'Can only delete AI-generated cases. Seed/demo patients cannot be deleted by non-admin users.' });
  }

  dbRun('DELETE FROM medications WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM orders WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM problems WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM consultations WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM studies WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM physician_notes WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM nursing_notes WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM imaging WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM allergies WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM patient_locks WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM interview_history WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM student_patient_access WHERE patient_mr = ?', [mr]);
  dbRun('DELETE FROM patients WHERE mr = ? AND user_id = ?', [mr, req.session.userId]);
  console.log(`[delete-case] User ${req.session.userId} deleted generated case ${mr}`);
  res.json({ success: true });
});

router.get('/:mr/lock-status', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const lock = dbGet('SELECT id FROM patient_locks WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
  res.json({ locked: !!lock });
});

router.post('/:mr/lock', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if already locked
  const existingLock = dbGet('SELECT id FROM patient_locks WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
  if (existingLock) return res.status(400).json({ error: 'Patient already locked' });

  dbRun('INSERT INTO patient_locks (patient_mr, user_id) VALUES (?, ?)', [req.params.mr, req.session.userId]);
  res.json({ success: true });
});

// ── Patient Password (admin sets, student verifies) ──
router.post('/:mr/password', requireAdmin, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { password } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    dbRun('UPDATE patients SET password_hash = ? WHERE mr = ?', [hash, req.params.mr]);
  } else {
    dbRun('UPDATE patients SET password_hash = NULL WHERE mr = ?', [req.params.mr]);
  }
  res.json({ success: true, hasPassword: !!password });
});

router.post('/:mr/verify-password', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role === 'admin') {
    return res.json({ success: true, unlocked: true });
  }

  if (!patient.password_hash) {
    return res.json({ success: true, unlocked: true });
  }

  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }

  if (!bcrypt.compareSync(password, patient.password_hash)) {
    return res.status(401).json({ success: false, error: 'Incorrect password' });
  }

  // Grant permanent access
  dbRun(
    'INSERT OR IGNORE INTO student_patient_access (user_id, patient_mr) VALUES (?, ?)',
    [req.session.userId, req.params.mr]
  );
  res.json({ success: true, unlocked: true });
});

router.get('/:mr/access-status', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const hasPassword = !!patient.password_hash;
  let isUnlocked = true;

  if (hasPassword) {
    const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
    if (user && user.role === 'admin') {
      isUnlocked = true;
    } else {
      const access = dbGet(
        'SELECT id FROM student_patient_access WHERE user_id = ? AND patient_mr = ?',
        [req.session.userId, req.params.mr]
      );
      isUnlocked = !!access;
    }
  }

  res.json({ hasPassword, isUnlocked });
});

// Alias-to-canonical map for lab test names (so student-ordered "CBC" matches parsed "CBC" etc.)
const LAB_NAME_ALIASES = {
  'cbc': 'CBC', 'cbc with differential': 'CBC', 'wbc': 'WBC', 'white blood cell count': 'WBC', 'rbc': 'RBC', 'red blood cell count': 'RBC',
  'hemoglobin': 'Hgb', 'hgb': 'Hgb', 'hgb/hct': 'Hgb', 'hematocrit': 'Hct', 'hct': 'Hct',
  'platelets': 'Platelets', 'platelet count': 'Platelets', 'pit': 'Platelets', 'plt': 'Platelets',
  'sodium (na+)': 'Na', 'na': 'Na', 'potassium (k+)': 'K', 'k': 'K', 'chloride (cl-)': 'Cl', 'cl': 'Cl',
  'bicarbonate (hco3-)': 'CO2', 'co2': 'CO2',
  'glucose': 'Glu', 'glu': 'Glu', 'bun': 'BUN', 'urea nitrogen (bun)': 'BUN',
  'creatinine': 'Cr', 'cr': 'Cr',
  'ast (sgot)': 'AST', 'ast': 'AST', 'alt (sgpt)': 'ALT', 'alt': 'ALT',
  'alkaline phosphatase': 'Alk Phos', 'alk phos': 'Alk Phos',
  'lipase': 'Lipase', 'amylase': 'Amylase', 'ldh': 'LDH',
  'calcium': 'Ca', 'ca': 'Ca', 'magnesium': 'Mag', 'mag': 'Mag',
  'inr': 'INR', 'pt/inr': 'INR', 'pt': 'PT', 'ptt': 'PTT',
  'd-dimer': 'D-dimer', 'fibrinogen': 'Fibrinogen', 'hba1c': 'HbA1c', 'hemoglobin a1c': 'HbA1c',
  'tsh': 'TSH', 'free t4': 'Free T4', 'cortisol': 'Cortisol',
  'urinalysis': 'UA', 'ua': 'UA',
  'bmp (basic metabolic panel)': 'BMP', 'bmp': 'BMP',
  'cmp (comprehensive metabolic panel)': 'CMP', 'cmp': 'CMP',
  'liver function panel': 'LFTs', 'lfts': 'LFTs',
  'lipid panel': 'Lipid Panel',
  'ferritin': 'Ferritin', 'vitamin b12': 'Vitamin B12', 'folate': 'Folate',
  'crp': 'CRP', 'esr': 'ESR',
  'blood culture': 'Blood Culture', 'urine culture': 'Urine Culture',
  'hiv test': 'HIV Test', 'aborh type': 'ABORH Type'
};

function normalizeLabName(name) {
  if (!name) return name;
  const lower = name.trim().toLowerCase();
  return LAB_NAME_ALIASES[lower] || name.trim();
}

router.post('/:mr/unlock-results', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if user is admin (admin doesn't need to unlock)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role === 'admin') {
    return res.json({ success: true, message: 'Admin always sees results' });
  }

  // Unlock all lab orders for this user - match by normalized name against admin's shared orders
  const orders = dbAll('SELECT id, name FROM orders WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
  for (const order of orders) {
    const normalized = normalizeLabName(order.name);
    // Try exact match first, then normalized match
    let sharedOrder = dbGet('SELECT result FROM orders WHERE patient_mr = ? AND name = ? AND is_shared = 1 LIMIT 1', [req.params.mr, order.name]);
    if ((!sharedOrder || !sharedOrder.result) && normalized !== order.name) {
      sharedOrder = dbGet('SELECT result FROM orders WHERE patient_mr = ? AND name = ? AND is_shared = 1 LIMIT 1', [req.params.mr, normalized]);
    }
    if (sharedOrder && sharedOrder.result) {
      dbRun('UPDATE orders SET result = ?, result_unlocked = 1, status = ? WHERE id = ?', [sharedOrder.result, 'Completed', order.id]);
    } else {
      // No matching admin result — mark as Not Indicated
      dbRun('UPDATE orders SET result = ?, result_unlocked = 1, status = ? WHERE id = ?', ['Not Indicated', 'Completed', order.id]);
    }
  }

  // Unlock all imaging studies for this user - only if they match admin's studies
  const studies = dbAll('SELECT id, name FROM studies WHERE patient_mr = ? AND user_id = ?', [req.params.mr, req.session.userId]);
  for (const study of studies) {
    // Get the actual result from the shared study (admin's study) - exact name match
    const sharedStudy = dbGet('SELECT result FROM studies WHERE patient_mr = ? AND name = ? AND is_shared = 1 LIMIT 1', [req.params.mr, study.name]);
    if (sharedStudy && sharedStudy.result) {
      dbRun('UPDATE studies SET result = ?, result_unlocked = 1 WHERE id = ?', [sharedStudy.result, study.id]);
    }
    // If no matching admin study found, don't unlock - student won't see this result
  }

  res.json({ success: true, message: 'Results unlocked' });
});

router.post('/:mr/physician-notes', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const {
    chief_complaint,
    history_present_illness,
    past_medical_history,
    phq2_screening,
    surgical_history,
    hospitalizations,
    gynecological_obstetric_history,
    health_maintenance,
    advanced_directive,
    family_history,
    social_history,
    review_of_systems,
    physical_exam,
    assessment,
    differential_diagnosis,
    plan
  } = req.body;
  const createdBy = req.session.displayName || req.session.username;

  const isAdminUser = user && user.role === 'admin';
  const isShared = isAdminUser ? 1 : 0;

  const result = dbRun(
    'INSERT INTO physician_notes (patient_mr, user_id, chief_complaint, history_present_illness, past_medical_history, phq2_screening, surgical_history, hospitalizations, gynecological_obstetric_history, health_maintenance, advanced_directive, family_history, social_history, review_of_systems, physical_exam, assessment, differential_diagnosis, plan, created_by, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, chief_complaint || '', history_present_illness || '', past_medical_history || '', phq2_screening || '', surgical_history || '', hospitalizations || '', gynecological_obstetric_history || '', health_maintenance || '', advanced_directive || '', family_history || '', social_history || '', review_of_systems || '', physical_exam || '', assessment || '', differential_diagnosis || '', plan || '', createdBy, isShared]
  );

  const note = dbGet('SELECT * FROM physician_notes WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(note);
});

router.put('/:mr/physician-notes/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const {
    chief_complaint,
    history_present_illness,
    past_medical_history,
    phq2_screening,
    surgical_history,
    hospitalizations,
    gynecological_obstetric_history,
    health_maintenance,
    advanced_directive,
    family_history,
    social_history,
    review_of_systems,
    physical_exam,
    assessment,
    differential_diagnosis,
    plan
  } = req.body;

  const result = dbRun(
    `UPDATE physician_notes SET
      chief_complaint = COALESCE(?, chief_complaint),
      history_present_illness = COALESCE(?, history_present_illness),
      past_medical_history = COALESCE(?, past_medical_history),
      phq2_screening = COALESCE(?, phq2_screening),
      surgical_history = COALESCE(?, surgical_history),
      hospitalizations = COALESCE(?, hospitalizations),
      gynecological_obstetric_history = COALESCE(?, gynecological_obstetric_history),
      health_maintenance = COALESCE(?, health_maintenance),
      advanced_directive = COALESCE(?, advanced_directive),
      family_history = COALESCE(?, family_history),
      social_history = COALESCE(?, social_history),
      review_of_systems = COALESCE(?, review_of_systems),
      physical_exam = COALESCE(?, physical_exam),
      assessment = COALESCE(?, assessment),
      differential_diagnosis = COALESCE(?, differential_diagnosis),
      plan = COALESCE(?, plan),
      edited_at = datetime('now')
    WHERE id = ? AND patient_mr = ?`,
    [chief_complaint, history_present_illness, past_medical_history, phq2_screening, surgical_history,
     hospitalizations, gynecological_obstetric_history, health_maintenance, advanced_directive, family_history, social_history,
     review_of_systems, physical_exam, assessment, differential_diagnosis, plan,
     req.params.id, req.params.mr]
  );

  if (result.changes === 0) return res.status(404).json({ error: 'Physician note not found' });

  const note = dbGet('SELECT * FROM physician_notes WHERE id = ?', [req.params.id]);
  res.json(note);
});

router.post('/:mr/nursing-notes', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { nurse_name, time, blood_pressure, heart_rate, temperature, weight, note } = req.body;

  const result = dbRun(
    'INSERT INTO nursing_notes (patient_mr, user_id, nurse_name, time, blood_pressure, heart_rate, temperature, weight, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, nurse_name || '', time || '', blood_pressure || '', heart_rate || '', temperature || '', weight || '', note || '']
  );

  const nursingNote = dbGet('SELECT * FROM nursing_notes WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(nursingNote);
});

router.delete('/:mr/physician-notes/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM physician_notes WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Physician note not found' });
  res.json({ success: true });
});

router.delete('/:mr/nursing-notes/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM nursing_notes WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Nursing note not found' });
  res.json({ success: true });
});

router.post('/:mr/imaging', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { label, image_data, annotations } = req.body;
  if (!label) {
    return res.status(400).json({ error: 'Label is required.' });
  }

  const isAdminUser = user && user.role === 'admin';
  const isShared = isAdminUser ? 1 : 0;

  const result = dbRun(
    'INSERT INTO imaging (patient_mr, user_id, label, image_data, annotations, is_shared) VALUES (?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, label, image_data || '', annotations || '', isShared]
  );

  const imaging = dbGet('SELECT * FROM imaging WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(imaging);
});

router.delete('/:mr/imaging/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM imaging WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Imaging not found' });
  res.json({ success: true });
});

router.post('/:mr/allergies', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  // Check if patient is locked (admin can bypass)
  const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (user && user.role !== 'admin' && isPatientLocked(req.params.mr, req.session.userId)) {
    return res.status(403).json({ error: 'Patient is locked. Cannot make changes after generating report.' });
  }

  const { allergen, type, reaction, first_encounter } = req.body;
  if (!allergen || !type) {
    return res.status(400).json({ error: 'Allergen and type are required.' });
  }

  const result = dbRun(
    'INSERT INTO allergies (patient_mr, user_id, allergen, type, reaction, first_encounter) VALUES (?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, allergen, type, reaction || '', first_encounter || '']
  );

  const allergy = dbGet('SELECT * FROM allergies WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(allergy);
});

router.delete('/:mr/allergies/:id', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const result = dbRun('DELETE FROM allergies WHERE id = ? AND patient_mr = ?', [req.params.id, req.params.mr]);
  if (result.changes === 0) return res.status(404).json({ error: 'Allergy not found' });
  res.json({ success: true });
});

// Status update routes
router.put('/:mr/status', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  dbRun('UPDATE patients SET status = ?, updated_at = datetime(\'now\') WHERE mr = ? AND user_id = ?', [status, req.params.mr, req.session.userId]);
  const updated = dbGet('SELECT * FROM patients WHERE mr = ?', [req.params.mr]);
  res.json(updated);
});

router.put('/:mr/orders/:id/status', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  dbRun('UPDATE orders SET status = ? WHERE id = ? AND patient_mr = ?', [status, req.params.id, req.params.mr]);
  const updated = dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.put('/:mr/consultations/:id/status', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  dbRun('UPDATE consultations SET status = ? WHERE id = ? AND patient_mr = ?', [status, req.params.id, req.params.mr]);
  const updated = dbGet('SELECT * FROM consultations WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.put('/:mr/studies/:id/status', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  dbRun('UPDATE studies SET status = ? WHERE id = ? AND patient_mr = ?', [status, req.params.id, req.params.mr]);
  const updated = dbGet('SELECT * FROM studies WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.put('/:mr/problems/:id/status', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { status, annotation } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  dbRun('UPDATE problems SET status = ?, annotation = ? WHERE id = ? AND patient_mr = ?', [status, annotation || '', req.params.id, req.params.mr]);
  const updated = dbGet('SELECT * FROM problems WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// Generate a random case and create a NEW patient with it
router.post('/generate-case', requireAuth, (req, res) => {
  getDb();
  const userId = req.session.userId;
  const specialty = req.body.specialty || 'any';

  const filteredCases = specialty === 'any'
    ? allCases
    : allCases.filter(c => c.specialty === specialty);

  if (!filteredCases.length) {
    console.log(`[generate-case] No cases found for specialty: ${specialty}. Total loaded: ${allCases.length}, Specialties: ${[...new Set(allCases.map(c => c.specialty))].join(', ')}`);
    return res.status(404).json({ error: 'No cases found for specialty: ' + specialty });
  }

  const caseData = filteredCases[Math.floor(Math.random() * filteredCases.length)];
  const p = caseData.patient;
  const isShared = 1;

  // Generate MR number and ensure it's unique
  let mr = 'MR-' + String(Math.floor(Math.random() * 90000) + 10000);
  let existing = dbGet('SELECT id FROM patients WHERE mr = ?', [mr]);
  while (existing) {
    mr = 'MR-' + String(Math.floor(Math.random() * 90000) + 10000);
    existing = dbGet('SELECT id FROM patients WHERE mr = ?', [mr]);
  }

  console.log(`[generate-case] Generating case: ${caseData.id} (${caseData.specialty}) for ${p.name}, MR=${mr}, userId=${userId}`);

  // Create the patient (is_generated=1 so it can be deleted by non-admin users)
  const displayName = req.session.displayName || req.session.username;
  dbRun(
    `INSERT INTO patients (user_id, name, dob, sex, mr, cc, appt, sched, status, age, phone, ins, allergy, bp, hr, temp, wt, is_shared, is_generated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [userId, p.name, p.dob, p.sex, mr, p.cc, 'TBD', displayName, p.age, p.phone || '—', p.ins || '—', p.allergy || 'None', p.bp || '—', p.hr || '—', p.temp || '—', p.wt || '—', isShared]
  );

  try {
    // 1. nursing_notes
    if (caseData.nursingNote) {
      const nn = caseData.nursingNote;
      dbRun(
        'INSERT INTO nursing_notes (patient_mr, user_id, nurse_name, time, blood_pressure, heart_rate, temperature, weight, note, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mr, userId, nn.nurseName || '', nn.time || '', nn.bloodPressure || '', nn.heartRate || '', nn.temperature || '', nn.weight || '', nn.note || '', isShared]
      );
    }

    // 2. physician_notes — previousEncounters
    if (caseData.previousEncounters) {
      for (const enc of caseData.previousEncounters) {
        dbRun(
          'INSERT INTO physician_notes (patient_mr, user_id, chief_complaint, history_present_illness, past_medical_history, surgical_history, hospitalizations, health_maintenance, family_history, social_history, review_of_systems, physical_exam, assessment, plan, visit_type, visit_date, nursing_notes, medical_decision_making, is_shared, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [mr, userId, enc.chiefComplaint || '', enc.hpi || '', enc.pmh || '', enc.surgicalHistory || '', enc.hospitalizations || '', enc.healthMaintenance || '', enc.familyHistory || '', enc.socialHistory || '', enc.reviewOfSystems || '', enc.physicalExam || '', enc.assessment || '', enc.plan || '', enc.type || 'office_visit', enc.visitDate || '', '', '', isShared, 'System']
        );
      }
    }

    // 3. physician_notes — currentEncounter
    if (caseData.currentEncounter) {
      const ce = caseData.currentEncounter;
      dbRun(
        'INSERT INTO physician_notes (patient_mr, user_id, chief_complaint, history_present_illness, past_medical_history, surgical_history, hospitalizations, health_maintenance, family_history, social_history, review_of_systems, physical_exam, assessment, plan, visit_type, visit_date, nursing_notes, medical_decision_making, is_shared, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mr, userId, ce.chiefComplaint || '', ce.hpi || '', ce.pmh || '', ce.surgicalHistory || '', ce.hospitalizations || '', ce.healthMaintenance || '', ce.familyHistory || '', ce.socialHistory || '', ce.reviewOfSystems || '', ce.physicalExam || '', ce.assessment || '', ce.plan || '', ce.visitType || 'office_visit', '', '', ce.mdm || '', isShared, 'System']
      );
    }

    // 4. medications
    if (caseData.medications) {
      for (const med of caseData.medications) {
        dbRun(
          'INSERT INTO medications (patient_mr, user_id, name, dose, freq, route, start, prescriber, type, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [mr, userId, med.name, med.dose || '', med.freq || '', med.route || '', med.start || '', med.prescriber || '', med.type || 'existing', isShared]
        );
      }
    }

    // 5. allergies
    if (caseData.allergies) {
      for (const al of caseData.allergies) {
        dbRun(
          'INSERT INTO allergies (patient_mr, user_id, allergen, type, reaction, first_encounter, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [mr, userId, al.allergen, al.type, al.reaction || '', al.firstEncounter || '', isShared]
        );
      }
    }

    // 6. problems
    if (caseData.problems) {
      for (const prob of caseData.problems) {
        dbRun(
          'INSERT INTO problems (patient_mr, user_id, name, category, status, annotation, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [mr, userId, prob.name, prob.category || 'Other', prob.status || 'active', prob.annotation || '', isShared]
        );
      }
    }

    // 7. orders (for labs and imaging)
    if (caseData.orders) {
      for (const order of caseData.orders) {
        dbRun(
          'INSERT INTO orders (patient_mr, user_id, type, category, name, priority, status, notes, ordered_by, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [mr, userId, order.type, order.category || '', order.name, order.priority || 'Routine', order.status || 'Pending', order.notes || '', 'System', isShared]
        );
      }
    }

    // 8. consultations
    if (caseData.consultations) {
      for (const cons of caseData.consultations) {
        dbRun(
          'INSERT INTO consultations (patient_mr, user_id, specialty, requested_date, status, consultant, summary, requested_by, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [mr, userId, cons.specialty, cons.requestedDate || null, cons.status || 'Pending', cons.consultant || '', cons.summary || '', 'System', isShared]
        );
      }
    }

    // 9. studies
    if (caseData.studies) {
      for (const study of caseData.studies) {
        dbRun(
          'INSERT INTO studies (patient_mr, user_id, name, study_date, result, status, ordered_by, notes, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [mr, userId, study.name, study.studyDate || null, study.result || '', study.status || 'Pending', 'System', study.notes || '', isShared]
        );
      }
    }

    res.json({ success: true, caseId: caseData.id });
  } catch (err) {
    console.error('Error generating case:', err);
    res.status(500).json({ error: 'Failed to generate case', details: err.message });
  }
});

// AI patient interview endpoint
router.post('/:mr/interview', requireAuth, async (req, res) => {
  const mr = req.params.mr;
  const userId = req.session.userId;

  if (!genAI || !process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Get a free key at https://aistudio.google.com/apikey' });
  }

  // Get patient data
  getDb();
  const patient = dbGet('SELECT * FROM patients WHERE mr = ? AND (user_id = ? OR is_shared = 1)', [mr, userId]);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  // Get current encounter physician note (most recent)
  const currentNote = dbGet(
    'SELECT * FROM physician_notes WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC LIMIT 1',
    [mr, userId]
  );
  if (!currentNote) {
    return res.status(400).json({ error: 'No case data found. Generate a case first.' });
  }

  // Get medications
  const meds = dbAll('SELECT name FROM medications WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1)', [mr, userId]);
  const medList = meds.map(m => m.name).join(', ');

  // Get problems for medical history
  const problems = dbAll('SELECT name FROM problems WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1)', [mr, userId]);
  const problemList = problems.map(p => p.name).join(', ');

  // Get social history and family history from current encounter note
  const socialHistory = currentNote.social_history || '';
  const familyHistory = currentNote.family_history || '';
  const ros = currentNote.review_of_systems || '';
  const physicalExam = currentNote.physical_exam || '';

  // Build system prompt
  const systemPrompt = `You are playing the role of a patient in a clinical interview. The user is a medical student interviewing you.

RULES:
1. Answer in first person as the patient — not as a doctor. Use natural, patient-like language.
2. Reveal information ONLY when directly asked. Do not volunteer details unprompted.
3. Keep responses short — 2-4 sentences max.
4. If asked something broad, give only a brief initial answer. Let the student dig deeper.
5. Stay in character at all times. Never break the roleplay.
6. Do not use medical terminology — speak like a regular person.

PATIENT PROFILE (this is your information):
- Name: ${patient.name}
- Age: ${calculateAge(patient.dob) || 'N/A'}
- Chief complaint: ${currentNote.chief_complaint || ''}
- HPI details: ${currentNote.history_present_illness || ''}
- Medical history: ${problemList || 'None'}
- Medications: ${medList || 'None'}
- Social history: ${socialHistory}
- Family history: ${familyHistory}
- Review of systems: ${ros}
- Physical exam findings: ${physicalExam}

Remember: reveal information ONLY when asked. Be natural and conversational.`;

  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...(chatHistory || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullReply = '';
    let chunkCount = 0;
    const stream = await genAI.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        temperature: 0.8,
        maxOutputTokens: 512,
      },
    });

    for await (const chunk of stream) {
      chunkCount++;
      const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) {
        fullReply += text;
        res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
      }
    }
    console.log(`Streaming chunks: ${chunkCount}, total text length: ${fullReply.length}`);

    res.write(`data: ${JSON.stringify({ done: true, reply: fullReply })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message || 'AI service error' })}\n\n`);
    res.end();
    console.error('Gemini API error:', err?.status, err?.message, err?.details);
  }
});

// Save interview chat history for a patient
router.post('/:mr/interview-history', requireAuth, (req, res) => {
  getDb();
  const { mr } = req.params;
  const { chatHistory } = req.body;
  const userId = req.session.userId;

  if (!chatHistory || !Array.isArray(chatHistory)) {
    return res.status(400).json({ error: 'Invalid chat history' });
  }

  // Check if record exists
  const existing = dbGet('SELECT id FROM interview_history WHERE patient_mr = ? AND user_id = ?', [mr, userId]);

  if (existing) {
    dbRun('UPDATE interview_history SET chat_data = ?, updated_at = datetime(\'now\') WHERE patient_mr = ? AND user_id = ?', [JSON.stringify(chatHistory), mr, userId]);
  } else {
    dbRun('INSERT INTO interview_history (patient_mr, user_id, chat_data, updated_at) VALUES (?, ?, ?, datetime(\'now\'))', [mr, userId, JSON.stringify(chatHistory)]);
  }

  res.json({ success: true });
});

// Load interview chat history for a patient
router.get('/:mr/interview-history', requireAuth, (req, res) => {
  getDb();
  const { mr } = req.params;
  const userId = req.session.userId;

  const record = dbGet('SELECT chat_data FROM interview_history WHERE patient_mr = ? AND user_id = ?', [mr, userId]);

  if (record) {
    res.json({ chatHistory: JSON.parse(record.chat_data) });
  } else {
    res.json({ chatHistory: [] });
  }
});

module.exports = router;
