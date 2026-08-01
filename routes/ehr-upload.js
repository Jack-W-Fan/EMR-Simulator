const express = require('express');
const { parseEHRFile } = require('../ehrParser');
const { getDb, dbRun, dbGet } = require('../database');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Reference list of valid lab test names (mirrors frontend ORDER_CATEGORIES)
// Also includes common shorthand aliases that parsers may extract
const VALID_LAB_NAMES = new Set([
  'CBC with Differential', 'CBC', 'White Blood Cell Count', 'WBC', 'Red Blood Cell Count', 'RBC', 'Hemoglobin', 'Hgb', 'Hgb/Hct', 'Hematocrit', 'Hct', 'Platelet Count', 'Platelets', 'Pit', 'Plt', 'MCV', 'MCH', 'MCHC', 'RDW', 'Reticulocyte Count', 'Peripheral Smear', 'ESR', 'CRP', 'Ferritin', 'Iron Studies', 'Total Iron Binding Capacity', 'TIBC', 'Transferrin Saturation', 'Vitamin B12', 'Folate', 'INR', 'PT/INR', 'Partial Thromboplastin Time (PTT)', 'Prothrombin Time (PT)', 'Thrombin Time', 'D-dimer', 'Fibrin Degradation Products', 'Fibrinogen', 'Hemoglobin A1c', 'HbA1c', 'ABORH Type', 'Direct Coombs', 'Indirect Coombs', 'Haptoglobin', 'LDH', 'Bleeding Time', 'Clotting Time',
  'Sodium (Na+)', 'Na', 'Potassium (K+)', 'K', 'Chloride (Cl-)', 'Cl', 'Bicarbonate (HCO3-)', 'CO2', 'BMP (Basic Metabolic Panel)', 'BMP', 'CMP (Comprehensive Metabolic Panel)', 'CMP', 'Liver Function Panel', 'LFTs', 'Electrolyte Panel', 'Renal Function Panel', 'Urea Nitrogen (BUN)', 'BUN', 'Creatinine', 'Cr', 'Glucose', 'Glu', 'AST (SGOT)', 'AST', 'ALT (SGPT)', 'ALT', 'Alkaline Phosphatase', 'Alk Phos', 'GGT', 'Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'Albumin', 'Total Protein', 'Lipase', 'Amylase', 'Calcium', 'Ca', 'Phosphorus', 'Magnesium', 'Mag', 'Lipid Panel', 'Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'VLDL Cholesterol', 'ApoA1', 'ApoB', 'Lipoprotein(a)',
  'TSH', 'Free T4', 'Free T3', 'Total T4', 'Total T3', 'TPO Antibodies', 'Thyroglobulin Antibodies', 'Cortisol', 'ACTH', 'IGF-1', 'PTH', 'Vitamin D (25-OH)', 'Vitamin D (1,25-OH)', 'Insulin', 'C-Peptide', 'Glucagon', 'Testosterone', 'Estradiol', 'FSH', 'LH', 'Progesterone', 'Prolactin', 'DHEA-S', 'Androstenedione', 'Cortisol Binding Globulin', 'Sex Hormone Binding Globulin',
  'Urinalysis', 'UA', 'Urine Culture', 'Urine Microalbumin', '24-Hour Urine Protein', '24-Hour Urine Creatinine', 'Urine Electrolytes', 'Urine Osmolality', 'Urine Specific Gravity', 'Urine pH', 'Urine Ketones', 'Urine Glucose', 'Urine Protein', 'Urine Red Blood Cells', 'Urine White Blood Cells', 'Urine Casts', 'Urine Crystals', 'Urine Nitrites', 'Urine Leukocyte Esterase', 'Urine Bilirubin', 'Urine Urobilinogen',
  'CSF Cell Count', 'CSF Protein', 'CSF Glucose', 'CSF Culture', 'CSF VDRL', 'CSF Oligoclonal Bands', 'CSF IgG Index', 'CSF Myelin Basic Protein', 'CSF Opening Pressure', 'CSF Closing Pressure', 'CSF Lactate', 'CSF Chloride',
  'Blood Culture', 'Urine Culture', 'Throat Culture', 'Sputum Culture', 'Wound Culture', 'Stool Culture', 'CSF Culture', 'HIV Test', 'HIV Viral Load', 'HIV Genotype', 'Hepatitis A IgM', 'Hepatitis B Surface Antigen', 'Hepatitis B Surface Antibody', 'Hepatitis B Core Antibody', 'Hepatitis B DNA', 'Hepatitis C Antibody', 'Hepatitis C RNA', 'TB Test (PPD)', 'TB Quantiferon', 'TB Culture', 'COVID-19 PCR', 'COVID-19 Antigen', 'COVID-19 Antibody', 'Influenza A/B', 'RSV', 'Streptococcus Group A', 'Chlamydia', 'Gonorrhea', 'Syphilis RPR', 'Syphilis FTA-ABS'
]);

