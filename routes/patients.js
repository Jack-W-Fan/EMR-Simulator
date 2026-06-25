const express = require('express');
const { getDb, dbGet, dbAll, dbRun } = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function getPatientForUser(mr, userId) {
  getDb();
  return dbGet('SELECT * FROM patients WHERE mr = ? AND (user_id = ? OR is_shared = 1)', [mr, userId]);
}

function getPatientClinicalData(mr, userId) {
  return {
    medications: dbAll('SELECT * FROM medications WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id', [mr, userId]),
    orders: dbAll('SELECT * FROM orders WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC', [mr, userId]),
    problems: dbAll('SELECT * FROM problems WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id', [mr, userId]),
    consultations: dbAll('SELECT * FROM consultations WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC', [mr, userId]),
    studies: dbAll('SELECT * FROM studies WHERE patient_mr = ? AND (user_id = ? OR is_shared = 1) ORDER BY id DESC', [mr, userId]),
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
    SELECT * FROM patients
    WHERE user_id = ? OR is_shared = 1
    ORDER BY id
  `, [req.session.userId]);
  res.json(patients);
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

  const { type, name, priority, order_date, status, notes } = req.body;
  if (!type || !name) {
    return res.status(400).json({ error: 'Order type and name are required.' });
  }

  const orderedBy = req.session.displayName || req.session.username;
  const result = dbRun(
    'INSERT INTO orders (patient_mr, user_id, type, name, priority, order_date, status, ordered_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, type, name, priority || 'Routine', order_date || null, status || 'Pending', orderedBy, notes || '']
  );

  const order = dbGet('SELECT * FROM orders WHERE id = ?', [result.lastInsertRowid]);
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

  const { name, study_date, result, status, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Study name is required.' });

  const orderedBy = req.session.displayName || req.session.username;
  const studyResult = dbRun(
    'INSERT INTO studies (patient_mr, user_id, name, study_date, result, status, ordered_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, name, study_date || null, result || '', status || 'Pending', orderedBy, notes || '']
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
  res.json({ ...patient, ...clinical });
});

router.put('/:mr', requireAuth, (req, res) => {
  const patient = getPatientForUser(req.params.mr, req.session.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { name, dob, sex, cc, appt, status, phone, ins, allergy, bp, hr, temp, wt } = req.body;

  dbRun(
    `UPDATE patients SET
      name = COALESCE(?, name),
      dob = COALESCE(?, dob),
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
      updated_at = datetime('now')
    WHERE mr = ? AND user_id = ?`,
    [name || null, dob || null, sex || null, cc || null, appt || null, status || null,
     phone || null, ins || null, allergy || null, bp || null, hr || null, temp || null, wt || null,
     req.params.mr, req.session.userId]
  );

  const updated = dbGet('SELECT * FROM patients WHERE mr = ?', [req.params.mr]);
  res.json(updated);
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
  dbRun('DELETE FROM patients WHERE mr = ? AND user_id = ?', [mr, req.session.userId]);
  res.json({ success: true });
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
    surgical_history,
    hospitalizations,
    health_maintenance,
    family_history,
    social_history,
    review_of_systems,
    physical_exam,
    assessment,
    plan
  } = req.body;
  const createdBy = req.session.displayName || req.session.username;

  const result = dbRun(
    'INSERT INTO physician_notes (patient_mr, user_id, chief_complaint, history_present_illness, past_medical_history, surgical_history, hospitalizations, health_maintenance, family_history, social_history, review_of_systems, physical_exam, assessment, plan, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, chief_complaint || '', history_present_illness || '', past_medical_history || '', surgical_history || '', hospitalizations || '', health_maintenance || '', family_history || '', social_history || '', review_of_systems || '', physical_exam || '', assessment || '', plan || '', createdBy]
  );

  const note = dbGet('SELECT * FROM physician_notes WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(note);
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

  const result = dbRun(
    'INSERT INTO imaging (patient_mr, user_id, label, image_data, annotations) VALUES (?, ?, ?, ?, ?)',
    [req.params.mr, req.session.userId, label, image_data || '', annotations || '']
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

module.exports = router;
