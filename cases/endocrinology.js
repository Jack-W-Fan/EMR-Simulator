module.exports = [
  {
    id: "CASE-005",
    specialty: "endocrinology",
    difficulty: "hard",
    patient: {
      name: "Robert Chang",
      dob: "1970-03-28",
      sex: "M",
      age: "54",
      cc: "Nausea, vomiting, and confusion for 2 days",
      phone: "555-0512",
      ins: "Humana",
      bp: "88/52",
      hr: "128",
      temp: "99.4",
      wt: "162 lbs"
    },
    allergies: [
      { allergen: "NKDA", type: "drug", reaction: "None", firstEncounter: "2016-04-10" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2024-01-15",
        chiefComplaint: "Follow-up diabetes visit",
        hpi: "54M with DM2 presenting for routine follow-up. HbA1c 7.8% — slightly above goal. Reports some missed insulin doses due to work schedule.",
        pmh: "Type 2 Diabetes Mellitus, Hypertension, Hyperlipidemia",
        surgicalHistory: "None",
        assessment: "DM2 — suboptimally controlled. HTN, HLD — well controlled.",
        plan: "Discussed insulin adherence. Adjusted glargine dose from 20 to 24 units nightly. Continue metformin 1000mg BID. HbA1c recheck in 3 months.",
        physicalExam: "BP 136/84. No retinopathy on fundoscopic exam. Monofilament test intact bilaterally. No ulcers."
      },
      {
        type: "office_visit",
        visitDate: "2024-06-10",
        chiefComplaint: "HbA1c follow-up",
        hpi: "HbA1c improved to 7.1%. Patient reports better adherence with insulin glargine.",
        pmh: "Type 2 Diabetes Mellitus, Hypertension, Hyperlipidemia",
        surgicalHistory: "None",
        assessment: "DM2 — improving. At goal.",
        plan: "Continue current regimen. Annual eye exam. Foot exam — normal.",
        physicalExam: "BP 130/78. Feet — no ulcers, intact sensation."
      }
    ],
    currentEncounter: {
      visitType: "er_visit",
      chiefComplaint: "Nausea, vomiting, and confusion",
      hpi: "54M with DM2 presents via EMS after 2 days of nausea and vomiting. Wife found him confused and lethargic at home this morning. Patient reports he 'just felt bad' starting 2 days ago — severe thirst, frequent urination, then nausea and vomiting began overnight. He has been unable to keep down his oral medications or insulin. Reports a UTI-like feeling (burning with urination) starting about a week ago but didn't seek care. Weight loss of approximately 8 lbs over 2 days.",
      pmh: "Type 2 Diabetes Mellitus (diagnosed 2015), Hypertension, Hyperlipidemia",
      surgicalHistory: "None",
      hospitalizations: "None",
      healthMaintenance: "Last colonoscopy 2019 — normal. Flu shot 2024-11.",
      familyHistory: "Father with DM2. Mother with stroke. Brother with MI at 62.",
      socialHistory: "Former smoker (quit 2010, 15 pack-years). Social alcohol (2-3 beers/week). Works as accountant. Lives with wife and teenage daughter.",
      reviewOfSystems: "Positive for nausea, vomiting, polyuria, polydipsia, confusion, weight loss. Negative for fever, cough, diarrhea, chest pain, abdominal pain (denies localized pain but too nauseated to eat).",
      physicalExam: "BP 88/52 (hypotensive), HR 128 (tachycardic), Temp 99.4F. Lethargic, oriented to person only. Dry mucous membranes. Sunken eyes. Delayed capillary refill. Abdomen soft, non-tender, normoactive bowel sounds. No CVA tenderness. Deep, rapid Kussmaul respirations noted. Fruity odor on breath.",
      assessment: "DKA (diabetic ketoacidosis) — confirmed by labs (glucose 612, pH 7.22, bicarb 10, anion gap 28, positive ketones). Precipitated by UTI (UA positive for nitrites, leukocytes, and WBCs). Severe volume depletion.",
      plan: "Aggressive IV fluid resuscitation (0.9% NS 1L bolus, then 250mL/hr). Insulin drip started at 6 units/hr (after initial bolus of 6 units). Potassium replacement (KCl 20mEq in each liter once K > 3.3). Ciprofloxacin 500mg IV for UTI. Monitor glucose q1h, bicarb q4h. Admit to ICU. NPO.",
      mdm: "High complexity — life-threatening condition (DKA), requires ICU-level monitoring, multiple simultaneous issues (DKA + UTI + volume depletion).",
      nursingNotes: "Patient admitted to ICU. Insulin drip and fluid resuscitation started per orders. Potassium 3.1 on initial labs — held insulin drip, given KCl bolus. Urinary catheter placed for accurate I/O. Patient intubated for airway protection due to altered mental status (GCS 11)."
    },
    medications: [
      { name: "Metformin", dose: "1000mg", freq: "BID", route: "PO", prescriber: "Dr. Adams", start: "2015-11-20", type: "existing" },
      { name: "Insulin Glargine", dose: "24 units", freq: "Daily (bedtime)", route: "SQ", prescriber: "Dr. Adams", start: "2020-08-15", type: "existing" },
      { name: "Lisinopril", dose: "10mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2017-03-01", type: "existing" },
      { name: "Atorvastatin", dose: "20mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2017-03-01", type: "existing" }
    ],
    problems: [
      { name: "Type 2 Diabetes Mellitus", category: "Endocrine", status: "active", annotation: "With DKA this admission" },
      { name: "Hypertension", category: "Cardiovascular", status: "active", annotation: "" },
      { name: "Hyperlipidemia", category: "Metabolic", status: "active", annotation: "" },
      { name: "Urinary Tract Infection", category: "Infectious", status: "active", annotation: "Precipitating factor for DKA" }
    ],
    orders: [
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "STAT", status: "Pending", notes: "Monitor glucose and electrolytes" },
      { type: "labs", category: "Blood Plasma/Serum", name: "ABG", priority: "STAT", status: "Pending", notes: "Monitor acidosis" },
      { type: "labs", category: "Blood Plasma/Serum", name: "Serum Ketones", priority: "STAT", status: "Pending", notes: "" },
      { type: "labs", category: "Hematologic", name: "CBC", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Urine", name: "UA", priority: "STAT", status: "Pending", notes: "Evaluate for UTI" },
      { type: "labs", category: "Infectious Disease", name: "Urine Culture", priority: "STAT", status: "Pending", notes: "" }
    ],
    consultations: [
      { specialty: "Endocrinology", requestedDate: "2025-01-15", status: "Pending", consultant: "", summary: "" }
    ],
    studies: [],
    nursingNote: {
      nurseName: "Thomas Nguyen, RN",
      time: "03:45 AM",
      bloodPressure: "88/52",
      heartRate: "128",
      temperature: "99.4",
      weight: "162 lbs",
      note: "Patient intubated and sedated. Insulin drip running at 4 units/hr after K repleted. Fluids running at 500mL/hr. Urine output via foley: 250mL in past 2 hours. Next BMP ordered in 4 hours."
    }
  },
  {
    id: "CASE-006",
    specialty: "endocrinology",
    difficulty: "easy",
    patient: {
      name: "Dorothy Williams",
      dob: "1935-12-01",
      sex: "F",
      age: "89",
      cc: "Fatigue, cold intolerance, and weight gain",
      phone: "555-0298",
      ins: "Medicare",
      bp: "148/82",
      hr: "58",
      temp: "97.2",
      wt: "175 lbs"
    },
    allergies: [
      { allergen: "Codeine", type: "drug", reaction: "Nausea", firstEncounter: "2010-06-20" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2023-05-15",
        chiefComplaint: "Annual physical",
        hpi: "88F for annual wellness exam. Feels well. Some fatigue 'like everyone her age.'",
        pmh: "Osteoporosis, Osteoarthritis",
        surgicalHistory: "Left hip replacement (2015)",
        assessment: "Healthy 88F. Mild osteoarthritis. Osteoporosis stable.",
        plan: "Continue alendronate. Annual DEXA in 2 years. Vitamin D 800 IU daily. Return in 1 year.",
        physicalExam: "BP 138/78. Mild bilateral knee OA deformity. Gait steady. No focal neuro deficits."
      }
    ],
    currentEncounter: {
      visitType: "office_visit",
      chiefComplaint: "Fatigue, cold intolerance, and weight gain",
      hpi: "89F presents with 6 months of progressive fatigue, cold intolerance, and a 12 lb weight gain. Reports she 'always feels cold' and needs a blanket even in summer. Constipation noted for months. Voice feels 'deeper' to family. Hair loss — husband noticed her hair is thinning. Denies chest pain, palpitations, or shortness of breath. Reports feeling 'slower' cognitively, family agrees she seems 'foggy.'",
      pmh: "Osteoporosis, Osteoarthritis",
      surgicalHistory: "Left hip replacement (2015)",
      hospitalizations: "2021 — Fall with hip fracture, hip replacement",
      healthMaintenance: "Last colonoscopy 2019 — normal. Annual DEXA shows T-score -2.8 (osteoporosis).",
      familyHistory: "Mother with hypothyroidism. Sister with Hashimoto's thyroiditis.",
      socialHistory: "Never smoked. No alcohol. Widowed, lives alone. Walks to the store once a week. Takes care of herself but 'things are getting harder.'",
      reviewOfSystems: "Positive for fatigue, cold intolerance, weight gain, constipation, hair loss, cognitive slowing. Negative for paresthesias, vision changes, palpitations.",
      physicalExam: "BP 148/82, HR 58. Dry, coarse skin. Periorbital puffiness. Delayed deep tendon reflexes (upstroke normal, downstroke delayed). No thyroid goiter on palpation. No edema. Mild bradycardia on auscultation.",
      assessment: "Classic hypothyroidism presentation — fatigue, cold intolerance, weight gain, constipation, hair loss, bradycardia, delayed reflexes. Likely Hashimoto's thyroiditis given family history.",
      plan: "TSH, free T4, and anti-TPO antibodies. Start levothyroxine 50mcg daily (start low in elderly). Follow up in 6 weeks to check TSH. Recheck weight and BP.",
      mdm: "Low complexity — straightforward hypothyroidism workup in elderly patient.",
      nursingNotes: "Patient friendly and cooperative. Slow speech noted. Dressed warmly with sweater despite warm weather in exam room."
    },
    medications: [
      { name: "Alendronate", dose: "70mg", freq: "Weekly", route: "PO", prescriber: "Dr. Adams", start: "2020-01-01", type: "existing" },
      { name: "Vitamin D3", dose: "800 IU", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2020-01-01", type: "existing" },
      { name: "Calcium Carbonate", dose: "600mg", freq: "BID", route: "PO", prescriber: "Dr. Adams", start: "2020-01-01", type: "existing" },
      { name: "Acetaminophen", dose: "500mg", freq: "BID PRN", route: "PO", prescriber: "Dr. Adams", start: "2022-06-10", type: "existing" }
    ],
    problems: [
      { name: "Hypothyroidism", category: "Endocrine", status: "active", annotation: "Likely Hashimoto's, new diagnosis" },
      { name: "Osteoporosis", category: "Musculoskeletal", status: "active", annotation: "T-score -2.8" },
      { name: "Osteoarthritis", category: "Musculoskeletal", status: "active", annotation: "Bilateral knees" }
    ],
    orders: [
      { type: "labs", category: "Endocrine", name: "TSH", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Endocrine", name: "Free T4", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Endocrine", name: "Anti-TPO Antibodies", priority: "Routine", status: "Pending", notes: "Evaluate for Hashimoto's" }
    ],
    consultations: [],
    studies: [],
    nursingNote: {
      nurseName: "Karen White, LPN",
      time: "11:00 AM",
      bloodPressure: "148/82",
      heartRate: "58",
      temperature: "97.2",
      weight: "175 lbs",
      note: "Patient wrapped in extra blanket. Appeared drowsy but responsive. Speech somewhat slow. No acute distress."
    }
  }
];
