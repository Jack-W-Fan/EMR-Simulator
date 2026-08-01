module.exports = [
  {
    id: "CASE-003",
    specialty: "pulmonology",
    difficulty: "medium",
    patient: {
      name: "Marcus Johnson",
      dob: "1965-11-03",
      sex: "M",
      age: "59",
      cc: "Worsening shortness of breath and productive cough",
      phone: "555-0367",
      ins: "BlueCross PPO",
      bp: "138/86",
      hr: "104",
      temp: "101.2",
      wt: "198 lbs"
    },
    allergies: [
      { allergen: "Sulfa", type: "drug", reaction: "Rash", firstEncounter: "2018-05-20" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2024-03-18",
        chiefComplaint: "Annual physical",
        hpi: "59M for annual exam. Reports chronic cough that he attributes to smoking. No acute complaints.",
        pmh: "COPD (diagnosed 2020), Obesity, GERD",
        surgicalHistory: "Hernia repair (2010)",
        assessment: "COPD, stable. Obesity. Continued smoking — counseled.",
        plan: "Continue tiotropium and albuterol. Encouraged smoking cessation. PFTs ordered for baseline. Vitamin D checked — low, started supplementation.",
        physicalExam: "BP 130/82. Barrel chest. Diffuse wheezes, decreased air movement at bases. No edema. O2 sat 94% on room air."
      },
      {
        type: "office_visit",
        visitDate: "2024-11-12",
        chiefComplaint: "Increased cough with cold",
        hpi: "Patient reports increased cough over past 2 weeks following a URI. More sputum production than usual, yellow but not foul-smelling.",
        pmh: "COPD, Obesity, GERD",
        surgicalHistory: "Hernia repair (2010)",
        assessment: "COPD exacerbation, mild, likely viral.",
        plan: "Prednisone 20mg for 5 days. Increase albuterol to q2h PRN. Tiotropium continued. Return if worsening. No antibiotics — likely viral.",
        physicalExam: "BP 128/80, O2 93% RA. Wheezing bilaterally, more at right base. No crackles. No increased WBC on basic labs."
      }
    ],
    currentEncounter: {
      visitType: "office_visit",
      chiefComplaint: "Worsening shortness of breath and productive cough",
      hpi: "59M with COPD presents with 5 days of worsening SOB and productive cough. Sputum is green/yellow, approximately 4-5 tablespoons per day. Reports fevers at home up to 101.5F. Has used albuterol 6-8 times per day with only transient relief. Denies chest pain. Reports he 'can't walk to the kitchen without stopping.' Denies leg swelling, palpitations, or hemoptysis. Smokes 1 pack/day, has not quit.",
      pmh: "COPD (GOLD stage II-III), Obesity, GERD",
      surgicalHistory: "Hernia repair (2010)",
      hospitalizations: "None",
      healthMaintenance: "Pneumococcal vaccine received 2023. Influenza vaccine received 2024-10. No colonoscopy — declined.",
      familyHistory: "Mother with COPD. Father with lung cancer (died 2005, smoker).",
      socialHistory: "1 pack/day tobacco since age 17 (42 pack-years). Works as a truck driver, sitting 10-12 hours/day. Drinks beer 4-5 nights per week. Married, 3 adult children.",
      reviewOfSystems: "Positive for SOB, cough, sputum, fevers. Negative for chest pain, palpitations, leg swelling, hematuria, melena.",
      physicalExam: "BP 138/86, HR 104, Temp 101.2F, O2 88% on room air. In moderate respiratory distress. Speaking in short sentences. Diffuse wheezing and decreased breath sounds bilaterally. Prolonged expiratory phase. No crackles. No peripheral edema.",
      assessment: "COPD exacerbation, moderate-severe, with suspected bacterial superinfection. Hypoxemic (O2 88% RA). Likely community-acquired pneumonia given fever, productive cough, and hypoxia.",
      plan: "Albuterol/ipratropium nebs x3. Prednisone 40mg daily for 5 days. Levofloxacin 750mg daily for 7 days (sulfa allergy). Supplemental O2 at 2L to keep SpO2 > 92%. CXR to rule out pneumonia. BMP to check for electrolyte abnormalities. Consider hospitalization if not improving by tomorrow.",
      mdm: "Moderate complexity — COPD exacerbation with hypoxia, need to assess for pneumonia and consider hospitalization.",
      nursingNotes: "Patient placed on 2L NC O2. SpO2 improved to 93%. Three nebulizer treatments given over 2 hours. Patient anxious and working hard to breathe. IV access established in case antibiotics needed IV."
    },
    medications: [
      { name: "Tiotropium", dose: "18mcg/12.5mcg", freq: "Daily", route: "Inhalation", prescriber: "Dr. Adams", start: "2020-08-01", type: "existing" },
      { name: "Albuterol Inhaler", dose: "2 puffs", freq: "Q4H PRN", route: "Inhalation", prescriber: "Dr. Adams", start: "2020-08-01", type: "existing" },
      { name: "Omeprazole", dose: "20mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2021-03-15", type: "existing" },
      { name: "Vitamin D3", dose: "2000 IU", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2024-03-18", type: "existing" }
    ],
    problems: [
      { name: "COPD", category: "Respiratory", status: "active", annotation: "GOLD stage II-III, continued smoker" },
      { name: "Obesity", category: "Metabolic", status: "active", annotation: "BMI 32" },
      { name: "GERD", category: "Gastrointestinal", status: "active", annotation: "Well controlled on omeprazole" }
    ],
    orders: [
      { type: "imaging", category: "Radiology", name: "CXR", priority: "Urgent", status: "Pending", notes: "Rule out pneumonia" },
      { type: "labs", category: "Hematologic", name: "CBC", priority: "Urgent", status: "Pending", notes: "Evaluate for leukocytosis" },
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Infectious Disease", name: "Blood Culture", priority: "Urgent", status: "Pending", notes: "If pneumonia suspected" }
    ],
    consultations: [],
    studies: [
      { name: "PFT", studyDate: "2024-04-10", status: "Final", notes: "FEV1 52% predicted, FEV1/FVC 0.62, consistent with moderate COPD" }
    ],
    nursingNote: {
      nurseName: "Amy Rodriguez, RN",
      time: "10:45 AM",
      bloodPressure: "138/86",
      heartRate: "104",
      temperature: "101.2",
      weight: "198 lbs",
      note: "Patient in moderate respiratory distress on arrival. O2 placed at 2L NC. Three nebulizer treatments administered. Sputum sample collected for culture. CXR sent to radiology."
    }
  },
  {
    id: "CASE-004",
    specialty: "pulmonology",
    difficulty: "hard",
    patient: {
      name: "Sarah Kim",
      dob: "1988-06-12",
      sex: "F",
      age: "37",
      cc: "Sudden onset shortness of breath and right-sided chest pain",
      phone: "555-0723",
      ins: "Aetna",
      bp: "110/68",
      hr: "118",
      temp: "99.1",
      wt: "142 lbs"
    },
    allergies: [
      { allergen: "NKDA", type: "drug", reaction: "None", firstEncounter: "2022-01-15" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2024-09-05",
        chiefComplaint: "Prescription renewal — birth control pill",
        hpi: "37F requesting BC prescription renewal. No complaints.",
        pmh: "No significant medical history",
        surgicalHistory: "Wisdom teeth extraction (2015)",
        assessment: "Healthy female, routine BC renewal.",
        plan: "Renewed on combined oral contraceptive (norethindrone/ethinyl estradiol). Annual wellness exam scheduled. Pap smear — normal.",
        physicalExam: "Vitals normal. No abnormalities noted."
      }
    ],
    currentEncounter: {
      visitType: "er_visit",
      chiefComplaint: "Sudden shortness of breath and right-sided chest pain",
      hpi: "37F presents via ambulance after sudden-onset SOB and pleuritic chest pain while on a 10-hour flight from New York to Los Angeles yesterday. Pain is sharp, right-sided, worse with deep breath. Began approximately 2 hours after landing. Denies hemoptysis, leg swelling, or syncope. Taking combined oral contraceptive. No prior VTE history. Mother had DVT at age 62 after hip replacement.",
      pmh: "None",
      surgicalHistory: "Wisdom teeth extraction (2015)",
      hospitalizations: "None",
      healthMaintenance: "Up to date on vaccines. Last Pap 2024 — normal.",
      familyHistory: "Mother with DVT (2014). Father with MI at 58. No lung cancer in family.",
      socialHistory: "Non-smoker. No alcohol. Works as software developer. Recent long flight (10 hours, economy).",
      reviewOfSystems: "Positive for SOB and pleuritic chest pain. Negative for hemoptysis, leg swelling, fever, cough. Negative for headache, vision changes.",
      physicalExam: "BP 110/68, HR 118 (sinus tachycardia), Temp 99.1F, RR 24, O2 91% on room air. Anxious but speaking in full sentences. Lungs clear to auscultation bilaterally. No wheezing or crackles. Heart regular, tachycardic. No JVD. Right lower extremity — no edema, calf non-tender, Homan's negative.",
      assessment: "High suspicion for pulmonary embolism. Wells score: 5.5 (clinical signs of DVT 0, PE is #1 diagnosis 3, HR > 100 1.5, immobilization/surgery 0, prior VTE 0, hemoptysis 0, malignancy 0) = 5.5 → moderate risk. D-dimer and CT angiogram indicated.",
      plan: "CT pulmonary angiogram. D-dimer. CBC, BMP. Start heparin drip if CT positive. Oxygen to keep SpO2 > 92%. Discontinue OCP temporarily.",
      mdm: "Moderate complexity — PE workup with moderate Wells score, requires imaging and potential anticoagulation.",
      nursingNotes: "Patient placed on 3L NC O2 — SpO2 improved to 95%. IV access x2. Labs drawn. CT PACU notified."
    },
    medications: [
      { name: "Norethindrone/Ethinyl Estradiol", dose: "1mg/20mcg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2020-01-15", type: "existing" }
    ],
    problems: [
      { name: "Pulmonary Embolism", category: "Cardiovascular", status: "active", annotation: "Suspected, pending CT" }
    ],
    orders: [
      { type: "labs", category: "Blood Plasma/Serum", name: "D-Dimer", priority: "STAT", status: "Pending", notes: "" },
      { type: "labs", category: "Hematologic", name: "CBC", priority: "Routine", status: "Pending", notes: "" },
      { type: "imaging", category: "Radiology", name: "CT Pulmonary Angiogram", priority: "STAT", status: "Pending", notes: "Rule out PE" },
      { type: "imaging", category: "Radiology", name: "Venous Duplex Lower Extremity", priority: "Routine", status: "Pending", notes: "Rule out DVT" }
    ],
    consultations: [
      { specialty: "Pulmonology", requestedDate: "2025-01-15", status: "Scheduled", consultant: "Dr. Patel", summary: "" }
    ],
    studies: [
      { name: "EKG", studyDate: "2025-01-15", status: "Final", notes: "Sinus tachycardia, no ST changes", result: "Sinus tachycardia at 118 bpm. No ischemic changes. S1Q3T3 pattern not definitively present." }
    ],
    nursingNote: {
      nurseName: "Lisa Park, RN",
      time: "08:30 AM",
      bloodPressure: "110/68",
      heartRate: "118",
      temperature: "99.1",
      weight: "142 lbs",
      note: "Patient arrived via EMS, visibly anxious. O2 placed at 3L NC. SpO2 91% RA, improved to 95% on O2. CT PACU notified and preparing for CTPA."
    }
  }
];
