module.exports = [
  {
    id: "CASE-001",
    specialty: "cardiology",
    difficulty: "medium",
    patient: {
      name: "Eleanor Vasquez",
      dob: "1952-07-18",
      sex: "F",
      age: "72",
      cc: "Shortness of breath on exertion for 3 weeks",
      phone: "555-0142",
      ins: "Medicare",
      bp: "152/94",
      hr: "92",
      temp: "98.6",
      wt: "186 lbs"
    },
    allergies: [
      { allergen: "Penicillin", type: "drug", reaction: "Hives", firstEncounter: "2020-03-15" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2024-08-12",
        chiefComplaint: "Follow-up for hypertension",
        hpi: "72F with HTN presenting for routine follow-up. Reports good medication adherence. No new symptoms.",
        pmh: "Hypertension, Hyperlipidemia",
        surgicalHistory: "Appendectomy in 1978",
        assessment: "Hypertension, well-controlled",
        plan: "Continue lisinopril 20mg daily. Recheck BMP in 6 months. Return in 1 year for physical.",
        physicalExam: "BP 128/78. PERRLA. Lungs clear bilaterally. Regular rhythm without murmur. No edema."
      },
      {
        type: "office_visit",
        visitDate: "2025-06-02",
        chiefComplaint: "Increased fatigue",
        hpi: "Patient reports increased fatigue over the past month. Denies chest pain, palpitations, or orthopnea.",
        pmh: "Hypertension, Hyperlipidemia",
        surgicalHistory: "Appendectomy in 1978",
        assessment: "Fatigue — likely multifactorial. TSH and CBC checked and within normal limits.",
        plan: "Continue current medications. Encourage light exercise. Return if symptoms worsen.",
        physicalExam: "BP 134/84. Normal heart sounds. Lungs clear. No peripheral edema."
      }
    ],
    currentEncounter: {
      visitType: "office_visit",
      chiefComplaint: "Shortness of breath on exertion",
      hpi: "72F presents with progressive shortness of breath on exertion over the past 3 weeks. Describes difficulty walking up one flight of stairs without stopping. Denies chest pain, palpitations, or hemoptysis. Reports needing an extra pillow at night for the past week. Occasional nighttime cough, non-productive. No fever or chills. Weight gain of approximately 6 lbs over the past month.",
      pmh: "Hypertension (diagnosed 2010), Hyperlipidemia (diagnosed 2015), History of CHF exacerbation (2019)",
      surgicalHistory: "Appendectomy (1978)",
      hospitalizations: "Admitted 2019 for CHF exacerbation, diuresed over 4 days",
      healthMaintenance: "Last colonoscopy 2020 — normal. Last mammogram 2023 — benign. Flu vaccine received 2024-11.",
      familyHistory: "Father died of MI at age 67. Mother lived to 92 with HTN and DM2. Sister with atrial fibrillation.",
      socialHistory: "Never smoker. Occasional alcohol (wine with dinner). Lives alone in a two-story home. Retired school teacher.",
      reviewOfSystems: "Positive for SOB, DOE, orthopnea, 6 lb weight gain. Negative for chest pain, palpitations, fever, cough productive of sputum, leg pain, hematuria.",
      physicalExam: "BP 152/94, HR 92 (sinus tachycardia), Temp 98.6F, Wt 186 lbs. JVP 8cm. Bibasilar crackles. S3 gallop on auscultation. 2+ pitting edema bilaterally to mid-shins. Lungs decreased breath sounds at bases. No wheezing.",
      assessment: "CHF exacerbation vs new-onset diastolic dysfunction. Likely decompensation secondary to dietary noncompliance (patient admits to increased sodium intake).",
      plan: "Increase lisinopril to 30mg daily. Start furosemide 20mg daily, increase to 40mg if no improvement in 48hrs. Low-sodium diet education. Cardiology referral for echo. Labs: BNP, BMP, TSH, CBC. CXR today.",
      mdm: "Moderate complexity — multiple chronic issues with new acute concern requiring specialist referral.",
      nursingNotes: "Patient seated comfortably in chair. Ambulated with assistance from nursing station. BP rechecked at 150/92. No acute distress but visibly fatigued."
    },
    medications: [
      { name: "Lisinopril", dose: "20mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2019-03-01", type: "existing" },
      { name: "Atorvastatin", dose: "40mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2019-03-01", type: "existing" },
      { name: "Aspirin", dose: "81mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2020-01-15", type: "existing" }
    ],
    problems: [
      { name: "Hypertension", category: "cardiovascular", status: "active", annotation: "Well controlled on lisinopril, currently elevated" },
      { name: "Hyperlipidemia", category: "metabolic", status: "active", annotation: "" },
      { name: "Congestive Heart Failure", category: "cardiovascular", status: "active", annotation: "Prior exacerbation 2019, currently decompensating" }
    ],
    orders: [
      { type: "labs", category: "Blood Plasma/Serum", name: "BNP", priority: "Urgent", status: "Pending", notes: "Evaluate for CHF" },
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "TSH", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Hematologic", name: "CBC", priority: "Routine", status: "Pending", notes: "" },
      { type: "imaging", category: "Radiology", name: "CXR", priority: "Routine", status: "Pending", notes: "Evaluate for pulmonary edema and cardiomegaly" }
    ],
    consultations: [
      { specialty: "Cardiology", requestedDate: "2025-01-15", status: "Scheduled", consultant: "Dr. Nguyen", summary: "" }
    ],
    studies: [
      { name: "Echocardiogram", studyDate: "2025-01-16", status: "Pending", notes: "Evaluate EF and wall motion" }
    ],
    nursingNote: {
      nurseName: "Maria Santos, RN",
      time: "09:15 AM",
      bloodPressure: "152/94",
      heartRate: "92",
      temperature: "98.6",
      weight: "186 lbs",
      note: "Patient admitted to increased sodium intake at dinner gatherings. Oriented x3. No acute distress but visibly fatigued. Educated on 2L fluid restriction."
    }
  },
  {
    id: "CASE-002",
    specialty: "cardiology",
    difficulty: "hard",
    patient: {
      name: "James Okonkwo",
      dob: "1948-02-25",
      sex: "M",
      age: "76",
      cc: "Chest pressure radiating to left arm",
      phone: "555-0891",
      ins: "Medicare",
      bp: "170/98",
      hr: "56",
      temp: "98.1",
      wt: "210 lbs"
    },
    allergies: [
      { allergen: "NKDA", type: "drug", reaction: "None", firstEncounter: "2015-01-10" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2023-11-20",
        chiefComplaint: "Routine physical",
        hpi: "76M with known CAD, HTN, and DM2 for annual physical. Reports stable angina with exertion, unchanged from baseline.",
        pmh: "CAD s/p PCI 2018, HTN, DM2, Hyperlipidemia",
        surgicalHistory: "PCI with stent to LAD in 2018, cataract surgery right eye 2020",
        assessment: "CAD s/p PCI, stable. HTN, DM2 — both at goal.",
        plan: "Continue all medications. HbA1c 6.8% — excellent control. Lipid panel within goal. Cardiology follow-up in 6 months.",
        physicalExam: "BP 142/88. Regular rhythm, II/VI systolic murmur at LUSB. Lungs clear. No edema."
      }
    ],
    currentEncounter: {
      visitType: "office_visit",
      chiefComplaint: "Chest pressure radiating to left arm",
      hpi: "76M with history of CAD s/p PCI (LAD stent, 2018) presents with new-onset chest pressure. Describes a 'heavy weight' on his chest that began yesterday after walking 2 blocks to the mailbox. Pressure radiates to left arm and jaw. Episodes last 5-10 minutes and resolve with rest. Has had 4 such episodes in 24 hours. Denies diaphoresis, nausea, or syncope. Reports his usual stable angina occurs with more exertion (4+ blocks).",
      pmh: "CAD s/p PCI 2018 (LAD stent), HTN, DM2 (diagnosed 2012), Hyperlipidemia",
      surgicalHistory: "PCI with LAD stent (2018), Right cataract extraction (2020), Left cataract extraction (2022)",
      hospitalizations: "2018 — PCI admission. 2015 — TIA workup, no intervention.",
      healthMaintenance: "Last colonoscopy 2021 — 3 small polyps removed. Last flu shot 2024-10. Shingles vaccine received 2023.",
      familyHistory: "Father with CAD, died age 71 of MI. Mother with stroke at age 78. Brother with DM2.",
      socialHistory: "Former smoker (quit 1998, 30 pack-year history). Social alcohol (2 beers/week). Retired mechanic. Lives with wife.",
      reviewOfSystems: "Positive for chest pressure, left arm radiation. Negative for palpitations, SOB at rest, fever, weight loss. Endorses some fatigue.",
      physicalExam: "BP 170/98, HR 56 (on beta-blocker). Regular rhythm, no new murmur. Lungs clear. No JVD. No edema. Chest wall non-tender to palpation.",
      assessment: "New crescendo angina — unstable angina vs NSTEMI. Significant change from baseline stable pattern. Needs urgent cardiac workup.",
      plan: "ECG immediately. Troponin x2 (0 and 2hr). Start heparin drip. Increase lisinopril. Call cardiology for urgent stress test or cath lab consult. Admit if troponin elevated.",
      mdm: "High complexity — unstable angina with multiple comorbidities, potential for hospitalization.",
      nursingNotes: "Patient appeared anxious. ECG obtained immediately — ST depressions in leads V4-V6. Troponin drawn at 14:32. Cardiology paged. Patient kept NPO."
    },
    medications: [
      { name: "Metoprolol Succinate", dose: "100mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2018-06-15", type: "existing" },
      { name: "Aspirin", dose: "325mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2018-06-15", type: "existing" },
      { name: "Clopidogrel", dose: "75mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2018-06-15", type: "existing" },
      { name: "Atorvastatin", dose: "80mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2018-06-15", type: "existing" },
      { name: "Lisinopril", dose: "30mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2015-04-01", type: "existing" },
      { name: "Metformin", dose: "1000mg", freq: "BID", route: "PO", prescriber: "Dr. Adams", start: "2012-09-10", type: "existing" },
      { name: "Nitroglycerin SL", dose: "0.4mg", freq: "PRN", route: "SL", prescriber: "Dr. Adams", start: "2018-06-15", type: "existing" }
    ],
    problems: [
      { name: "Coronary Artery Disease", category: "cardiovascular", status: "active", annotation: "s/p LAD stent 2018" },
      { name: "Hypertension", category: "cardiovascular", status: "active", annotation: "" },
      { name: "Diabetes Mellitus Type 2", category: "metabolic", status: "active", annotation: "Well controlled" },
      { name: "Hyperlipidemia", category: "metabolic", status: "active", annotation: "" }
    ],
    orders: [
      { type: "labs", category: "Blood Plasma/Serum", name: "Troponin I", priority: "STAT", status: "Pending", notes: "x2 — 0 and 2 hour" },
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Hematologic", name: "CBC", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "Lipid Panel", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Endocrine", name: "HbA1c", priority: "Routine", status: "Pending", notes: "" }
    ],
    consultations: [
      { specialty: "Cardiology", requestedDate: "2025-01-15", status: "Scheduled", consultant: "Dr. Nguyen", summary: "" }
    ],
    studies: [
      { name: "EKG", studyDate: "2025-01-15", status: "Final", notes: "ST depressions V4-V6", result: "ST-segment depressions in leads V4-V6, consistent with ischemia. Rate 56 bpm, sinus bradycardia." },
      { name: "Stress Test", studyDate: "2025-01-16", status: "Pending", notes: "" }
    ],
    nursingNote: {
      nurseName: "David Chen, RN",
      time: "02:30 PM",
      bloodPressure: "170/98",
      heartRate: "56",
      temperature: "98.1",
      weight: "210 lbs",
      note: "Patient kept NPO. Heparin drip started at 14:15. Cardiology aware and will see patient today. Patient denies current chest pain. Nitro available at bedside."
    }
  }
];
