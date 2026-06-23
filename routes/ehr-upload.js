const express = require('express');
const { parseEHRFile } = require('../ehrParser');
const { getDb, dbRun, dbGet } = require('../database');

const router = express.Router();

router.post('/upload', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const patientData = await parseEHRFile(req.file.buffer, req.file.mimetype);

    // Check if MR number already exists
    const existing = dbGet('SELECT id FROM patients WHERE mr = ?', [patientData.mr]);
    if (existing) {
      // Generate new MR number if conflict
      const randomNum = Math.floor(Math.random() * 90000) + 10000;
      patientData.mr = `MR-${randomNum}`;
    }

    // Insert patient into database
    const result = dbRun(
      `INSERT INTO patients (user_id, name, dob, sex, mr, cc, appt, sched, status, age, phone, ins, allergy, bp, hr, temp, wt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.userId,
        patientData.name || 'Unknown Patient',
        patientData.dob,
        patientData.sex || 'O',
        patientData.mr,
        patientData.cc || 'No chief complaint',
        patientData.appt,
        patientData.sched || 'Dr. Smith',
        patientData.status,
        patientData.age || 0,
        patientData.phone,
        patientData.ins,
        patientData.allergy,
        patientData.bp,
        patientData.hr,
        patientData.temp,
        patientData.wt
      ]
    );

    // Add each visit as a separate physician note
    if (patientData.visits && patientData.visits.length > 0) {
      for (const visit of patientData.visits) {
        dbRun(
          `INSERT INTO physician_notes (patient_mr, chief_complaint, history_present_illness, past_medical_history, surgical_history, hospitalizations, health_maintenance, family_history, social_history, review_of_systems, physical_exam, assessment, plan, visit_type, visit_date, nursing_notes, medical_decision_making, allergies, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            patientData.mr,
            visit.chief_complaint,
            visit.history_present_illness,
            visit.past_medical_history || '',
            visit.surgical_history || '',
            visit.hospitalizations || '',
            visit.health_maintenance || '',
            visit.family_history || '',
            visit.social_history || '',
            visit.review_of_systems || '',
            visit.physical_exam,
            visit.assessment,
            visit.plan,
            visit.type,
            visit.date,
            visit.nursing_notes,
            visit.medical_decision_making,
            visit.allergies,
            req.session.displayName || 'System'
          ]
        );

        // Add medications from this visit
        if (visit.medications && visit.medications.length > 0) {
          for (const med of visit.medications) {
            dbRun(
              `INSERT INTO medications (patient_mr, name, dose, route, type, prescriber)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                patientData.mr,
                med.name || med,
                med.dose || '',
                med.route || '',
                'ordered',
                req.session.displayName || 'System'
              ]
            );
          }
        }

        // Add nursing notes from this visit to the nursing_notes table
        if (visit.nursing_notes) {
          dbRun(
            `INSERT INTO nursing_notes (patient_mr, nurse_name, time, note)
             VALUES (?, ?, ?, ?)`,
            [
              patientData.mr,
              'System Import',
              visit.date || 'Unknown',
              visit.nursing_notes
            ]
          );
        }

        // Add labs from this visit
        if (visit.labs && visit.labs.length > 0) {
          for (const lab of visit.labs) {
            dbRun(
              `INSERT INTO orders (patient_mr, type, name, status, ordered_by)
               VALUES (?, ?, ?, ?, ?)`,
              [patientData.mr, 'Lab', lab, 'Completed', req.session.displayName || 'System']
            );
          }
        }

        // Add imaging from this visit
        if (visit.imaging && visit.imaging.length > 0) {
          for (const img of visit.imaging) {
            dbRun(
              `INSERT INTO studies (patient_mr, name, result, ordered_by)
               VALUES (?, ?, ?, ?)`,
              [patientData.mr, img, 'Completed', req.session.displayName || 'System']
            );
          }
        }
      }
    } else {
      // If no visits parsed, add the full notes as a single note
      if (patientData.notes) {
        dbRun(
          `INSERT INTO physician_notes (patient_mr, chief_complaint, history_present_illness, created_by)
           VALUES (?, ?, ?, ?)`,
          [patientData.mr, patientData.cc, patientData.notes, req.session.displayName || 'System']
        );
      }
    }

    res.json({
      success: true,
      patient: {
        id: result.lastInsertRowid,
        ...patientData
      }
    });
  } catch (error) {
    console.error('EHR upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process EHR file' });
  }
});

module.exports = router;
