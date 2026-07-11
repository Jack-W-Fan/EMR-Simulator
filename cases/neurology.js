module.exports = [
  {
    id: "CASE-009",
    specialty: "neurology",
    difficulty: "medium",
    patient: {
      name: "Linda Morales",
      dob: "1960-09-14",
      sex: "F",
      age: "64",
      cc: "Left-sided weakness and slurred speech",
      phone: "555-0419",
      ins: "BlueCross PPO",
      bp: "186/102",
      hr: "78",
      temp: "98.4",
      wt: "204 lbs"
    },
    allergies: [
      { allergen: "NKDA", type: "drug", reaction: "None", firstEncounter: "2017-02-28" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2023-10-10",
        chiefComplaint: "Blood pressure check",
        hpi: "63F for BP check. Screen found elevated BP at pharmacy. No symptoms.",
        pmh: "None",
        surgicalHistory: "Right knee arthroscopy (2018)",
        assessment: "Newly diagnosed hypertension — Stage 2.",
        plan: "Start lisinopril 10mg daily. Lifestyle modifications. Home BP monitoring. Return in 1 month.",
        physicalExam: "BP 162/94 (average of 3 readings). Otherwise normal exam."
      },
      {
        type: "office_visit",
        visitDate: "2024-04-15",
        chiefComplaint: "BP follow-up",
        hpi: "BP better but still not at goal on lisinopril 10mg.",
        pmh: "Hypertension",
        surgicalHistory: "Right knee arthroscopy (2018)",
        assessment: "Hypertension — uncontrolled on monotherapy.",
        plan: "Increased lisinopril to 20mg daily. Add amlodipine 5mg daily. Home BP log. Return in 4 weeks.",
        physicalExam: "BP 154/90. No focal neuro deficits."
      }
    ],
    currentEncounter: {
      visitType: "er_visit",
      chiefComplaint: "Left-sided weakness and slurred speech",
      hpi: "64F brought in by husband at approximately 15:30. Husband found her at 14:45 with 'funny speech' and inability to use her left arm. She was making coffee. Last known well: 14:30 when husband left for his car. Sudden onset of left arm and leg weakness, right facial droop, slurred speech. No headache. No loss of consciousness. Symptoms have been persistent and not improving.",
      pmh: "Hypertension (diagnosed 2023), Obesity",
      surgicalHistory: "Right knee arthroscopy (2018)",
      hospitalizations: "None",
      healthMaintenance: "No colonoscopy. Last mammogram 2022 — normal.",
      familyHistory: "Mother with stroke at age 78. Father with MI at age 72. Sister with atrial fibrillation.",
      socialHistory: "Never smoker. Occasional alcohol. Sedentary lifestyle. Works from home as a bookkeeper. Lives with husband.",
      reviewOfSystems: "Positive for left-sided weakness, slurred speech, right facial droop. Negative for headache, vision changes, loss of consciousness, chest pain.",
      physicalExam: "BP 186/102, HR 78, irregularly irregular (atrial fibrillation!). NIHSS: 8 (facial palsy, left arm drift, left leg drift, aphasia, ataxia). Left-sided upper and lower motor neuron weakness (4/5 arm, 3/5 leg). Right facial droop. Speech dysarthric. No neglect. Pupils equal and reactive.",
      assessment: "Acute ischemic stroke, right MCA territory. Atrial fibrillation noted on exam — likely cardioembolic source. Within thrombolytic window (onset 14:30, presentation 15:30 — 60 min). CT head to rule out hemorrhage. tPA consideration.",
      plan: "STAT non-contrast head CT. CT angiography head and neck. ECG to confirm AFib. tPA if no hemorrhage on CT (within window, NIHSS 8, no contraindications). Code stroke activated. Neurology consult. BP control — labetalol if > 185/110 (tPA contraindication threshold).",
      mdm: "High complexity — acute stroke with potential for tPA, new AFib discovery, BP control issues.",
      nursingNotes: "Code stroke activated at 15:35. CT scanner ready. tPA order standing pending CT results. Labetalol 10mg IV given — BP now 178/98. NIHSS completed. tPA window: 110 minutes from onset at this time."
    },
    medications: [
      { name: "Lisinopril", dose: "20mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2023-10-10", type: "existing" },
      { name: "Amlodipine", dose: "5mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2024-04-15", type: "existing" }
    ],
    problems: [
      { name: "Hypertension", category: "cardiovascular", status: "active", annotation: "Poorly controlled" },
      { name: "Obesity", category: "metabolic", status: "active", annotation: "BMI 30" },
      { name: "Acute Ischemic Stroke", category: "neurologic", status: "active", annotation: "Right MCA territory, today" },
      { name: "Atrial Fibrillation", category: "cardiovascular", status: "active", annotation: "Newly discovered" }
    ],
    orders: [
      { type: "labs", category: "Hematologic", name: "CBC", priority: "STAT", status: "Pending", notes: "" },
      { type: "labs", category: "Hematologic", name: "PT/INR", priority: "STAT", status: "Pending", notes: "tPA contraindication check" },
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "STAT", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "Glucose", priority: "STAT", status: "Pending", notes: "Stroke mimic check" },
      { type: "imaging", category: "Radiology", name: "CT Head non-contrast", priority: "STAT", status: "Pending", notes: "Rule out hemorrhage" },
      { type: "imaging", category: "Radiology", name: "CT Angiogram Head/Neck", priority: "STAT", status: "Pending", notes: "Large vessel occlusion check" }
    ],
    consultations: [
      { specialty: "Neurology", requestedDate: "2025-01-15", status: "Pending", consultant: "Dr. Patel", summary: "" },
      { specialty: "Cardiology", requestedDate: "2025-01-15", status: "Pending", consultant: "", summary: "" }
    ],
    studies: [
      { name: "EKG", studyDate: "2025-01-15", status: "Final", notes: "Atrial fibrillation with rapid ventricular response", result: "Atrial fibrillation, ventricular rate 78 bpm. No ST changes." }
    ],
    nursingNote: {
      nurseName: "Jennifer Clark, RN",
      time: "03:35 PM",
      bloodPressure: "186/102",
      heartRate: "78",
      temperature: "98.4",
      weight: "204 lbs",
      note: "Code stroke activated. CT scanner notified. tPA standing. Labetalol 10mg IV given. NIHSS = 8. Patient NPO. Head of bed elevated 30 degrees. Neuro checks q15min."
    }
  },
  {
    id: "CASE-010",
    specialty: "neurology",
    difficulty: "medium",
    patient: {
      name: "William Foster",
      dob: "1955-04-08",
      sex: "M",
      age: "69",
      cc: "New-onset seizures",
      phone: "555-0178",
      ins: "Aetna Medicare",
      bp: "142/88",
      hr: "82",
      temp: "98.7",
      wt: "178 lbs"
    },
    allergies: [
      { allergen: "Morphine", type: "drug", reaction: "Nausea", firstEncounter: "2012-08-15" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2024-06-20",
        chiefComplaint: "Occasional headaches",
        hpi: "68M with 2 months of occasional morning headaches. Describes as 'pressure' in the front. No nausea or vomiting. Resolves by afternoon. Not waking from sleep with headaches.",
        pmh: "Hypertension, Hyperlipidemia",
        surgicalHistory: "Right BMA (2016)",
        assessment: "Tension-type headaches, likely.",
        plan: "Trial of sumatriptan 50mg PRN. Limit to 2x/week. Return if headaches worsen or character changes.",
        physicalExam: "BP 140/86. Neuro exam nonfocal. Normal fundoscopic exam. No meningismus."
      }
    ],
    currentEncounter: {
      visitType: "er_visit",
      chiefComplaint: "New-onset seizure",
      hpi: "69M brought in by EMS after a witnessed generalized tonic-clonic seizure at 10:30 AM today. Wife found him on the floor, shaking, unresponsive for approximately 3 minutes. Post-ictal confusion for 30 minutes. No prior seizure history. Patient reports his headaches have worsened over the past 2 weeks — now daily, worse in the morning, associated with nausea. Denies trauma, fever, or recent illness. Reports some difficulty with his right hand over the past month — 'dropping things.'",
      pmh: "Hypertension, Hyperlipidemia",
      surgicalHistory: "Right BMA (2016)",
      hospitalizations: "2016 — BMA admission. 2020 — pneumonia, treated outpatient.",
      healthMaintenance: "Colonoscopy 2018 — normal. Last mammogram — N/A. Flu shot 2024-11.",
      familyHistory: "Father with brain tumor (meningioma) at age 74. Mother with breast cancer at age 58.",
      socialHistory: "Former smoker (quit 2018, 35 pack-years). Moderate alcohol (2-3 glasses wine/day). Retired engineer. Lives with wife.",
      reviewOfSystems: "Positive for seizures, worsening headaches with nausea, right hand weakness. Negative for vision changes, speech difficulty, fever, weight loss, or trauma.",
      physicalExam: "BP 142/88, HR 82. Alert and oriented post-ictal. Left homonymous hemianopsia on confrontation. Right hand grip 4/5. Decreased right plantar reflex. Fundoscopy: papilledema (bilateral). Otherwise nonfocal.",
      assessment: "New-onset seizure in an older adult — highly suspicious for intracranial mass lesion (brain tumor vs metastasis). Worsening headaches, papilledema, right hand weakness, and left homonymous hemianopsia localize to right hemisphere. MRI brain urgently needed.",
      plan: "MRI brain with and without contrast (STAT). Levetiracetam 1000mg BID for seizure prophylaxis. Dexamethasone 4mg BID for peritumoral edema. Neurosurgery consult. CT head non-contrast as bridge if MRI not immediately available.",
      mdm: "High complexity — new-onset seizure with focal neuro deficits and papilledema, high suspicion for brain tumor.",
      nursingNotes: "Patient post-ictal, now alert. Seizure precautions in place. IV levetiracetam 1000mg given. Dexamethasone 4mg given. MRI scheduled for 8 AM tomorrow. Family present and supportive."
    },
    medications: [
      { name: "Lisinopril", dose: "20mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2010-05-01", type: "existing" },
      { name: "Atorvastatin", dose: "20mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2010-05-01", type: "existing" },
      { name: "Sumatriptan", dose: "50mg", freq: "PRN", route: "PO", prescriber: "Dr. Adams", start: "2024-06-20", type: "existing" }
    ],
    problems: [
      { name: "Hypertension", category: "cardiovascular", status: "active", annotation: "" },
      { name: "Hyperlipidemia", category: "metabolic", status: "active", annotation: "" },
      { name: "New-onset Seizure", category: "neurologic", status: "active", annotation: "Suspected intracranial mass" },
      { name: "Headaches", category: "neurologic", status: "active", annotation: "Worsening, likely secondary" }
    ],
    orders: [
      { type: "labs", category: "Hematologic", name: "CBC", priority: "Routine", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "Routine", status: "Pending", notes: "" },
      { type: "imaging", category: "Radiology", name: "MRI Brain with and without contrast", priority: "STAT", status: "Pending", notes: "Rule out mass lesion" },
      { type: "imaging", category: "Radiology", name: "CT Head non-contrast", priority: "STAT", status: "Pending", notes: "Bridge if MRI not available" }
    ],
    consultations: [
      { specialty: "Neurosurgery", requestedDate: "2025-01-15", status: "Pending", consultant: "Dr. Williams", summary: "" }
    ],
    studies: [],
    nursingNote: {
      nurseName: "Patricia Green, RN",
      time: "12:15 PM",
      bloodPressure: "142/88",
      heartRate: "82",
      temperature: "98.7",
      weight: "178 lbs",
      note: "Patient now alert and oriented x3. Seizure precautions maintained. Levetiracetam 1000mg IV given. Dexamethasone 4mg IV given. Wife at bedside. Neuro checks q1h ordered."
    }
  }
];
