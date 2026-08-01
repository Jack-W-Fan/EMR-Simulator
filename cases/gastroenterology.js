module.exports = [
  {
    id: "CASE-007",
    specialty: "gastroenterology",
    difficulty: "hard",
    patient: {
      name: "Anthony DeLuca",
      dob: "1962-05-14",
      sex: "M",
      age: "62",
      cc: "Hematemesis and black tarry stools",
      phone: "555-0634",
      ins: "UnitedHealthcare",
      bp: "90/58",
      hr: "116",
      temp: "98.4",
      wt: "155 lbs"
    },
    allergies: [
      { allergen: "Ibuprofen", type: "drug", reaction: "GI upset, prior ulcer", firstEncounter: "2014-09-02" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2023-08-20",
        chiefComplaint: "Epigastric pain",
        hpi: "61M with 3 months of epigastric burning after meals. Reports it started after increasing NSAID use for knee pain. No weight loss, no melena.",
        pmh: "No significant medical history",
        surgicalHistory: "Tonsillectomy (childhood)",
        assessment: "Likely NSAID-induced gastritis vs PUD.",
        plan: "Start pantoprazole 40mg daily. Advised to stop ibuprofen. H. pylori stool antigen ordered. Follow up in 4 weeks.",
        physicalExam: "BP 132/80. Abdomen soft, mild epigastric tenderness. No masses. No hepatosplenomegaly."
      },
      {
        type: "office_visit",
        visitDate: "2023-09-17",
        chiefComplaint: "Follow-up — H. pylori result",
        hpi: "H. pylori stool antigen negative. Epigastric pain improved on pantoprazole.",
        pmh: "Gastritis",
        surgicalHistory: "Tonsillectomy (childhood)",
        assessment: "Gastritis, improving. H. pylori negative.",
        plan: "Continue pantoprazole 40mg for 2 more weeks, then taper. Discontinued ibuprofen. Switched to acetaminophen for knee pain.",
        physicalExam: "BP 128/78. Epigastric tenderness resolved."
      }
    ],
    currentEncounter: {
      visitType: "er_visit",
      chiefComplaint: "Vomiting blood and black tarry stools",
      hpi: "62M with history of NSAID-induced PUD presents with acute hematemesis. Last night at dinner, vomited approximately 300mL of bright red blood mixed with food. Earlier that day noticed black, tarry stools (estimated 3 episodes). Reports his epigastric pain returned 2 weeks ago after he restarted ibuprofen for his knee — 'forgot the warning.' Reports lightheadedness standing up, had to sit down in the bathroom. Denies liver disease, alcohol abuse, or prior varices.",
      pmh: "Peptic ulcer disease (2023), Gastritis, Hypertension (newly diagnosed 2022)",
      surgicalHistory: "Tonsillectomy (childhood)",
      hospitalizations: "None",
      healthMaintenance: "Never had colonoscopy or EGD. Last physical 2022 — BP 140/90.",
      familyHistory: "Father with GI bleed at age 70 (ulcer). Mother alive, age 89. Brother with colon cancer (2019).",
      socialHistory: "Former smoker (quit 2015, 20 pack-years). Alcohol: 3-4 beers/night, 5-6 nights/week — 'started again after work stress.' NSAID use — restarted ibuprofen 600mg BID 2 weeks ago for knee pain.",
      reviewOfSystems: "Positive for hematemesis, melena, lightheadedness. Negative for jaundice, RUQ pain, abdominal pain (denies pain at this time). Positive for orthostatic symptoms.",
      physicalExam: "BP 90/58 (supine), HR 116. Pale, diaphoretic. Orthostatic: BP drops to 78/48 standing. Conjunctival pallor. Sclera anicteric. Abdomen soft, non-tender, normoactive. No hepatosplenomegaly. No caput medusae or abdominal wall collaterals. Rectal: black tarry stool, guaiac positive. Two large-bore IVs placed.",
      assessment: "Acute upper GI bleed, likely from recurrent PUD (NSAID-induced). Hemodynamically unstable (tachycardic, orthostatic, borderline hypotensive). Needs emergent resuscitation and GI consult for EGD.",
      plan: "Two large-bore IVs. Fluid resuscitation: 2L LR bolus, then 250mL/hr. Type and cross for 2 units PRBCs. Transfuse if Hgb < 7 or ongoing instability. IV pantoprazole 80mg bolus then 8mg/hr infusion. IV ondansetron for nausea. GI emergent consult for EGD within 12 hours. NPO. Monitor vitals q15min.",
      mdm: "High complexity — hemodynamically unstable GI bleed requiring transfusion and emergent endoscopy.",
      nursingNotes: "Two large-bore IVs (18G) placed in right AC and left cephalic. LR 2L bolus pushed. T&C sent. Vitals unstable — q15 monitoring started. Patient NPO. GI paged for emergent EGD. Patient appears anxious and pale."
    },
    medications: [
      { name: "Lisinopril", dose: "10mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2022-06-15", type: "existing" },
      { name: "Pantoprazole", dose: "40mg", freq: "Daily", route: "PO", prescriber: "Dr. Adams", start: "2023-08-20", type: "existing" }
    ],
    problems: [
      { name: "Peptic Ulcer Disease", category: "Gastrointestinal", status: "active", annotation: "Recurrent, NSAID-induced" },
      { name: "Upper GI Bleed", category: "Gastrointestinal", status: "active", annotation: "Acute, hemodynamically unstable" },
      { name: "Hypertension", category: "Cardiovascular", status: "active", annotation: "Newly diagnosed 2022" }
    ],
    orders: [
      { type: "labs", category: "Hematologic", name: "CBC", priority: "STAT", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "STAT", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "LFTs", priority: "Urgent", status: "Pending", notes: "Evaluate liver disease" },
      { type: "labs", category: "Hematologic", name: "Type and Crossmatch", priority: "STAT", status: "Pending", notes: "2 units PRBCs" },
      { type: "labs", category: "Blood Plasma/Serum", name: "Coags", priority: "STAT", status: "Pending", notes: "INR/PTT" }
    ],
    consultations: [
      { specialty: "Gastroenterology", requestedDate: "2025-01-15", status: "Pending", consultant: "Dr. Martinez", summary: "" }
    ],
    studies: [],
    nursingNote: {
      nurseName: "Rita Hernandez, RN",
      time: "06:15 AM",
      bloodPressure: "90/58",
      heartRate: "116",
      temperature: "98.4",
      weight: "155 lbs",
      note: "Patient admitted via ER with active hematemesis. Two large-bore IVs in place. LR bolus given. Blood drawn for CBC, BMP, coags, type and cross. GI consult placed. NPO strictly."
    }
  },
  {
    id: "CASE-008",
    specialty: "gastroenterology",
    difficulty: "medium",
    patient: {
      name: "Priya Sharma",
      dob: "1992-08-19",
      sex: "F",
      age: "32",
      cc: "Right upper quadrant pain after eating",
      phone: "555-0845",
      ins: "Cigna",
      bp: "118/74",
      hr: "78",
      temp: "99.8",
      wt: "168 lbs"
    },
    allergies: [
      { allergen: "NKDA", type: "drug", reaction: "None", firstEncounter: "2019-03-10" }
    ],
    previousEncounters: [
      {
        type: "office_visit",
        visitDate: "2024-04-22",
        chiefComplaint: "Occasional right upper quadrant discomfort",
        hpi: "31F reports occasional RUQ discomfort after fatty meals. Lasted about 1-2 hours, resolved on its own. Happened 3 times in the past month. No nausea or vomiting. No jaundice.",
        pmh: "None",
        surgicalHistory: "None",
        assessment: "Biliary colic — intermittent, mild. Ultrasound ordered.",
        plan: "RUQ ultrasound. Diet modification — avoid fatty foods. Surgery consult if ultrasound shows stones and symptoms persist.",
        physicalExam: "BP 116/72. RUQ tender but no guarding or rebound. Murphy's sign negative."
      }
    ],
    currentEncounter: {
      visitType: "office_visit",
      chiefComplaint: "Right upper quadrant pain after eating",
      hpi: "32F presents with 6 hours of severe RUQ pain that started after eating fried chicken and mac and cheese last night. Pain is constant, 8/10, radiating to right shoulder blade. Associated with nausea and one episode of vomiting (undigested food). Reports similar but milder episodes over the past 3 months, but this is the worst yet. No fever at home. No jaundice noticed. Two children (ages 8 and 5). Not on birth control.",
      pmh: "None significant",
      surgicalHistory: "None",
      hospitalizations: "None",
      healthMaintenance: "Up to date. Last Pap 2023 — normal.",
      familyHistory: "Mother with gallbladder disease, had cholecystectomy at 45. Father with MI at 65.",
      socialHistory: "Non-smoker. Social alcohol. Works as a nurse. Married, 2 children at home.",
      reviewOfSystems: "Positive for RUQ pain, nausea, vomiting, right shoulder pain. Negative for jaundice, fever, changes in stool or urine color, diarrhea.",
      physicalExam: "BP 118/74, HR 78, Temp 99.8F. Mild distress. Sclera anicteric. RUQ tenderness with positive Murphy's sign (arrest of inspiration on palpation). No guarding or rebound. No hepatomegaly. Lungs clear.",
      assessment: "Acute cholecystitis vs biliary colic. Positive Murphy's sign and severity suggest acute cholecystitis. Needs RUQ ultrasound and surgical evaluation.",
      plan: "RUQ ultrasound today. CBC, BMP, LFTs. NPO. IV fluids. Morphine 2mg IV for pain. GI/Surgery consult. If cholecystitis confirmed, admit for IV antibiotics and urgent cholecystectomy.",
      mdm: "Moderate complexity — need to differentiate biliary colic from acute cholecystitis, potential for hospitalization and surgery.",
      nursingNotes: "Patient in moderate distress. NPO ordered. IV started — LR running at 125mL/hr. Pain medication administered. Labs drawn. Ultrasound scheduled."
    },
    medications: [
      { name: "Acetaminophen", dose: "1000mg", freq: "Q6H PRN", route: "PO", prescriber: "Dr. Adams", start: "2024-04-22", type: "existing" }
    ],
    problems: [
      { name: "Cholelithiasis", category: "Gastrointestinal", status: "active", annotation: "" },
      { name: "Acute Cholecystitis", category: "Gastrointestinal", status: "active", annotation: "Suspected, pending imaging" }
    ],
    orders: [
      { type: "labs", category: "Hematologic", name: "CBC", priority: "Urgent", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "BMP", priority: "Urgent", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "LFTs", priority: "Urgent", status: "Pending", notes: "" },
      { type: "labs", category: "Blood Plasma/Serum", name: "Lipase", priority: "Routine", status: "Pending", notes: "Rule out pancreatitis" },
      { type: "imaging", category: "Radiology", name: "RUQ Ultrasound", priority: "Urgent", status: "Pending", notes: "Evaluate for cholelithiasis/cholecystitis" }
    ],
    consultations: [
      { specialty: "General Surgery", requestedDate: "2025-01-15", status: "Pending", consultant: "Dr. Thompson", summary: "" }
    ],
    studies: [],
    nursingNote: {
      nurseName: "Sandra Lee, RN",
      time: "09:30 AM",
      bloodPressure: "118/74",
      heartRate: "78",
      temperature: "99.8",
      weight: "168 lbs",
      note: "Patient in RUQ pain, received morphine 2mg IV. Pain improved to 5/10. NPO maintained. IV running. Labs sent to lab."
    }
  }
];
