const mammoth = require('mammoth');
const { PDFParse, VerbosityLevel } = require('pdf-parse');

function parseEHRText(text) {
  const patientData = {
    name: '',
    dob: '',
    sex: '',
    mr: '',
    cc: '',
    appt: '',
    sched: '',
    status: 'waiting',
    age: 0,
    phone: '—',
    ins: '—',
    allergy: 'None',
    bp: '—',
    hr: '—',
    temp: '—',
    wt: '—',
    notes: text,
    visits: []
  };

  // Extract name
  const nameMatch = text.match(/([A-Z][A-Z\s\/]+)\s+is\s+a\s+\d+\s+y\/o/i) || text.match(/Patient\s*Name:\s*(.*?)(?=\s*MRN:|$)/i);
  if (nameMatch) {
    patientData.name = nameMatch[1].trim();
  }

  // Extract MRN
  const mrMatch = text.match(/MRN:\s*(\d+)/i);
  if (mrMatch) {
    patientData.mr = 'MR-' + mrMatch[1];
  }

  // Extract age
  const ageMatch = text.match(/(\d+)\s+y\/o/i);
  if (ageMatch) {
    patientData.age = parseInt(ageMatch[1]);
  }

  // Extract sex
  const sexMatch = text.match(/(\d+)\s+y\/o\s+(male|female)/i);
  if (sexMatch) {
    patientData.sex = sexMatch[2].charAt(0).toUpperCase();
  }

  // Extract chief complaint from most recent visit
  const ccMatch = text.match(/CC:\s*([^\n]+)/i);
  if (ccMatch) {
    patientData.cc = ccMatch[1].trim();
  }

  // Extract allergies
  const allergyMatch = text.match(/ALL:\s*([^\n]+)/i);
  if (allergyMatch) {
    const allergy = allergyMatch[1].trim();
    if (allergy !== 'NKDA' && allergy !== 'None' && allergy !== 'NKA' && allergy !== 'No known drug allergies' && allergy !== 'No known drug allergies.') {
      patientData.allergy = allergy;
    }
  }

  // Extract vital signs from most recent visit
  const bpMatch = text.match(/BP\s*[:]\s*(\d+\/\d+)/i);
  if (bpMatch) {
    patientData.bp = bpMatch[1];
  }

  const hrMatch = text.match(/HR\s*[:]\s*(\d+)/i);
  if (hrMatch) {
    patientData.hr = hrMatch[1];
  }

  const tempMatch = text.match(/Temp\s*[:]\s*([\d.]+[°CF]?)/i);
  if (tempMatch) {
    patientData.temp = tempMatch[1];
  }

  // Accept absolute dates (already formatted) as-is
  const knownDateMatch = text.match(/(?:Date of Visit|Date):\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (knownDateMatch) {
    patientData.visitDate = knownDateMatch[1];
  }

  // Extract DOB
  const dobMatch = text.match(/DOB:\s*(.*?)(?=\s*(?:Date of Visit|Date):|$)/i);
  if (dobMatch) {
    patientData.dob = dobMatch[1].trim();
  }

  // Parse visits
  patientData.visits = parseVisits(text);

  // Generate MR number if not found
  if (!patientData.mr) {
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    patientData.mr = `MR-${randomNum}`;
  }

  // Generate default appointment time
  const now = new Date();
  const hours = now.getHours() + 1;
  const minutes = Math.floor(Math.random() * 4) * 15;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours;
  patientData.appt = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  // Generate DOB from age (only if not already set from DOB: field)
  if (!patientData.dob) {
    const currentYear = now.getFullYear();
    const birthYear = currentYear - patientData.age;
    patientData.dob = `01/01/${birthYear}`;
  }

  return patientData;
}

function resolveRelativeDate(relativeStr) {
  if (!relativeStr) return '';
  const lower = relativeStr.toLowerCase().trim();
  const now = new Date();

  if (lower === 'today') {
    return now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }
  if (lower === 'yesterday') {
    const d = new Date(now); d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  const numMatch = lower.match(/(\d+)\s+(month|year|day|week)s?\s+ago/i);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    const unit = numMatch[2].toLowerCase();
    const d = new Date(now);
    if (unit === 'year') d.setFullYear(d.getFullYear() - num);
    else if (unit === 'month') d.setMonth(d.getMonth() - num);
    else if (unit === 'week') d.setDate(d.getDate() - num * 7);
    else if (unit === 'day') d.setDate(d.getDate() - num);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }

  return relativeStr;
}

function parseVisits(text) {
  const visits = [];

  const visitPattern = /(TODAY['’]S\s+(?:NURSING|TRIAGE|NURSING\/TRIAGE)\s*NOTE|PMD\s+VISIT|ER\s+VISIT|SURGERY\s+CLINIC|OFFICE\s+VISIT)\s*(?:\s*\()?(\d+\s+(?:month|year|day|week)s?\s+ago|today|yesterday)?/gi;
  const matches = [...text.matchAll(visitPattern)];

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const startIndex = match.index;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
      const section = text.substring(startIndex, endIndex);

      const visit = parseVisitSection(section);
      if (visit && (visit.chief_complaint || visit.history_present_illness || visit.nursing_notes || visit.assessment)) {
        visits.push(visit);
      }
    }
  } else {
    // No visit-section headers found — treat whole text as a single visit
    const visit = parseSimpleFormat(text);
    if (visit) visits.push(visit);
  }

  return visits;
}

function parseVisitSection(section) {
  const visit = {
    type: '',
    date: '',
    chief_complaint: '',
    history_present_illness: '',
    past_medical_history: '',
    surgical_history: '',
    hospitalizations: '',
    health_maintenance: '',
    family_history: '',
    social_history: '',
    review_of_systems: '',
    allergies: '',
    physical_exam: '',
    medical_decision_making: '',
    assessment: '',
    plan: '',
    nursing_notes: '',
    medications: [],
    labs: [],
    imaging: []
  };

  // Determine visit type from the section header only (avoid false matches in HPI text)
  const headerMatch = section.match(/^(TODAY['’]S\s+(?:NURSING|TRIAGE|NURSING\/TRIAGE)\s*NOTE|PMD\s+VISIT|ER\s+VISIT|SURGERY\s+CLINIC|OFFICE\s+VISIT)/im);
  const header = headerMatch ? headerMatch[1].toLowerCase() : '';
  if (header.includes('er')) {
    visit.type = 'Emergency Room';
  } else if (header.includes('pmd') || header.includes('office')) {
    visit.type = 'Primary Care';
  } else if (header.includes('surgery')) {
    visit.type = 'Surgery Clinic';
  } else if (header.includes('today')) {
    visit.type = 'Current Visit';
  }

  // Extract date and resolve relative dates
  const dateMatch = section.match(/(\d+\s+(?:month|year|day|week)s?\s+ago|today|yesterday)/i);
  if (dateMatch) {
    visit.date = resolveRelativeDate(dateMatch[1]);
  }

  // Extract CC — try CC: field first, then "presents with" or "Patient here with" as fallback
  const ccMatch = section.match(/CC:\s*([^\n]+)/i);
  if (ccMatch) {
    visit.chief_complaint = ccMatch[1].trim();
  } else {
    const ccFallback = section.match(/(?:presents|Patient here)\s+(?:today\s+)?with\s+([^.\n]+)/i);
    if (ccFallback) {
      visit.chief_complaint = ccFallback[1].trim();
    }
  }

  // Extract HPI — try HPI: field first, then S: (SOAP subjective) as fallback
  const hpiMatch = section.match(/HPI:\s*([\s\S]*?)(?=ALL:|Soc:|PE:|Medical Decision Making:)/i);
  if (hpiMatch) {
    visit.history_present_illness = hpiMatch[1].trim();
  } else {
    const sMatch = section.match(/(?:^|\n)\s*S:\s*([\s\S]*?)(?=\n\s*[OAP]:)/);
    if (sMatch) {
      visit.history_present_illness = sMatch[1].trim();
    }
  }

  // Extract ALL
  const allMatch = section.match(/ALL:\s*([^\n]+)/i);
  if (allMatch) {
    visit.allergies = allMatch[1].trim();
  }

  // Extract PE — try PE: first, then O: (SOAP Objective) as fallback
  const peMatch = section.match(/PE:\s*([\s\S]*?)(?=Medical Decision Making:|Assessment:|Reassess:|A\/P:)/i);
  if (peMatch) {
    visit.physical_exam = peMatch[1].trim();
  } else {
    const oMatch = section.match(/(?:^|\n)\s*O:\s*([\s\S]*?)(?=\n\s*A\/P:)/i);
    if (oMatch) {
      visit.physical_exam = oMatch[1].trim();
    }
  }

  // Extract Medical Decision Making
  const mdmMatch = section.match(/Medical Decision Making:\s*([\s\S]*?)(?=Reassess:|Assessment:|A\/P:)/i);
  if (mdmMatch) {
    visit.medical_decision_making = mdmMatch[1].trim();
  }

  // Extract Reassess text (may appear multiple times)
  let reassessText = '';
  const reassessMatches = [...section.matchAll(/Reassess:\s*([\s\S]*?)(?=Reassess:|Assessment:|Plan:|Nursing Discharge|Meds given|Labs & Imaging|$)/gi)];
  if (reassessMatches.length > 0) {
    reassessText = reassessMatches.map(m => m[1].trim()).filter(Boolean).join('\n\n');
  }

  // Extract Assessment (merge MDM + Reassess + Assessment)
  let assessmentText = '';
  const assessMatch = section.match(/(?:Assessment|A\/P):\s*([\s\S]*?)(?=Plan:|Nursing Discharge|Meds given|Labs & Imaging|$)/i);
  if (assessMatch) {
    assessmentText = assessMatch[1].trim();
  }

  const mdm = visit.medical_decision_making ? visit.medical_decision_making + '\n\n' : '';
  const reassess = reassessText ? 'Reassessment: ' + reassessText + '\n\n' : '';
  visit.assessment = [mdm, reassess, assessmentText].filter(Boolean).join('').trim();

  // Extract Plan
  const planMatch = section.match(/Plan:\s*([\s\S]*?)(?=Nursing|Meds given|Labs & Imaging|$)/i);
  if (planMatch) {
    visit.plan = planMatch[1].trim();
  }

  // Extract Nursing notes — try standard pattern first, then TODAY'S NURSING/TRIAGE NOTE
  const nursingMatch = section.match(/(?:Nursing|nursing)\s*(?:triage|reassess|discharge)?\s*note:\s*([\s\S]*?)(?=ER MD Note:|MD SOAP Note:|Meds given|Labs & Imaging|$)/i);
  if (nursingMatch) {
    let nursingText = nursingMatch[1].trim();
    nursingText = nursingText.replace(/MD SOAP Note:([\s\S]*?)(?=$)/i, '').trim();
    visit.nursing_notes = nursingText;
  } else {
    const nursingTriageMatch = section.match(/TODAY['’]S\s+NURSING\/TRIAGE NOTE:\s*([\s\S]*?)(?=PMD VISIT|ER VISIT|SURGERY CLINIC|OFFICE VISIT|$)/i);
    if (nursingTriageMatch) {
      visit.nursing_notes = nursingTriageMatch[1].trim();
    }
  }

  // Extract medications given - parse dosage, route, etc.
  const medsMatch = section.match(/Meds given during this encounter:\s*([\s\S]*?)(?=Labs & Imaging|Nursing Discharge|$)/i);
  if (medsMatch) {
    const medsText = medsMatch[1].trim();
    const medEntries = medsText.split(/,\s*(?=[A-Z])/).filter(m => m.trim());
    visit.medications = medEntries.map(med => {
      const medObj = { name: '', dose: '', route: '' };
      const doseMatch = med.match(/(\d+\.?\d*\s*(?:mg|g|mcg|ml|units?))/i);
      if (doseMatch) {
        medObj.dose = doseMatch[1];
        medObj.name = med.replace(doseMatch[0], '').trim();
      } else {
        medObj.name = med.trim();
      }
      const routeMatch = med.match(/\b(iv|po|im|sc|subq|sl|pr|topical|inh)\b/i);
      if (routeMatch) {
        medObj.route = routeMatch[1].toUpperCase();
        medObj.name = medObj.name.replace(routeMatch[0], '').trim();
      }
      return medObj;
    });
  }

  // Extract Labs — handle parenthetical lists and comma-separated items
  const labsMatch = section.match(/Labs:\s*([\s\S]*?)(?=\n\s*\n|US:|CT:|MRI:|X-ray:|$)/i);
  if (labsMatch) {
    const labsText = labsMatch[1].trim();
    let allLabs = [];
    // Extract items from parenthetical lists
    const parenItems = [...labsText.matchAll(/\(([^)]+)\)/g)];
    if (parenItems.length > 0) {
      parenItems.forEach(m => {
        allLabs = allLabs.concat(m[1].split(',').map(l => l.trim()).filter(l => l));
      });
    }
    // Extract outer text items
    const cleaned = labsText.replace(/\([^)]*\)/g, '').trim();
    const outerItems = cleaned.split(',').map(l => l.trim()).filter(l => l);
    outerItems.forEach(item => {
      const trimmed = item.replace(/^.*?:\s*/, '').trim();
      if (trimmed && !trimmed.match(/^(the\s+following|labs\s+would\s+be|normal|ordered)/i)) {
        if (!allLabs.includes(trimmed)) allLabs.push(trimmed);
      }
    });
    visit.labs = allLabs;
  }

  // Extract Imaging
  const imagingMatch = section.match(/(?:US|CT|MRI|X-ray):\s*([^\n]+)/i);
  if (imagingMatch) {
    const imagingText = imagingMatch[1].trim();
    visit.imaging.push(imagingText);
  }

  return visit;
}

function parseSimpleFormat(text) {
  const visit = {
    type: 'Emergency Room',
    date: '',
    chief_complaint: '',
    history_present_illness: '',
    past_medical_history: '',
    surgical_history: '',
    hospitalizations: '',
    health_maintenance: '',
    family_history: '',
    social_history: '',
    review_of_systems: '',
    allergies: '',
    physical_exam: '',
    medical_decision_making: '',
    assessment: '',
    plan: '',
    nursing_notes: '',
    medications: [],
    labs: [],
    imaging: []
  };

  const nextSection = '(?:Past Medical History|Past Surgical History|Hospitalizations|Health Maintenance|Immunizations|Family History|Social History|Review of Systems|Medications|Allergies|Vital Signs|Physical Examination|Assessment|Plan|Disposition|Discharge|$)';

  // Date of Visit
  const dvMatch = text.match(/(?:Date of Visit|Date):\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (dvMatch) visit.date = dvMatch[1];

  // Chief Complaint
  const ccMatch = text.match(/Chief\s+Complaint\s*\n\s*([\s\S]*?)(?=\n\s*(?:History of Present|Past Medical|Past Surgical|Hospitalizations|Health Maintenance|Family History|Social History|Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (ccMatch) visit.chief_complaint = ccMatch[1].trim();

  // History of Present Illness
  const hpiMatch = text.match(/History\s+of\s+Present\s+Illness\s*\n\s*([\s\S]*?)(?=\n\s*(?:Past Medical|Past Surgical|Hospitalizations|Health Maintenance|Family History|Social History|Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (hpiMatch) visit.history_present_illness = hpiMatch[1].trim();

  // Past Medical History
  const pmhMatch = text.match(/Past\s+Medical\s+History\s*\n\s*([\s\S]*?)(?=\n\s*(?:Past Surgical|Hospitalizations|Health Maintenance|Family History|Social History|Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (pmhMatch) visit.past_medical_history = pmhMatch[1].trim();

  // Past Surgical History
  const surgMatch = text.match(/Past\s+Surgical\s+History\s*\n\s*([\s\S]*?)(?=\n\s*(?:Hospitalizations|Health Maintenance|Family History|Social History|Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (surgMatch) visit.surgical_history = surgMatch[1].trim();

  // Hospitalizations
  const hospMatch = text.match(/Hospitalizations\s*\n\s*([\s\S]*?)(?=\n\s*(?:Health Maintenance|Family History|Social History|Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (hospMatch) visit.hospitalizations = hospMatch[1].trim();

  // Health Maintenance / Immunizations
  const healthMatch = text.match(/(?:Health\s+Maintenance|Immunizations)\s*\n\s*([\s\S]*?)(?=\n\s*(?:Family History|Social History|Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (healthMatch) visit.health_maintenance = healthMatch[1].trim();

  // Family History
  const famMatch = text.match(/Family\s+History\s*\n\s*([\s\S]*?)(?=\n\s*(?:Social History|Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (famMatch) visit.family_history = famMatch[1].trim();

  // Social History
  const socMatch = text.match(/Social\s+History\s*\n\s*([\s\S]*?)(?=\n\s*(?:Review of Systems|Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (socMatch) visit.social_history = socMatch[1].trim();

  // Review of Systems
  const rosMatch = text.match(/Review\s+of\s+Systems\s*\n\s*([\s\S]*?)(?=\n\s*(?:Medications|Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (rosMatch) visit.review_of_systems = rosMatch[1].trim();

  // Allergies
  const allMatch = text.match(/Allergies\s*\n\s*([\s\S]*?)(?=\n\s*(?:Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (allMatch) {
    const allergy = allMatch[1].trim();
    if (allergy !== 'NKDA' && allergy !== 'None' && allergy !== 'NKA' && allergy !== 'No known drug allergies' && allergy !== 'No known drug allergies.') {
      visit.allergies = allergy;
    }
  }

  // Physical Examination
  const peMatch = text.match(/Physical\s*Examination\s*\n\s*([\s\S]*?)(?=\n\s*(?:Assessment|Plan|Disposition|Discharge|$))/i);
  if (peMatch) visit.physical_exam = peMatch[1].trim();

  // Medical Decision Making
  const mdmMatch = text.match(/Medical\s+Decision\s+Making\s*\n\s*([\s\S]*?)(?=\n\s*(?:Assessment|Plan|Disposition|Discharge|$))/i);
  if (mdmMatch) visit.medical_decision_making = mdmMatch[1].trim();

  // Assessment
  const assessMatch = text.match(/Assessment\s*\n\s*([\s\S]*?)(?=\n\s*(?:Plan|Disposition|Discharge|$))/i);
  if (assessMatch) visit.assessment = assessMatch[1].trim();

  // Plan
  const planMatch = text.match(/Plan\s*\n\s*([\s\S]*?)(?=\n\s*(?:Disposition|Discharge|$))/i);
  if (planMatch) visit.plan = planMatch[1].trim();

  // Medications
  const medsBlock = text.match(/Medications\s*\n\s*([\s\S]*?)(?=\n\s*(?:Allergies|Vital|Physical|Assessment|Plan|Disposition|Discharge|$))/i);
  if (medsBlock) {
    const medsText = medsBlock[1].trim();
    const medEntries = medsText.split(/;\s*/).filter(m => m.trim());
    visit.medications = medEntries.map(med => {
      const medObj = { name: med.trim(), dose: '', route: '' };
      const doseMatch = med.match(/(\d+\s*(?:mg|g|mcg|ml))/i);
      if (doseMatch) {
        medObj.dose = doseMatch[1];
        medObj.name = med.replace(doseMatch[0], '').replace(/[,;].*$/, '').replace(/\.$/, '').replace(/\s+/g, ' ').trim();
      }
      return medObj;
    });
  }

  return visit;
}

async function parseEHRFile(buffer, mimeType) {
  let text = '';

  if (mimeType === 'application/pdf') {
    const pdf = new PDFParse({ data: buffer, verbosity: VerbosityLevel.ERRORS });
    await pdf.load();
    const pdfResult = await pdf.getText();
    text = pdfResult.text;
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error('Unsupported file type');
  }

  return parseEHRText(text);
}

module.exports = { parseEHRFile, parseEHRText };