const router = express.Router();

router.post('/upload', requireAdmin, async (req, res) => {
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

    // Check if user is admin to mark patient as shared
    const user = dbGet('SELECT role FROM users WHERE id = ?', [req.session.userId]);
    const isShared = user && user.role === 'admin' ? 1 : 0;

    // Insert patient into database
    const result = dbRun(
      `INSERT INTO patients (user_id, name, dob, sex, mr, cc, appt, sched, status, age, phone, ins, allergy, bp, hr, temp, wt, is_shared)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        patientData.wt,
        isShared
      ]
    );

    // Add each visit as a separate physician note
    if (patientData.visits && patientData.visits.length > 0) {
      for (const visit of patientData.visits) {
        dbRun(
          `INSERT INTO physician_notes (patient_mr, user_id, chief_complaint, history_present_illness, past_medical_history, surgical_history, hospitalizations, health_maintenance, family_history, social_history, review_of_systems, physical_exam, assessment, plan, visit_type, visit_date, nursing_notes, medical_decision_making, allergies, is_shared, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            patientData.mr,
            req.session.userId,
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
            isShared,
            req.session.displayName || 'System'
          ]
        );

        // Add medications from this visit
        if (visit.medications && visit.medications.length > 0) {
          for (const med of visit.medications) {
            dbRun(
              `INSERT INTO medications (patient_mr, user_id, name, dose, route, type, prescriber, is_shared)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                patientData.mr,
                req.session.userId,
                med.name || med,
                med.dose || '',
                med.route || '',
                'ordered',
                req.session.displayName || 'System',
                isShared
              ]
            );
          }
        }

        // Add nursing notes from this visit to the nursing_notes table
        if (visit.nursing_notes) {
          dbRun(
            `INSERT INTO nursing_notes (patient_mr, user_id, nurse_name, time, note, is_shared)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              patientData.mr,
              req.session.userId,
              'System Import',
              visit.date || 'Unknown',
              visit.nursing_notes,
              isShared
            ]
          );
        }

        // Add labs from this visit — only store names that match valid test list (case-insensitive)
        if (visit.labs && visit.labs.length > 0) {
          for (const lab of visit.labs) {
            const normalized = lab ? lab.trim() : '';
            if (normalized && [...VALID_LAB_NAMES].some(n => n.toLowerCase() === normalized.toLowerCase())) {
              dbRun(
                `INSERT INTO orders (patient_mr, user_id, type, name, status, ordered_by, is_shared, result, result_unlocked)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [patientData.mr, req.session.userId, 'labs', lab, 'Completed', req.session.displayName || 'System', isShared, '', 0]
              );
            }
          }
        }

        // Add imaging from this visit
        if (visit.imaging && visit.imaging.length > 0) {
          for (const img of visit.imaging) {
            dbRun(
              `INSERT INTO studies (patient_mr, user_id, name, result, ordered_by, is_shared, result_unlocked)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [patientData.mr, req.session.userId, img, 'Completed', req.session.displayName || 'System', isShared, 0]
            );
          }
        }
      }
    } else {
      // If no visits parsed, add the full notes as a single note
      if (patientData.notes) {
        dbRun(
          `INSERT INTO physician_notes (patient_mr, user_id, chief_complaint, history_present_illness, is_shared, created_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [patientData.mr, req.session.userId, patientData.cc, patientData.notes, isShared, req.session.displayName || 'System']
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
