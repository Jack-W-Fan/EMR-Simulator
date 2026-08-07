// ── STATE ──
let patients = [];
let currentPatient = null;
let currentSection = 'note';
let currentUser = '';
let currentUserEmail = '';
let currentUserRole = '';
let addendumEnabled = false;
let currentMeds = [];
let currentOrders = [];
let currentProblems = [];
let currentConsultations = [];
let currentStudies = [];
let currentPhysicianNotes = [];
let currentNursingNotes = [];
let currentImaging = [];
let currentAllergies = [];
let currentOrderType = 'all';
let noteFormOpen = false;
let noteFormData = {};
let editingNoteId = null;

const PROBLEM_CATEGORIES = {
  'Cardiovascular':   ['Hypertension','Coronary Artery Disease','Heart Failure','Atrial Fibrillation','Hyperlipidemia','Peripheral Artery Disease','Deep Vein Thrombosis','Pulmonary Embolism','Aortic Stenosis','Dilated Cardiomyopathy','Hypertrophic Cardiomyopathy','Venous Insufficiency','Varicose Veins','Endocarditis','Rheumatic Heart Disease','Myocardial Infarction','Ventricular Tachycardia','Congestive Heart Failure','Pulmonary Hypertension','Cardiomyopathy'],
  'Endocrine':        ['Type 2 Diabetes','Hypothyroidism','Obesity','Metabolic Syndrome','Type 1 Diabetes','Hyperthyroidism','Cushing\'s Syndrome','Addison\'s Disease','Hyperparathyroidism','Adrenal Insufficiency','Polycystic Ovary Syndrome','Diabetes Insipidus','Growth Hormone Deficiency','Hypoglycemia','Hypoparathyroidism'],
  'Respiratory':      ['Asthma','COPD','Obstructive Sleep Apnea','Chronic Bronchitis','Pulmonary Fibrosis','Bronchiectasis','Pulmonary Embolism','Cystic Fibrosis','Interstitial Lung Disease','Pneumonia','Chronic Sinusitis','Sarcoidosis','Acute Respiratory Failure','Lung Cancer','Sleep Apnea'],
  'Musculoskeletal':  ['Osteoarthritis','Rheumatoid Arthritis','Osteoporosis','Low Back Pain','Fibromyalgia','Gout','Ankylosing Spondylitis','Carpal Tunnel Syndrome','Rotator Cuff Syndrome','Tendonitis','Bursitis','Herniated Disc','Degenerative Disc Disease','Scoliosis','Polymyalgia Rheumatica'],
  'Neurological':     ['Migraine','Stroke','Epilepsy','Peripheral Neuropathy','Parkinson\'s Disease','Multiple Sclerosis','Alzheimer\'s Disease','ALS','Dementia','Tension Headache','Transient Ischemic Attack','Bell\'s Palsy','Sciatica','Myasthenia Gravis','Essential Tremor'],
  'Gastrointestinal': ['GERD','IBS','Peptic Ulcer Disease','Crohn\'s Disease','Celiac Disease','Ulcerative Colitis','Diverticulitis','Hemorrhoids','Gastritis','Cholecystitis','Pancreatitis','Liver Cirrhosis','Fatty Liver Disease','H. pylori Infection','Gallstones'],
  'Psychiatric':      ['Major Depressive Disorder','Generalized Anxiety Disorder','Bipolar Disorder','PTSD','OCD','Schizophrenia','ADHD','Social Anxiety Disorder','Panic Disorder','Borderline Personality Disorder','Eating Disorder','Insomnia','Intermittent Explosive Disorder','Substance Use Disorder','Anxiety Disorder'],
  'Dermatological':   ['Eczema','Psoriasis','Acne Vulgaris','Rosacea','Contact Dermatitis','Urticaria','Seborrheic Dermatitis','Atopic Dermatitis','Cellulitis','Melanoma','Basal Cell Carcinoma','Alopecia','Vitiligo','Lichen Planus','Skin Cancer'],
  'Renal/Urologic':   ['Chronic Kidney Disease','Recurrent UTI','Nephrolithiasis','Benign Prostatic Hyperplasia','Polycystic Kidney Disease','End-Stage Renal Disease','Acute Kidney Injury','Overactive Bladder','Interstitial Cystitis','Erectile Dysfunction','Hematuria','Bladder Cancer','Kidney Cancer','Prostate Cancer','Urinary Incontinence'],
  'Infectious':       ['Chronic Hepatitis B','Chronic Hepatitis C','HIV/AIDS','Tuberculosis','Lyme Disease','Hepatitis A','Herpes Simplex Virus','HPV','Shingles','Mononucleosis','Syphilis','Malaria','Endocarditis','Septic Arthritis','Epstein-Barr Virus'],
  'Oncologic':        ['Breast Cancer','Lung Cancer','Prostate Cancer','Colorectal Cancer','Ovarian Cancer','Leukemia','Lymphoma','Multiple Myeloma','Melanoma','Pancreatic Cancer','Thyroid Cancer','Cervical Cancer','Bladder Cancer','Endometrial Cancer','Gastric Cancer'],
};

const ORDER_CATEGORIES = {
  'Hematologic': ['CBC with Differential', 'White Blood Cell Count', 'Red Blood Cell Count', 'Hemoglobin', 'Hematocrit', 'Platelet Count', 'MCV', 'MCH', 'MCHC', 'RDW', 'Reticulocyte Count', 'Peripheral Smear', 'ESR', 'CRP', 'Ferritin', 'Iron Studies', 'Total Iron Binding Capacity', 'Transferrin Saturation', 'Vitamin B12', 'Folate', 'INR', 'Partial Thromboplastin Time (PTT)', 'Prothrombin Time (PT)', 'Thrombin Time', 'D-dimer', 'Fibrin Degradation Products', 'Fibrinogen', 'Hemoglobin A1c', 'ABORH Type', 'Direct Coombs', 'Indirect Coombs', 'Haptoglobin', 'LDH', 'Bleeding Time', 'Clotting Time'],
  'Blood Plasma/Serum': ['Sodium (Na+)', 'Potassium (K+)', 'Chloride (Cl-)', 'Bicarbonate (HCO3-)', 'BMP (Basic Metabolic Panel)', 'CMP (Comprehensive Metabolic Panel)', 'Liver Function Panel', 'Electrolyte Panel', 'Renal Function Panel', 'Urea Nitrogen (BUN)', 'Creatinine', 'Glucose', 'AST (SGOT)', 'ALT (SGPT)', 'Alkaline Phosphatase', 'GGT', 'Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'Albumin', 'Total Protein', 'Lipase', 'Amylase', 'Calcium', 'Phosphorus', 'Magnesium'],
  'Lipids': ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'VLDL Cholesterol', 'ApoA1', 'ApoB', 'Lipoprotein(a)'],
  'Genetics': ['Chromosomal Microarray', 'Karyotype', 'Fragile X Testing', 'BRCA1/2 Testing', 'CFTR Mutation Analysis', 'Pharmacogenomics Panel', 'HLA Typing', 'Newborn Screening', 'Carrier Screening'],
  'Endocrine': ['TSH', 'Free T4', 'Free T3', 'Total T4', 'Total T3', 'TPO Antibodies', 'Thyroglobulin Antibodies', 'Cortisol', 'ACTH', 'IGF-1', 'PTH', 'Vitamin D (25-OH)', 'Vitamin D (1,25-OH)', 'Insulin', 'C-Peptide', 'Glucagon', 'Testosterone', 'Estradiol', 'FSH', 'LH', 'Progesterone', 'Prolactin', 'DHEA-S', 'Androstenedione', 'Cortisol Binding Globulin', 'Sex Hormone Binding Globulin'],
  'Urine': ['Urinalysis', 'Urine Culture', 'Urine Microalbumin', '24-Hour Urine Protein', '24-Hour Urine Creatinine', 'Urine Electrolytes', 'Urine Osmolality', 'Urine Specific Gravity', 'Urine pH', 'Urine Ketones', 'Urine Glucose', 'Urine Protein', 'Urine Red Blood Cells', 'Urine White Blood Cells', 'Urine Casts', 'Urine Crystals', 'Urine Nitrites', 'Urine Leukocyte Esterase', 'Urine Bilirubin', 'Urine Urobilinogen'],
  'Cerebrospinal Fluid': ['CSF Cell Count', 'CSF Protein', 'CSF Glucose', 'CSF Culture', 'CSF VDRL', 'CSF Oligoclonal Bands', 'CSF IgG Index', 'CSF Myelin Basic Protein', 'CSF Opening Pressure', 'CSF Closing Pressure', 'CSF Lactate', 'CSF Chloride'],
  'Infectious Disease': ['Blood Culture', 'Urine Culture', 'Throat Culture', 'Sputum Culture', 'Wound Culture', 'Stool Culture', 'CSF Culture', 'HIV Test', 'HIV Viral Load', 'HIV Genotype', 'Hepatitis A IgM', 'Hepatitis B Surface Antigen', 'Hepatitis B Surface Antibody', 'Hepatitis B Core Antibody', 'Hepatitis B DNA', 'Hepatitis C Antibody', 'Hepatitis C RNA', 'TB Test (PPD)', 'TB Quantiferon', 'TB Culture', 'COVID-19 PCR', 'COVID-19 Antigen', 'COVID-19 Antibody', 'Influenza A/B', 'RSV', 'Streptococcus Group A', 'Chlamydia', 'Gonorrhea', 'Syphilis RPR', 'Syphilis FTA-ABS']
};

const CONSULT_SPECIALTIES = ['Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Nephrology', 'Psychiatry', 'Dermatology'];
const STUDY_OPTIONS = ['EKG', 'Echocardiogram', 'Stress Test', 'PFT', 'Holter Monitor', 'Diabetic Eye Exam', 'ABI', 'Sleep Study'];

const ORDER_NAME_OPTIONS = {
  labs: ORDER_CATEGORIES,
  imaging: {
    'Radiology': ['Chest X-Ray (PA)', 'Chest X-Ray (Lateral)', 'Abdominal X-Ray', 'Skull X-Ray', 'Spine X-Ray', 'Extremity X-Ray'],
    'CT Scan': ['CT Head', 'CT Chest', 'CT Abdomen/Pelvis', 'CT Spine', 'CT Extremity', 'CT Angiography (Chest)', 'CT Angiography (Head/Neck)'],
    'MRI': ['MRI Brain', 'MRI Spine (Cervical)', 'MRI Spine (Thoracic)', 'MRI Spine (Lumbar)', 'MRI Knee', 'MRI Shoulder', 'MRI Abdomen', 'MRI Chest'],
    'Ultrasound': ['Abdominal Ultrasound', 'Renal Ultrasound', 'Pelvic Ultrasound', 'OB Ultrasound', 'Thyroid Ultrasound', 'Carotid Ultrasound', 'Echocardiogram (TTE)', 'Echocardiogram (TEE)', 'Doppler Ultrasound (Lower Extremity)', 'Doppler Ultrasound (Upper Extremity)'],
    'Nuclear Medicine': ['V/Q Scan', 'Thyroid Uptake/Scan', 'Bone Scan', 'PET/CT Scan', 'Myocardial Perfusion Scan (MUGA)', 'HIDA Scan'],
    'Fluoroscopy': ['Upper GI Series', 'Barium Enema', 'IVP (Intravenous Pyelogram)', 'Myelogram', 'Arthrogram'],
    'Mammography': ['Screening Mammogram', 'Diagnostic Mammogram', 'Tomosynthesis (3D Mammogram)'],
    'Interventional': ['Angiography', 'Arteriography', 'Venography', 'Biopsy (Image-Guided)', 'Drainage (Image-Guided)']
  },
  procedures: {
    'Cardiac': ['Echocardiogram (TTE)', 'Echocardiogram (TEE)', 'Stress Test', 'Holter Monitor', 'Cardiac Catheterization', 'Cardioversion', 'Pacemaker Insertion', 'Ablation'],
    'Pulmonary': ['Pulmonary Function Test (PFT)', 'Bronchoscopy', 'Thoracentesis', 'Chest Tube Insertion', 'Sleep Study (Polysomnography)'],
    'Gastrointestinal': ['Upper Endoscopy (EGD)', 'Colonoscopy', 'Sigmoidoscopy', 'ERCP', 'PEG Tube Placement', 'Paracentesis'],
    'Neurological': ['Lumbar Puncture (LP)', 'EEG', 'EMG/Nerve Conduction Study', 'Myelogram', 'Stereotactic Biopsy'],
    'Orthopedic': ['Joint Aspiration', 'Arthroscopy', 'Fracture Fixation', 'Joint Replacement', 'Spinal Injection (Epidural)', 'Trigger Point Injection'],
    'Renal/Urologic': ['Cystoscopy', 'Nephrostomy Tube Placement', 'Dialysis Access Creation', 'Ureteral Stent Placement', 'Prostate Biopsy'],
    'Dermatologic': ['Skin Biopsy (Shave)', 'Skin Biopsy (Punch)', 'Skin Biopsy (Excisional)', 'Cryotherapy', 'Mohs Surgery'],
    'General Surgery': ['Central Line Placement', 'Arterial Line Placement', 'Chest Tube Placement', 'Laparoscopy', 'Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Biopsy (Fine Needle Aspiration)', 'Abscess I&D'],
    'Ophthalmologic': ['Dilated Eye Exam', 'Tonometry', 'Visual Field Test', 'OCT (Optical Coherence Tomography)', 'Fluorescein Angiography', 'Cataract Surgery', 'LASIK']
  },
  studies: {
    'Cardiology': STUDY_OPTIONS,
    'Neurology': ['EEG', 'EMG/Nerve Conduction Study', 'Evoked Potentials', 'Sleep Study (Polysomnography)'],
    'Pulmonology': ['Pulmonary Function Test (PFT)', 'Bronchoscopy', 'Sleep Study'],
    'Ophthalmology': ['Dilated Eye Exam', 'OCT', 'Visual Field Test', 'Fluorescein Angiography', 'Gonioscopy'],
    'Vascular': ['ABI (Ankle-Brachial Index)', 'Duplex Ultrasound', 'Pulse Volume Recording']
  }
};

const STATUS = {
  waiting:   { label:"Waiting",   dotClass:"dot-waiting",   badgeClass:"waiting"   },
  ready:     { label:"Ready",     dotClass:"dot-ready",     badgeClass:"ready"     },
  complete:  { label:"Complete",  dotClass:"dot-complete",  badgeClass:"complete"  },
  cancelled: { label:"Cancelled", dotClass:"dot-cancelled", badgeClass:"cancelled" },
};

// ── API HELPERS ──
async function api(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── GENERATE CASE MODAL ── (Coming Soon)
/*
function openGenerateCaseModal() {
  document.getElementById('generateCaseModal').classList.add('open');
}

function closeGenerateCaseModal() {
  document.getElementById('generateCaseModal').classList.remove('open');
}

async function generateCase() {
  const specialty = document.getElementById('generateSpecialty').value;
  const btn = document.getElementById('generateCaseBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader"></i> Generating...';
  try {
    await api('POST', '/api/patients/generate-case', { specialty });
    closeGenerateCaseModal();
    await loadPatients();
  } catch (e) {
    alert('Error: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Generate Case';
  }
}
*/

// ── INTERVIEW CHAT ── (Coming Soon)
let interviewChatHistory = [];

/*
async function openInterviewModal() {
  if (!currentPatient) return;
  document.getElementById('interviewChat').innerHTML = '';
  document.getElementById('interviewModal').classList.add('open');
  try {
    const data = await api('GET', `/api/patients/${currentPatient.mr}/interview-history`);
    interviewChatHistory = data.chatHistory || [];
    if (interviewChatHistory.length > 0) {
      for (const msg of interviewChatHistory) {
        addChatMessage(msg.role, msg.content);
      }
    } else {
      addChatMessage('assistant', "Hi there, I'm here because I've been feeling unwell. What would you like to know?");
    }
  } catch {
    interviewChatHistory = [];
    addChatMessage('assistant', "Hi there, I'm here because I've been feeling unwell. What would you like to know?");
  }
}

async function closeInterviewModal() {
  document.getElementById('interviewModal').classList.remove('open');
  if (currentPatient && interviewChatHistory.length > 0) {
    try {
      await api('POST', `/api/patients/${currentPatient.mr}/interview-history`, { chatHistory: interviewChatHistory });
    } catch { }
  }
}

function addChatMessage(role, text) {
  const chat = document.getElementById('interviewChat');
  const div = document.createElement('div');
  div.style.cssText = 'display:flex; margin-bottom:10px; justify-content:' + (role === 'user' ? 'flex-end' : 'flex-start');

  const bubble = document.createElement('div');
  bubble.style.cssText = 'max-width:80%; padding:10px 14px; border-radius:12px; font-size:13px; line-height:1.5; ' + (
    role === 'user'
      ? 'background:#7c3aed; color:white; border-bottom-right-radius:4px;'
      : 'background:#f0f0f0; color:#333; border-bottom-left-radius:4px;'
  );
  bubble.textContent = text;
  div.appendChild(bubble);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendInterviewMessage() {
  const input = document.getElementById('interviewInput');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  addChatMessage('user', message);

  interviewChatHistory.push({ role: 'user', content: message });

  const sendBtn = document.getElementById('interviewSendBtn');
  sendBtn.disabled = true;
  sendBtn.innerHTML = '...';

  try {
    const response = await fetch(`/api/patients/${currentPatient.mr}/interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, chatHistory: interviewChatHistory })
    });

    const bubble = createAssistantBubble();
    let fullReply = '';

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              fullReply += data.delta;
              bubble.textContent = fullReply;
              scrollChat();
            } else if (data.error) {
              bubble.textContent = 'Sorry, there was an error: ' + data.error;
            }
          } catch (e) {
          }
        }
      }
    }

    interviewChatHistory.push({ role: 'assistant', content: fullReply });
  } catch (e) {
    addChatMessage('assistant', 'Sorry, there was an error: ' + e.message);
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = 'Send';
  }
}

function createAssistantBubble() {
  const chat = document.getElementById('interviewChat');
  const div = document.createElement('div');
  div.style.cssText = 'display:flex; margin-bottom:10px; justify-content:flex-start';
  const bubble = document.createElement('div');
  bubble.style.cssText = 'max-width:80%; padding:10px 14px; border-radius:12px; font-size:13px; line-height:1.5; background:#f0f0f0; color:#333; border-bottom-left-radius:4px; min-height:20px;';
  div.appendChild(bubble);
  chat.appendChild(div);
  return bubble;
}

function scrollChat() {
  const chat = document.getElementById('interviewChat');
  chat.scrollTop = chat.scrollHeight;
}
*/

// ── SESSION CHECK ON LOAD ──
(async function init() {
  try {
    const data = await api('GET', '/api/auth/me');
    currentUser = data.user.displayName || data.user.email;
    currentUserEmail = data.user.email;
    currentUserRole = data.user.role || '';
    goSchedule();
  } catch (e) {
    console.error('Auth check failed:', e);
    // not logged in, redirect to index.html
    window.location.href = '/';
  }
})();

// ── NAVIGATION ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function goSchedule() {
  showScreen('scheduleScreen');
  document.getElementById('loggedInUser').textContent = currentUser || 'Dr. Smith';
  const now = new Date();
  const ds = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById('scheduleDate').textContent = ds;
  document.getElementById('scheduleDateFooter').textContent = ds;
  // Always reload patients when returning to schedule to ensure data is fresh
  await loadPatients();
}

async function doLogout() {
  try { await api('POST', '/api/auth/logout'); } catch {}
  currentUser = '';
  patients = [];
  currentPatient = null;
  window.location.href = '/';
}

function goProfile() { openProfileModal(); }

// ── LOAD PATIENTS FROM API ──
async function loadPatients() {
  try {
    const data = await api('GET', '/api/patients');
    patients = data;
  } catch {
    patients = [];
  }
  renderSchedule(patients);
  updateStats(patients);
}

// ── SCHEDULE TABLE ──
function renderSchedule(data) {
  const tbody = document.getElementById('scheduleBody');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#999;padding:30px;">No patients found.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map((p, i) => {
    const st = STATUS[p.status] || STATUS.waiting;
    return `<tr onclick="selectRow(this,${i})" ondblclick="openPatient(${i})">
      <td style="font-weight:600">${p.name}</td>
      <td>${p.dob}</td>
      <td>${p.sex}</td>
      <td style="color:var(--blue-mid);font-weight:500">${p.mr}</td>
      <td title="${p.cc}" style="color:#444">${p.cc}</td>
      <td>${p.appt}</td>
      <td>${p.sched}</td>
      <td><span class="badge ${st.badgeClass}" style="cursor:pointer" onclick="event.stopPropagation();showPatientStatusDropdown(${i}, event)"><span class="badge-dot ${st.dotClass}"></span>${st.label}</span></td>
      <td style="text-align:center">
        <button class="action-btn" title="Open patient record" onclick="event.stopPropagation();openPatient(${i})">
          <i class="ti ti-eye"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function updateStats(data) {
  document.getElementById('totalStat').textContent  = data.length;
  document.getElementById('readyStat').textContent  = data.filter(p=>p.status==='ready').length;
  document.getElementById('waitStat').textContent   = data.filter(p=>p.status==='waiting').length;
  document.getElementById('doneStat').textContent   = data.filter(p=>p.status==='complete').length;
  document.getElementById('cancelStat').textContent = data.filter(p=>p.status==='cancelled').length;
}

function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.mr.toLowerCase().includes(q) ||
    p.cc.toLowerCase().includes(q)
  );
  renderSchedule(filtered);
  updateStats(filtered);
}

function refreshTable() {
  document.getElementById('searchInput').value = '';
  loadPatients();
}

function selectRow(tr) {
  document.querySelectorAll('#scheduleBody tr').forEach(r => r.classList.remove('selected'));
  tr.classList.add('selected');
}

function showTab(el, section) {
  el.closest('.nav-bar').querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

// ── ADD PATIENT MODAL ──
function openAddModal() { document.getElementById('addModal').classList.add('open'); }
function closeModal()   { document.getElementById('addModal').classList.remove('open'); }

// ── EHR UPLOAD MODAL ── (Coming Soon)
/*
function openEhrUploadModal() { document.getElementById('ehrUploadModal').classList.add('open'); }
function closeEhrUploadModal() {
  document.getElementById('ehrUploadModal').classList.remove('open');
  document.getElementById('ehrFile').value = '';
  document.getElementById('ehrUploadStatus').textContent = '';
}

async function uploadEHR() {
  const fileInput = document.getElementById('ehrFile');
  const statusDiv = document.getElementById('ehrUploadStatus');

  if (!fileInput.files || fileInput.files.length === 0) {
    statusDiv.textContent = 'Please select a file.';
    statusDiv.style.color = 'red';
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  statusDiv.textContent = 'Uploading and processing...';
  statusDiv.style.color = '#666';

  try {
    const response = await fetch('/api/ehr/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      statusDiv.textContent = 'Patient created successfully!';
      statusDiv.style.color = 'green';
      setTimeout(() => {
        closeEhrUploadModal();
        loadPatients();
      }, 1500);
    } else {
      statusDiv.textContent = 'Error: ' + (data.error || 'Upload failed');
      statusDiv.style.color = 'red';
    }
  } catch (error) {
    statusDiv.textContent = 'Error: ' + error.message;
    statusDiv.style.color = 'red';
  }
}
*/

// ── PROFILE MODAL ──
function openProfileModal() {
  document.getElementById('profileModal').classList.add('open');
  document.getElementById('profileDisplayName').value = currentUser || '';
  document.getElementById('profileEmail').value = '';
  document.getElementById('profilePassword').value = '';
  document.getElementById('profilePasswordConfirm').value = '';
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.remove('open');
}

async function saveProfile() {
  const displayName = document.getElementById('profileDisplayName').value;
  const email = document.getElementById('profileEmail').value;
  const password = document.getElementById('profilePassword').value;
  const passwordConfirm = document.getElementById('profilePasswordConfirm').value;

  if (password && password !== passwordConfirm) {
    alert('Passwords do not match.');
    return;
  }

  if (password && password.length < 4) {
    alert('Password must be at least 4 characters.');
    return;
  }

  try {
    const body = {};
    if (displayName) body.displayName = displayName;
    if (email) body.email = email;
    if (password) body.password = password;

    const result = await api('PUT', '/api/auth/me', body);
    currentUser = result.user.displayName;
    document.getElementById('patientLoggedUser').textContent = currentUser;
    closeProfileModal();
    alert('Profile updated successfully!');
  } catch (e) {
    alert('Error updating profile: ' + e.message);
  }
}
async function addPatient() {
  const name  = document.getElementById('newName').value.trim();
  const dob   = document.getElementById('newDob').value;
  const sex   = document.getElementById('newSex').value;
  const cc    = document.getElementById('newCc').value.trim();
  const appt  = document.getElementById('newAppt').value;
  if (!name || !dob || !cc) { alert('Please fill in Name, DOB, and Chief Complaint.'); return; }

  const dobFmt = new Date(dob).toLocaleDateString('en-US');
  const apptFmt = appt ? new Date('1970-01-01T'+appt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : 'TBD';

  try {
    await api('POST', '/api/patients', { name, dob: dobFmt, sex, cc, appt: apptFmt });
    await loadPatients();
    closeModal();
    document.getElementById('newName').value=''; document.getElementById('newDob').value='';
    document.getElementById('newCc').value=''; document.getElementById('newAppt').value='';
  } catch (e) {
    alert('Error adding patient: ' + e.message);
  }
}

async function confirmDeletePatient() {
  if (!currentPatient) return;
  if (currentUserRole !== 'admin' && !currentPatient.is_generated) {
    alert('Cannot delete seed/demo patients. Only AI-generated cases can be deleted by non-admin users.');
    return;
  }
  const patientName = currentPatient.name || 'this patient';
  if (confirm(`Are you sure you want to delete ${patientName}? This action cannot be undone.`)) {
    try {
      if (currentUserRole === 'admin') {
        await api('DELETE', '/api/patients/' + currentPatient.mr);
      } else {
        await api('DELETE', '/api/patients/' + currentPatient.mr + '/generate-only');
      }
      alert('Patient deleted successfully.');
      goSchedule();
    } catch (e) {
      alert('Error deleting patient: ' + e.message);
    }
  }
}

// ── PATIENT RECORD ──
async function loadPatientData(mr) {
  try {
    const data = await api('GET', '/api/patients/' + mr);
    currentMeds = data.medications || [];
    currentOrders = data.orders || [];
    currentProblems = data.problems || [];
    currentConsultations = data.consultations || [];
    currentStudies = data.studies || [];
    currentPhysicianNotes = data.physicianNotes || [];
    currentNursingNotes = data.nursingNotes || [];
    currentImaging = data.imaging || [];
    currentAllergies = data.allergies || [];
    return data;
  } catch {
    currentMeds = [];
    currentOrders = [];
    currentProblems = [];
    currentConsultations = [];
    currentStudies = [];
    currentPhysicianNotes = [];
    currentNursingNotes = [];
    currentImaging = [];
    currentAllergies = [];
    return null;
  }
}

function getProblemCategory(name) {
  for (const [cat, items] of Object.entries(PROBLEM_CATEGORIES)) {
    if (items.includes(name)) return cat;
  }
  return 'Other';
}

function orderStatusBadge(status, id) {
  const s = (status || 'Pending').toLowerCase();
  if (s === 'completed') return '<span class="badge complete" style="cursor:pointer" onclick="showStatusDropdown(\'order\', '+id+', event, [\'Pending\', \'In Progress\', \'Complete\', \'Cancelled\'])"><span class="badge-dot dot-complete"></span>Completed</span>';
  if (s === 'cancelled') return '<span class="badge cancelled" style="cursor:pointer" onclick="showStatusDropdown(\'order\', '+id+', event, [\'Pending\', \'In Progress\', \'Complete\', \'Cancelled\'])"><span class="badge-dot dot-cancelled"></span>Cancelled</span>';
  if (s === 'in progress') return '<span class="badge ready" style="cursor:pointer" onclick="showStatusDropdown(\'order\', '+id+', event, [\'Pending\', \'In Progress\', \'Complete\', \'Cancelled\'])"><span class="badge-dot dot-ready"></span>In Progress</span>';
  return '<span class="badge waiting" style="cursor:pointer" onclick="showStatusDropdown(\'order\', '+id+', event, [\'Pending\', \'In Progress\', \'Complete\', \'Cancelled\'])"><span class="badge-dot dot-waiting"></span>Pending</span>';
}

function consultationStatusBadge(status, id) {
  const s = (status || 'Pending').toLowerCase();
  if (s === 'completed') return '<span class="badge complete" style="cursor:pointer" onclick="showStatusDropdown(\'consultation\', '+id+', event, [\'Pending\', \'Scheduled\', \'Completed\', \'Cancelled\'])"><span class="badge-dot dot-complete"></span>Completed</span>';
  if (s === 'cancelled') return '<span class="badge cancelled" style="cursor:pointer" onclick="showStatusDropdown(\'consultation\', '+id+', event, [\'Pending\', \'Scheduled\', \'Completed\', \'Cancelled\'])"><span class="badge-dot dot-cancelled"></span>Cancelled</span>';
  if (s === 'scheduled') return '<span class="badge ready" style="cursor:pointer" onclick="showStatusDropdown(\'consultation\', '+id+', event, [\'Pending\', \'Scheduled\', \'Completed\', \'Cancelled\'])"><span class="badge-dot dot-ready"></span>Scheduled</span>';
  return '<span class="badge waiting" style="cursor:pointer" onclick="showStatusDropdown(\'consultation\', '+id+', event, [\'Pending\', \'Scheduled\', \'Completed\', \'Cancelled\'])"><span class="badge-dot dot-waiting"></span>Pending</span>';
}

function studyStatusBadge(status, id) {
  const s = (status || 'Pending').toLowerCase();
  if (s === 'final') return '<span class="badge complete" style="cursor:pointer" onclick="showStatusDropdown(\'study\', '+id+', event, [\'Pending\', \'In Progress\', \'Final\', \'Cancelled\'])"><span class="badge-dot dot-complete"></span>Final</span>';
  if (s === 'cancelled') return '<span class="badge cancelled" style="cursor:pointer" onclick="showStatusDropdown(\'study\', '+id+', event, [\'Pending\', \'In Progress\', \'Final\', \'Cancelled\'])"><span class="badge-dot dot-cancelled"></span>Cancelled</span>';
  if (s === 'in progress') return '<span class="badge ready" style="cursor:pointer" onclick="showStatusDropdown(\'study\', '+id+', event, [\'Pending\', \'In Progress\', \'Final\', \'Cancelled\'])"><span class="badge-dot dot-ready"></span>In Progress</span>';
  return '<span class="badge waiting" style="cursor:pointer" onclick="showStatusDropdown(\'study\', '+id+', event, [\'Pending\', \'In Progress\', \'Final\', \'Cancelled\'])"><span class="badge-dot dot-waiting"></span>Pending</span>';
}

function problemStatusBadge(status, id) {
  const s = (status || 'active').toLowerCase();
  if (s === 'active') return '<span class="badge ready" style="cursor:pointer" onclick="showStatusDropdown(\'problem\', '+id+', event, [\'active\', \'inactive\', \'in the past\'])"><span class="badge-dot dot-ready"></span>Active</span>';
  if (s === 'inactive') return '<span class="badge cancelled" style="cursor:pointer" onclick="showStatusDropdown(\'problem\', '+id+', event, [\'active\', \'inactive\', \'in the past\'])"><span class="badge-dot dot-cancelled"></span>Inactive</span>';
  if (s === 'in the past') return '<span class="badge waiting" style="cursor:pointer" onclick="showStatusDropdown(\'problem\', '+id+', event, [\'active\', \'inactive\', \'in the past\'])"><span class="badge-dot dot-waiting"></span>In the Past</span>';
  return '<span class="badge ready" style="cursor:pointer" onclick="showStatusDropdown(\'problem\', '+id+', event, [\'active\', \'inactive\', \'in the past\'])"><span class="badge-dot dot-ready"></span>Active</span>';
}

function updatePatientPhoto() {
  const p = currentPatient;
  if (!p) return;
  const photoDiv = document.getElementById('patientPhoto');
  if (p.profile_pic) {
    photoDiv.innerHTML = `<img src="${p.profile_pic}" alt="Patient photo" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />`;
  } else {
    photoDiv.innerHTML = '<i class="ti ti-user"></i>';
  }
  if (currentUserRole === 'admin') {
    photoDiv.style.cursor = 'pointer';
    photoDiv.title = 'Click to upload profile picture';
  } else {
    photoDiv.style.cursor = 'default';
    photoDiv.title = '';
  }
}

function handlePhotoClick() {
  if (currentUserRole !== 'admin') return;
  document.getElementById('profilePicInput').click();
}

document.getElementById('profilePicInput')?.addEventListener('change', async function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file || !currentPatient) return;
  const reader = new FileReader();
  reader.onload = async function(ev) {
    const dataUrl = ev.target.result;
    try {
      await api('PUT', `/api/patients/${currentPatient.mr}/profile-pic`, { profile_pic: dataUrl });
      currentPatient.profile_pic = dataUrl;
      updatePatientPhoto();
    } catch (err) {
      alert('Error uploading profile picture: ' + err.message);
    }
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

async function openPatient(i) {
  try {
    // Ensure patients are loaded
    if (!patients || patients.length === 0) {
      await loadPatients();
    }
    if (i >= patients.length) return;

    currentPatient = patients[i];
    const p = currentPatient;
    currentOrderType = 'all';

    await loadPatientData(p.mr);
    updatePatientPhoto();

    // Check if patient is already locked (report already generated)
    addendumEnabled = false;
    try {
      const lockStatus = await api('GET', `/api/patients/${p.mr}/lock-status`);
      if (lockStatus.locked) { addendumEnabled = true; }
    } catch (e) {}
    updateAddendumBtn();

    document.getElementById('patientLoggedUser').textContent = currentUser || 'Dr. Smith';
    document.getElementById('patientBadge').textContent = p.name + ' · ' + p.mr + (p.is_generated ? ' · [AI-Generated]' : ' · [Demo]');

    renderPatientInfo(p);
    renderEncounterInfo(p);

    setSection('note');
    showScreen('patientScreen');
  } catch (e) {
    console.error('Error opening patient:', e);
    // Reload patients if there was an error and try again
    await loadPatients();
  }
}

function renderPatientInfo(p) {
  document.getElementById('patInfo').innerHTML = `
    <div class="info-row"><span class="info-label">Full Name</span><span class="info-value">${p.name}</span></div>
    <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">${p.dob}</span></div>
    <div class="info-row"><span class="info-label">Age</span><span class="info-value">${p.age || '—'}</span></div>
    <div class="info-row"><span class="info-label">Sex</span><span class="info-value">${p.sex==='M'?'Male':p.sex==='F'?'Female':'Other'}</span></div>
    <div class="info-row"><span class="info-label">MR Number</span><span class="info-value" style="color:var(--blue-mid);font-weight:600">${p.mr}</span></div>
    <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${p.phone||'—'}</span></div>
    <div class="info-row"><span class="info-label">Insurance</span><span class="info-value">${p.ins||'—'}</span></div>
    <div class="info-row"><span class="info-label">Drug Allergies</span><span class="info-value" style="color:var(--red)">${currentAllergies.filter(a=>a.type==='drug').map(a=>a.allergen).join(', ')||'None'}</span></div>
  `;
}

function renderEncounterInfo(p) {
  document.getElementById('encInfo').innerHTML = `
    <div class="info-row"><span class="info-label">Appt Date</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
    <div class="info-row"><span class="info-label">Appt Time</span><span class="info-value">${p.appt}</span></div>
    <div class="info-row"><span class="info-label">Physician</span><span class="info-value">${p.sched}</span></div>
    <div class="info-row"><span class="info-label">Chief Complaint</span><span class="info-value">${p.cc}</span></div>
    <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge ${STATUS[p.status].badgeClass}" style="cursor:pointer" onclick="showPatientStatusDropdownInPatient(event)"><span class="badge-dot ${STATUS[p.status].dotClass}"></span>${STATUS[p.status].label}</span></span></div>
    <div class="info-row"><span class="info-label">Temperature</span><span class="info-value">${p.temp||'—'}</span></div>
    <div class="info-row"><span class="info-label">Blood Pressure</span><span class="info-value">${p.bp||'—'}</span></div>
    <div class="info-row"><span class="info-label">Pulse Rate</span><span class="info-value">${p.hr?p.hr+' bpm':'—'}</span></div>
    <div class="info-row"><span class="info-label">Respiratory Rate</span><span class="info-value">${p.resp_rate?p.resp_rate+' breaths/min':'—'}</span></div>
    <div class="info-row"><span class="info-label">O2 Saturation</span><span class="info-value">${p.o2_sat?p.o2_sat+'%':'—'}</span></div>
    <div class="info-row"><span class="info-label">Height</span><span class="info-value">${p.height||'—'}</span></div>
    <div class="info-row"><span class="info-label">Weight</span><span class="info-value">${p.wt||'—'}</span></div>
    <div class="info-row"><span class="info-label">BMI</span><span class="info-value">${p.bmi||'—'}</span></div>
  `;
}

function updatePatientInfo() {
  if (!currentPatient) return;
  const p = currentPatient;
  updatePatientPhoto();
  renderPatientInfo(p);
  renderEncounterInfo(p);
}

// ── EDIT PATIENT / ENCOUNTER INFO ──
function toggleEditPatient() {
  if (!currentPatient) return;
  const p = currentPatient;
  const body = document.getElementById('patInfo').parentElement;
  body.classList.add('editing');
  document.getElementById('patInfo').insertAdjacentHTML('afterend', `
    <div class="edit-form" id="patientEditForm">
      <div class="edit-row"><label>Full Name</label><input type="text" autocomplete="off" id="editName" value="${p.name||''}" /></div>
      <div class="edit-row"><label>Date of Birth</label><input type="text" autocomplete="off" id="editDob" value="${p.dob||''}" /></div>
      <div class="edit-row"><label>Sex</label>
        <select id="editSex"><option value="M" ${p.sex==='M'?'selected':''}>Male</option><option value="F" ${p.sex==='F'?'selected':''}>Female</option><option value="O" ${p.sex==='O'?'selected':''}>Other</option></select>
      </div>
      <div class="edit-row"><label>Phone</label><input type="text" autocomplete="off" id="editPhone" value="${p.phone||''}" /></div>
      <div class="edit-row"><label>Insurance</label><input type="text" autocomplete="off" id="editIns" value="${p.ins||''}" /></div>
      <div class="edit-actions">
        <button class="btn btn-outline" onclick="cancelEdit('patient')">Cancel</button>
        <button class="btn btn-blue" onclick="savePatientEdit()"><i class="ti ti-check"></i> Save</button>
      </div>
    </div>`);
}

async function savePatientEdit() {
  if (!currentPatient) return;
  const data = {
    name: document.getElementById('editName').value,
    dob: document.getElementById('editDob').value,
    sex: document.getElementById('editSex').value,
    phone: document.getElementById('editPhone').value,
    ins: document.getElementById('editIns').value,
  };
  try {
    const updated = await api('PUT', `/api/patients/${currentPatient.mr}`, data);
    Object.assign(currentPatient, updated);
    const idx = patients.findIndex(p => p.mr === currentPatient.mr);
    if (idx >= 0) Object.assign(patients[idx], updated);
    document.getElementById('patientBadge').textContent = currentPatient.name + ' · ' + currentPatient.mr + (currentPatient.is_generated ? ' · [AI-Generated]' : ' · [Demo]');
    cancelEdit('patient');
  } catch (e) {
    alert('Error saving: ' + e.message);
  }
}

function toggleEditEncounter() {
  if (!currentPatient) return;
  const p = currentPatient;
  const body = document.getElementById('encInfo');
  body.classList.add('editing');
  document.getElementById('encInfo').insertAdjacentHTML('beforeend', `
    <div class="edit-form" id="encounterEditForm">
      <div class="edit-row"><label>Appt Time</label><input type="text" autocomplete="off" id="editAppt" value="${p.appt||''}" /></div>
      <div class="edit-row"><label>Physician</label><input type="text" autocomplete="off" id="editSched" value="${p.sched||''}" /></div>
      <div class="edit-row"><label>Chief Complaint</label><input type="text" autocomplete="off" id="editCc" value="${p.cc||''}" /></div>
      <div class="edit-row"><label>Blood Pressure</label><input type="text" autocomplete="off" id="editBp" value="${p.bp||''}" /></div>
      <div class="edit-row"><label>Pulse Rate</label><input type="text" autocomplete="off" id="editHr" value="${p.hr||''}" /></div>
      <div class="edit-row"><label>Temperature</label><input type="text" autocomplete="off" id="editTemp" value="${p.temp||''}" /></div>
      <div class="edit-row"><label>Respiratory Rate</label><input type="text" autocomplete="off" id="editRespRate" value="${p.resp_rate||''}" /></div>
      <div class="edit-row"><label>O2 Saturation</label><input type="text" autocomplete="off" id="editO2Sat" value="${p.o2_sat||''}" /></div>
      <div class="edit-row"><label>Height</label><input type="text" autocomplete="off" id="editHeight" value="${p.height||''}" /></div>
      <div class="edit-row"><label>Weight</label><input type="text" autocomplete="off" id="editWt" value="${p.wt||''}" /></div>
      <div class="edit-row"><label>BMI</label><input type="text" autocomplete="off" id="editBmi" value="${p.bmi||''}" /></div>
      <div class="edit-actions">
        <button class="btn btn-outline" onclick="cancelEdit('encounter')">Cancel</button>
        <button class="btn btn-blue" onclick="saveEncounterEdit()"><i class="ti ti-check"></i> Save</button>
      </div>
    </div>`);
}

async function saveEncounterEdit() {
  if (!currentPatient) return;
  const data = {
    appt: document.getElementById('editAppt').value,
    sched: document.getElementById('editSched').value,
    cc: document.getElementById('editCc').value,
    bp: document.getElementById('editBp').value,
    hr: document.getElementById('editHr').value,
    temp: document.getElementById('editTemp').value,
    wt: document.getElementById('editWt').value,
    resp_rate: document.getElementById('editRespRate').value,
    o2_sat: document.getElementById('editO2Sat').value,
    height: document.getElementById('editHeight').value,
    bmi: document.getElementById('editBmi').value,
  };
  try {
    const updated = await api('PUT', `/api/patients/${currentPatient.mr}`, data);
    Object.assign(currentPatient, updated);
    const idx = patients.findIndex(p => p.mr === currentPatient.mr);
    if (idx >= 0) Object.assign(patients[idx], updated);
    cancelEdit('encounter');
  } catch (e) {
    alert('Error saving: ' + e.message);
  }
}

function cancelEdit(type) {
  if (!currentPatient) return;
  const p = currentPatient;
  if (type === 'patient') {
    const body = document.getElementById('patInfo').parentElement;
    body.classList.remove('editing');
    const form = document.getElementById('patientEditForm');
    if (form) form.remove();
    updatePatientInfo();
  } else {
    const body = document.getElementById('encInfo');
    body.classList.remove('editing');
    const form = document.getElementById('encounterEditForm');
    if (form) form.remove();
    document.getElementById('encInfo').innerHTML = `
      <div class="info-row"><span class="info-label">Appt Date</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
      <div class="info-row"><span class="info-label">Appt Time</span><span class="info-value">${p.appt}</span></div>
      <div class="info-row"><span class="info-label">Physician</span><span class="info-value">${p.sched}</span></div>
      <div class="info-row"><span class="info-label">Chief Complaint</span><span class="info-value">${p.cc}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge ${STATUS[p.status].badgeClass}" style="cursor:pointer" onclick="showPatientStatusDropdownInPatient(event)"><span class="badge-dot ${STATUS[p.status].dotClass}"></span>${STATUS[p.status].label}</span></span></div>
      <div class="info-row"><span class="info-label">Temperature</span><span class="info-value">${p.temp||'—'}</span></div>
      <div class="info-row"><span class="info-label">Blood Pressure</span><span class="info-value">${p.bp||'—'}</span></div>
      <div class="info-row"><span class="info-label">Pulse Rate</span><span class="info-value">${p.hr?p.hr+' bpm':'—'}</span></div>
      <div class="info-row"><span class="info-label">Respiratory Rate</span><span class="info-value">${p.resp_rate?p.resp_rate+' breaths/min':'—'}</span></div>
      <div class="info-row"><span class="info-label">O2 Saturation</span><span class="info-value">${p.o2_sat?p.o2_sat+'%':'—'}</span></div>
      <div class="info-row"><span class="info-label">Height</span><span class="info-value">${p.height||'—'}</span></div>
      <div class="info-row"><span class="info-label">Weight</span><span class="info-value">${p.wt||'—'}</span></div>
      <div class="info-row"><span class="info-label">BMI</span><span class="info-value">${p.bmi||'—'}</span></div>`;
  }
}

// ── SECTION SWITCHING ──
function setSection(sec) {
  currentSection = sec;
  document.querySelectorAll('.sec-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('sec' + sec.charAt(0).toUpperCase() + sec.slice(1));
  if (tab) tab.classList.add('active');
  renderSection(sec);
  // Initialize order options if switching to orders section
  if (sec === 'orders') {
    setTimeout(() => {
      updateOrderOptions();
      // Set the order type select to match current filter
      const orderTypeSelect = document.getElementById('orderTypeSelect');
      if (orderTypeSelect && currentOrderType !== 'all') {
        orderTypeSelect.value = currentOrderType;
        updateOrderOptions();
      }
    }, 0);
  }
}

function renderSection(sec) {
  const el = document.getElementById('sectionContent');
  const p  = currentPatient;
  if (!p) return;

  if (sec === 'meds') {
    const meds = currentMeds;
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-pill"></i> Medications</div>
        <div class="info-card-body" style="padding:0">
          ${meds.length ? `
          <table class="med-table">
            <thead><tr><th>Type</th><th>Medication</th><th>Dose</th><th>Frequency</th><th>Route</th><th>Start Date</th><th>Prescriber</th><th style="width:50px"></th></tr></thead>
            <tbody>${meds.map(m=>`<tr>
              <td><span class="badge ${m.type==='prescribed'?'complete':m.type==='otc'?'ready':m.type==='supplement'?'pending':'default'}"><span class="badge-dot ${m.type==='prescribed'?'dot-complete':m.type==='otc'?'dot-ready':m.type==='supplement'?'dot-pending':'dot-default'}"></span>${m.type==='prescribed'?'New Prescription':m.type==='otc'?'Over the Counter':m.type==='supplement'?'Supplement':'Existing'}</span></td>
              <td style="font-weight:600">${m.name}</td>
              <td>${m.dose||'—'}</td>
              <td>${m.freq||'—'}</td>
              <td>${m.route||'—'}</td>
              <td>${m.start||'—'}</td>
              <td>${m.prescriber||'—'}</td>
              <td><button class="remove-btn" onclick="deleteMedication(${m.id})" title="Remove"><i class="ti ti-x"></i></button></td>
            </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-pill"></i>No medications on file</div>'}
        </div>
        <div class="info-card-body" style="border-top:1px solid var(--border);">
          <div class="lab-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="field"><label>Medication Type</label>
                <select id="medType" onchange="toggleMedTypeFields()">
                  <option value="existing">Existing Medication</option>
                  <option value="prescribed">New Prescription</option>
                  <option value="otc">Over the Counter</option>
                  <option value="supplement">Supplement</option>
                </select>
              </div>
              <div class="field"><label>Medication Name</label><input type="text" autocomplete="off" id="medName" placeholder="e.g. Lisinopril" /></div>
              <div class="field"><label>Dose</label><input type="text" autocomplete="off" id="medDose" placeholder="e.g. 10mg" /></div>
              <div class="field"><label>Frequency</label><input type="text" autocomplete="off" id="medFreq" placeholder="e.g. Once daily" /></div>
              <div class="field"><label>Route</label><input type="text" autocomplete="off" id="medRoute" placeholder="e.g. Oral" /></div>
              <div class="field"><label>Start Date</label><input type="date" id="medStart" /></div>
              <div class="field"><label>Prescriber</label><input type="text" autocomplete="off" id="medPrescriber" placeholder="e.g. Dr. Smith" /></div>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
              <button class="btn btn-green" onclick="addMedication()"><i class="ti ti-plus"></i> Add Medication</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  else if (sec === 'allergies') {
    const allergies = currentAllergies;
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-alert-triangle"></i> Allergies</div>
        <div class="info-card-body" style="padding:0">
          ${allergies.length ? `
          <table class="med-table">
            <thead><tr><th>Allergen</th><th>Type</th><th>Reaction</th><th>First Encountered</th><th style="width:50px"></th></tr></thead>
            <tbody>${allergies.map(a=>`<tr>
              <td style="font-weight:600">${a.allergen}</td>
              <td>${a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : '—'}</td>
              <td>${a.reaction||'—'}</td>
              <td>${a.first_encounter||'—'}</td>
              <td><button class="remove-btn" onclick="deleteAllergy(${a.id})" title="Remove"><i class="ti ti-x"></i></button></td>
            </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-alert-triangle"></i>No allergies on file</div>'}
        </div>
        <div class="info-card-body" style="border-top:1px solid var(--border);">
          <div class="lab-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="field"><label>Allergen</label><input type="text" autocomplete="off" id="allergyAllergen" placeholder="e.g. Penicillin" /></div>
              <div class="field"><label>Type</label>
                <select id="allergyType">
                  <option value="drug">Drug</option>
                  <option value="food">Food</option>
                  <option value="environmental">Environmental</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="field"><label>Reaction</label><input type="text" autocomplete="off" id="allergyReaction" placeholder="e.g. Hives, rash" /></div>
              <div class="field"><label>First Encountered</label><input type="text" autocomplete="off" id="allergyFirstEncounter" placeholder="e.g. 2020" /></div>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
              <button class="btn btn-green" onclick="addAllergy()"><i class="ti ti-plus"></i> Add Allergy</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  else if (sec === 'labs') {
    const labs = currentOrders.filter(o => o.type === 'labs');
    const isAdmin = currentUserRole === 'admin';
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-test-pipe"></i> Lab Results</div>
        <div class="info-card-body" style="padding:0">
          ${labs.length ? `
          <table class="med-table">
            <thead><tr><th>Test Name</th><th>Category</th><th>Result</th><th>Status</th><th>Order Date</th>${isAdmin?'<th style="width:50px"></th>':''}</tr></thead>
            <tbody>${labs.map(l=>`<tr>
              <td style="font-weight:600">${l.name}</td>
              <td>${l.category||'—'}</td>
              <td>${l.result||'—'}</td>
              <td>${isAdmin ? orderStatusBadge(l.status, l.id) : (l.status||'Pending')}</td>
              <td>${l.order_date||'—'}</td>
              ${isAdmin?'<td><button class="remove-btn" onclick="deleteOrder('+l.id+')" title="Remove"><i class="ti ti-x"></i></button></td>':''}
            </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-test-pipe"></i>No lab results on file</div>'}
        </div>
        ${isAdmin ? `
        <div class="info-card-body" style="border-top:1px solid var(--border);">
          <div class="lab-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="field"><label>Test Name</label>
                <select id="labTestName">
                  <option value="" disabled selected>Select...</option>
                  ${Object.entries(ORDER_CATEGORIES).map(([cat, tests]) => 
                    `<optgroup label="${cat}">${tests.map(t => `<option value="${t}" data-category="${cat}">${t}</option>`).join('')}</optgroup>`
                  ).join('')}
                </select>
              </div>
              <div class="field"><label>Order Date</label><input type="date" id="labOrderDate" /></div>
              <div class="field"><label>Result</label><input type="text" autocomplete="off" id="labResult" placeholder="e.g. Normal" /></div>
              <div class="field"><label>Status</label>
                <select id="labStatus">
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="field"><label>Notes</label><input type="text" autocomplete="off" id="labNotes" placeholder="Additional notes..." /></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
              <button class="btn btn-green" onclick="saveLabResult()"><i class="ti ti-plus"></i> Add Lab Result</button>
            </div>
          </div>
        </div>` : ''}
      </div>`;
  }

  else if (sec === 'imaging') {
    const imaging = currentImaging;
    const isAdmin = currentUserRole === 'admin';
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-photo-scan"></i> Imaging</div>
        <div class="info-card-body" style="padding:0">
          ${imaging.length ? `
          <table class="med-table">
            <thead><tr><th>Label</th><th>Annotations</th><th>Image</th>${isAdmin?'<th style="width:50px"></th>':''}</tr></thead>
            <tbody>${imaging.map(img=>`<tr>
              <td style="font-weight:600">${img.label}</td>
              <td>${img.annotations||'—'}</td>
              <td>${img.image_data ? '<img src="' + img.image_data + '" style="max-height:60px;max-width:120px;border-radius:4px;cursor:pointer;" onclick="openImageLightbox(this.src)" title="Click to view full size" />' : '<span class="badge waiting"><span class="badge-dot dot-waiting"></span>No Image</span>'}</td>
              ${isAdmin?'<td><button class="remove-btn" onclick="deleteImaging('+img.id+')" title="Remove"><i class="ti ti-x"></i></button></td>':''}
            </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-photo-scan"></i>No imaging on file</div>'}
        </div>
        ${isAdmin ? `
        <div class="info-card-body" style="border-top:1px solid var(--border);">
          <div class="lab-form">
            <div class="field"><label>Image Label</label><input type="text" autocomplete="off" id="imgLabel" placeholder="e.g. Chest X-Ray" /></div>
            <div class="field"><label>Annotations</label><input type="text" autocomplete="off" id="imgAnnotations" placeholder="e.g. Clear lungs" /></div>
            <div class="field"><label>Upload Image</label><input type="file" id="imgUpload" accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.webp,.svg,.dicom,.dcm" onchange="previewImage(event)" /></div>
            <div id="imgPreview"></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
              <button class="btn btn-green" onclick="saveImaging()"><i class="ti ti-plus"></i> Add Imaging</button>
            </div>
          </div>
        </div>` : ''}
      </div>`;
  }

  else if (sec === 'orders') {
    const filteredOrders = currentOrderType === 'all' 
      ? currentOrders 
      : currentOrders.filter(o => o.type === currentOrderType);
    
    const typeOptions = ['all', 'labs', 'imaging', 'procedures', 'studies', 'other'];
    
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-clipboard-plus"></i> Orders</div>
        <div class="info-card-body" style="padding:0">
          ${filteredOrders.length ? `
          <table class="med-table">
            <thead><tr><th>Type</th><th>Category</th><th>Name</th><th>Priority</th><th>Status</th><th>Order Date</th><th style="width:50px"></th></tr></thead>
            <tbody>${filteredOrders.map(o=>`<tr>
              <td><span class="badge ${o.type==='labs'?'complete':o.type==='imaging'?'ready':'waiting'}"><span class="badge-dot ${o.type==='labs'?'dot-complete':o.type==='imaging'?'dot-ready':'dot-waiting'}"></span>${o.type ? o.type.charAt(0).toUpperCase() + o.type.slice(1) : '—'}</span></td>
              <td>${o.category||'—'}</td>
              <td style="font-weight:600">${o.name}</td>
              <td>${o.priority||'—'}</td>
              <td>${orderStatusBadge(o.status, o.id)}</td>
              <td>${o.order_date||'—'}</td>
              <td><button class="remove-btn" onclick="deleteOrder(${o.id})" title="Remove"><i class="ti ti-x"></i></button></td>
            </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-clipboard-plus"></i>No orders on file</div>'}
        </div>
        <div class="info-card-body" style="border-top:1px solid var(--border);">
          <div class="lab-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="field"><label>Order Type</label>
                <select id="orderTypeSelect" onchange="updateOrderOptions()">
                  ${typeOptions.map(t => '<option value="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>').join('')}
                </select>
              </div>
              <div class="field"><label>Order Name</label>
                <select id="orderName" onchange="toggleCustomInput('orderName', 'orderNameCustom')">
                  <option value="">Select...</option>
                </select>
              </div>
              <div class="field" id="orderNameCustomField" style="display:none"><label>Custom Name</label><input type="text" autocomplete="off" id="orderNameCustom" placeholder="Enter custom order name" /></div>
              <div class="field"><label>Priority</label>
                <select id="orderPriority">
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Stat">Stat</option>
                </select>
              </div>
              <div class="field"><label>Order Date</label><input type="date" id="orderDate" /></div>
              <div class="field"><label>Status</label>
                <select id="orderStatus">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="field"><label>Notes</label><input type="text" autocomplete="off" id="orderNotes" placeholder="Additional notes..." /></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
              <button class="btn btn-green" onclick="addOrder()"><i class="ti ti-plus"></i> Add Order</button>
            </div>
          </div>
        </div>
      </div>`;
    setTimeout(function() { updateOrderOptions(); }, 0);
  }

  else if (sec === 'consultations') {
    const consultations = currentConsultations;
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-users"></i> Consultations</div>
        <div class="info-card-body" style="padding:0">
          ${consultations.length ? `
          <table class="med-table">
            <thead><tr><th>Specialty</th><th>Requested Date</th><th>Consultant</th><th>Summary</th><th>Status</th><th style="width:50px"></th></tr></thead>
            <tbody>${consultations.map(c=>`<tr>
              <td style="font-weight:600">${c.specialty}</td>
              <td>${c.requested_date||'—'}</td>
              <td>${c.consultant||'—'}</td>
              <td>${c.summary||'—'}</td>
              <td>${consultationStatusBadge(c.status, c.id)}</td>
              <td><button class="remove-btn" onclick="deleteConsultation(${c.id})" title="Remove"><i class="ti ti-x"></i></button></td>
            </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-users"></i>No consultations on file</div>'}
        </div>
        <div class="info-card-body" style="border-top:1px solid var(--border);">
          <div class="lab-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="field"><label>Specialty</label>
                <select id="consultSpecialty">
                  <option value="" disabled selected>Select...</option>
                  ${CONSULT_SPECIALTIES.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
              </div>
              <div class="field"><label>Requested Date</label><input type="date" id="consultDate" /></div>
              <div class="field"><label>Consultant</label><input type="text" autocomplete="off" id="consultConsultant" placeholder="e.g. Dr. Jones" /></div>
              <div class="field"><label>Status</label>
                <select id="consultStatus">
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="field"><label>Summary</label><input type="text" autocomplete="off" id="consultSummary" placeholder="Reason for consultation..." /></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
              <button class="btn btn-green" onclick="addConsultation()"><i class="ti ti-plus"></i> Request Consultation</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  else if (sec === 'studies') {
    const studies = currentStudies;
    const isAdmin = currentUserRole === 'admin';
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-report-search"></i> Studies</div>
        <div class="info-card-body" style="padding:0">
          ${studies.length ? `
          <table class="med-table">
            <thead><tr><th>Study Name</th><th>Study Date</th><th>Result</th><th>Status</th><th>Image</th>${isAdmin?'<th style="width:50px"></th>':''}</tr></thead>
            <tbody>${studies.map(s=>`<tr>
              <td style="font-weight:600">${s.name}</td>
              <td>${s.study_date||'—'}</td>
              <td>${s.result||'—'}</td>
              <td>${isAdmin ? studyStatusBadge(s.status, s.id) : (s.status||'Pending')}</td>
              <td>${s.image_data ? '<img src="' + s.image_data + '" style="max-height:60px;max-width:120px;border-radius:4px;cursor:pointer;" onclick="openImageLightbox(this.src)" title="Click to view full size" />' : '—'}</td>
              ${isAdmin?'<td><button class="remove-btn" onclick="deleteStudy('+s.id+')" title="Remove"><i class="ti ti-x"></i></button></td>':''}
            </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-report-search"></i>No studies on file</div>'}
        </div>
        ${isAdmin ? `
        <div class="info-card-body" style="border-top:1px solid var(--border);">
          <div class="lab-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="field"><label>Study Name</label>
                <select id="studyName" onchange="toggleCustomInput('studyName', 'studyNameCustom')">
                  ${STUDY_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                  <option value="other">Other (custom)</option>
                </select>
              </div>
              <div class="field" id="studyNameCustomField" style="display:none"><label>Custom Name</label><input type="text" autocomplete="off" id="studyNameCustom" placeholder="Enter custom study name" /></div>
              <div class="field"><label>Study Date</label><input type="date" id="studyDate" /></div>
              <div class="field"><label>Status</label>
                <select id="studyStatus">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Final">Final</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="field"><label>Result</label><input type="text" autocomplete="off" id="studyResult" placeholder="e.g. Normal" /></div>
            <div class="field"><label>Upload Image (EKG, X-Ray, etc.)</label><input type="file" id="studyUpload" accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.webp,.svg,.dicom,.dcm" onchange="previewStudyImage(event)" /></div>
            <div id="studyPreview"></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
              <button class="btn btn-green" onclick="addStudy()"><i class="ti ti-plus"></i> Add Study</button>
            </div>
          </div>
        </div>` : ''}
      </div>`;
  }

  else if (sec === 'problems') {
    const addedNames = currentProblems.map(p => p.name);
    const optionsHtml = Object.entries(PROBLEM_CATEGORIES).map(([cat, items]) =>
      `<optgroup label="${cat}">${items.map(item =>
        `<option value="${item}" ${addedNames.includes(item) ? 'disabled' : ''}>${item}</option>`
      ).join('')}</optgroup>`
    ).join('');

    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-list-check"></i> Problem List</div>
        <div class="info-card-body">
          <div class="problem-add-row">
            <div class="field">
              <label>Select Problem</label>
              <select id="problemSelect" onchange="toggleCustomInput('problemSelect', 'problemNameCustom')"><option value="">— Choose a problem —</option>${optionsHtml}<option value="other">Other (specify below)</option></select>
            </div>
            <button class="btn btn-blue" onclick="addProblem()"><i class="ti ti-plus"></i> Add Problem</button>
          </div>
          <div class="field" id="problemNameCustomField" style="display:none;margin-bottom:16px;"><label>Custom Problem Name</label><input type="text" autocomplete="off" id="problemNameCustom" placeholder="Enter custom problem name" /></div>
          ${currentProblems.length ? `
          <table class="med-table">
            <thead><tr><th>Problem</th><th>Category</th><th>Status</th><th>Annotation</th><th style="width:60px">Remove</th></tr></thead>
            <tbody>${currentProblems.map(prob => `
              <tr>
                <td style="font-weight:600">${prob.name}</td>
                <td>${prob.category||'—'}</td>
                <td>${problemStatusBadge(prob.status, prob.id)}</td>
                <td>${prob.annotation||'—'}</td>
                <td><button class="remove-btn" onclick="deleteProblem(${prob.id})" title="Remove"><i class="ti ti-x"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>` : '<div class="empty-state"><i class="ti ti-list-check"></i>No problems on file — select from dropdown above</div>'}
        </div>
        <div style="padding:12px 14px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-outline" onclick="clearProblems()">Clear All</button>
        </div>
      </div>`;
  }

  else if (sec === 'note') {
    const noteFields = ['noteChiefComplaint','noteHPI','notePMH','noteSurgical','noteHospitalizations','noteHealth','noteFamily','noteSocial','noteROS','notePhysical','noteAssessment','noteDiffDx','notePlan'];
    const fieldKeys = ['chief_complaint','history_present_illness','past_medical_history','surgical_history','hospitalizations','health_maintenance','family_history','social_history','review_of_systems','physical_exam','assessment','differential_diagnosis','plan'];
    const fieldLabels = ['Chief Complaint','History of Present Illness','Past Medical History','Surgical History','Hospitalizations','Health Maintenance/Immunizations','Family History','Social History','Review of Systems','Physical Exam','Assessment','Differential Diagnosis','Plan'];
    const fieldPlaceholders = ['Reason for visit&hellip;','Detailed history of current illness&hellip;','Previous medical conditions&hellip;','Previous surgeries&hellip;','Previous hospital admissions&hellip;','Preventive care, vaccinations&hellip;','Family medical history&hellip;','Social determinants, habits&hellip;','Systematic review of body systems&hellip;','Examination findings&hellip;','Diagnosis or clinical impression&hellip;','Differential diagnoses&hellip;','Treatment plan, follow-up, referrals&hellip;'];

    function getFieldValue(key, index) {
      if (editingNoteId) {
        const note = currentPhysicianNotes.find(n => n.id === editingNoteId);
        if (note && note[key] !== undefined) return note[key];
      }
      if (noteFormData[key] !== undefined) return noteFormData[key];
      return '';
    }

    const formHtml = `
      <div id="noteFormContainer" style="margin-bottom:16px;padding:12px;background:var(--blue-pale);border:1px solid var(--blue-mid);border-radius:4px;">
        <div style="font-weight:600;font-size:13px;margin-bottom:10px;color:var(--blue-mid);">${editingNoteId ? 'Edit Note' : 'Add New Note'}</div>
        ${noteFields.map((id, i) => `
          <div class="field" style="margin-bottom:12px;"><label>${fieldLabels[i]}</label><input type="hidden" id="trix_${id}" value=""><trix-editor input="trix_${id}" style="min-height:80px;border:1px solid var(--border);border-radius:4px;"></trix-editor></div>
        `).join('')}
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-outline" onclick="cancelNoteForm()">Cancel</button>
          <button class="btn btn-green" onclick="${editingNoteId ? 'saveNoteEdit()' : 'savePhysicianNote()'}"><i class="ti ti-device-floppy"></i> ${editingNoteId ? 'Save Edit' : 'Save Note'}</button>
        </div>
      </div>`;

    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-notes"></i> Physician Note</div>
        <div class="info-card-body">
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:12px;">
            ${!editingNoteId ? `<button class="btn btn-green" onclick="toggleNoteForm()"><i class="ti ti-plus"></i> Add Note</button>` : ''}
          </div>
          ${noteFormOpen || editingNoteId ? formHtml : ''}
              ${currentPhysicianNotes.length ? `
          <div style="margin-bottom:16px;">
            <div style="font-weight:600;font-size:12px;color:var(--text-muted);margin-bottom:8px;">Previous Notes:</div>
            ${currentPhysicianNotes.map(n => `
              <div style="background:var(--blue-pale);border:1px solid var(--blue-mid);border-radius:4px;padding:12px;margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <div>
                    <div style="font-weight:600;font-size:13px;">${n.chief_complaint || 'No Chief Complaint'}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${n.visit_date || n.created_at}${n.visit_type ? ' · ' + n.visit_type : ''} · Signed by: ${n.created_by||'—'}${n.edited_at ? ' · <span style="color:var(--blue-mid);font-weight:600;">Edited</span> ' + n.edited_at : ''}</div>
                  </div>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-outline" style="font-size:10px;padding:4px 8px;" onclick="toggleNoteDetails(${n.id})">Open</button>
                    <button class="btn btn-outline" style="font-size:10px;padding:4px 8px;" onclick="editPhysicianNote(${n.id})">Edit</button>
                    <button class="btn btn-outline" style="font-size:10px;padding:4px 8px;" onclick="deletePhysicianNote(${n.id})">Delete</button>
                  </div>
                </div>
                <div id="noteDetails${n.id}" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--blue-mid);">
                  ${n.history_present_illness ? `<div style="margin-bottom:4px;"><strong>HPI:</strong> ${n.history_present_illness}</div>` : ''}
                  ${n.past_medical_history ? `<div style="margin-bottom:4px;"><strong>PMH:</strong> ${n.past_medical_history}</div>` : ''}
                  ${n.surgical_history ? `<div style="margin-bottom:4px;"><strong>Surgical History:</strong> ${n.surgical_history}</div>` : ''}
                  ${n.hospitalizations ? `<div style="margin-bottom:4px;"><strong>Hospitalizations:</strong> ${n.hospitalizations}</div>` : ''}
                  ${n.health_maintenance ? `<div style="margin-bottom:4px;"><strong>Health Maintenance:</strong> ${n.health_maintenance}</div>` : ''}
                  ${n.family_history ? `<div style="margin-bottom:4px;"><strong>Family History:</strong> ${n.family_history}</div>` : ''}
                  ${n.social_history ? `<div style="margin-bottom:4px;"><strong>Social History:</strong> ${n.social_history}</div>` : ''}
                  ${n.review_of_systems ? `<div style="margin-bottom:4px;"><strong>ROS:</strong> ${n.review_of_systems}</div>` : ''}
                  ${n.physical_exam ? `<div style="margin-bottom:4px;"><strong>Physical Exam:</strong> ${n.physical_exam}</div>` : ''}
                  ${n.assessment ? `<div style="margin-bottom:4px;"><strong>Assessment:</strong> ${n.assessment}</div>` : ''}
                  ${n.differential_diagnosis ? `<div style="margin-bottom:4px;"><strong>Differential Diagnosis:</strong> ${n.differential_diagnosis}</div>` : ''}
                  ${n.plan ? `<div style="margin-bottom:4px;"><strong>Plan:</strong> ${n.plan}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>` : '<div class="empty-state"><i class="ti ti-notes"></i>No notes on file</div>'}
        </div>
      </div>`;

    // Initialize Trix editors if form is open
    if (noteFormOpen || editingNoteId) {
      window.trixEditors = {};
      noteFields.forEach((id, i) => {
        const hidden = document.getElementById('trix_' + id);
        const trixEl = document.querySelector('trix-editor[input="trix_' + id + '"]');
        if (hidden && trixEl) {
          const val = getFieldValue(fieldKeys[i], i);
          let loaded = false;
          function initEditor() {
            if (loaded) return;
            loaded = true;
            if (val) trixEl.editor.loadHTML(val);
            hidden.addEventListener('trix-change', () => {
              noteFormData[fieldKeys[i]] = hidden.value;
            });
            window.trixEditors[id] = { hidden, editor: trixEl };

            // Add indent/outdent buttons to toolbar
            const toolbar = trixEl.previousElementSibling;
            if (toolbar && toolbar.classList.contains('trix-toolbar')) {
              const group = document.createElement('span');
              group.className = 'button_group';
              group.innerHTML = `
                <button type="button" class="trix-button trix-icon-not_bold" data-trix-action="indent" title="Indent" aria-label="Indent">⇥</button>
                <button type="button" class="trix-button trix-icon-not_bold" data-trix-action="outdent" title="Outdent" aria-label="Outdent">⇤</button>
              `;
              toolbar.querySelector('.trix-button_row').appendChild(group);
              group.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('mousedown', (e) => {
                  e.preventDefault();
                  trixEl.focus();
                  const action = btn.getAttribute('data-trix-action');
                  if (action === 'indent') {
                    document.execCommand('indent');
                  } else {
                    document.execCommand('outdent');
                  }
                });
              });
            }
          }
          trixEl.addEventListener('trix-initialize', initEditor);
          setTimeout(initEditor, 300);
        }
      });
    }
  }

  else if (sec === 'nursing') {
    el.innerHTML = `
      <div class="info-card">
        <div class="info-card-header"><i class="ti ti-stethoscope"></i> Nursing Notes</div>
        <div class="info-card-body">
          ${currentNursingNotes.length ? `
          <div style="margin-bottom:16px;">
            <div style="font-weight:600;font-size:12px;color:var(--text-muted);margin-bottom:8px;">Previous Notes:</div>
            ${currentNursingNotes.map(n => `
              <div style="background:var(--blue-pale);border:1px solid var(--blue-mid);border-radius:4px;padding:12px;margin-bottom:8px;">
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">${n.time||'—'} · ${n.nurse_name||'—'} · ${n.created_at}</div>
                ${n.blood_pressure ? `<div style="margin-bottom:4px;"><strong>BP:</strong> ${n.blood_pressure}</div>` : ''}
                ${n.heart_rate ? `<div style="margin-bottom:4px;"><strong>HR:</strong> ${n.heart_rate}</div>` : ''}
                ${n.temperature ? `<div style="margin-bottom:4px;"><strong>Temp:</strong> ${n.temperature}</div>` : ''}
                ${n.weight ? `<div style="margin-bottom:4px;"><strong>Weight:</strong> ${n.weight}</div>` : ''}
                ${n.note ? `<div style="margin-bottom:4px;"><strong>Note:</strong> ${n.note}</div>` : ''}
                <button class="btn btn-outline" style="font-size:10px;padding:4px 8px;margin-top:8px;" onclick="deleteNursingNote(${n.id})">Delete</button>
              </div>
            `).join('')}
          </div>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <div class="field"><label>Nurse Name</label><input type="text" autocomplete="off" id="nurseName" placeholder="Nurse name" /></div>
            <div class="field"><label>Time</label><input type="time" id="nurseTime" /></div>
            <div class="field"><label>Blood Pressure</label><input type="text" autocomplete="off" id="nurseBP" placeholder="e.g. 120/80 mmHg" value="${p.bp||''}" /></div>
            <div class="field"><label>Heart Rate</label><input type="text" autocomplete="off" id="nurseHR" placeholder="e.g. 72 bpm" value="${p.hr?p.hr+' bpm':''}" /></div>
            <div class="field"><label>Temperature</label><input type="text" autocomplete="off" id="nurseTemp" placeholder="e.g. 98.6°F" value="${p.temp||''}" /></div>
            <div class="field"><label>Weight</label><input type="text" autocomplete="off" id="nurseWeight" placeholder="e.g. 150 lbs" value="${p.wt||''}" /></div>
          </div>
          <div class="field"><label>Nursing Note</label><textarea class="note-area" id="nurseNote" placeholder="Nursing observations, interventions, and patient response&hellip;"></textarea></div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px;">
            <button class="btn btn-outline" onclick="clearNursingNote()">Clear</button>
            <button class="btn btn-green" onclick="saveNursingNote()"><i class="ti ti-device-floppy"></i> Save Note</button>
          </div>
        </div>
      </div>`;
  }
}

// ── CUSTOM INPUT TOGGLE ──
function toggleCustomInput(selectId, customFieldId) {
  const select = document.getElementById(selectId);
  const customField = document.getElementById(customFieldId + 'Field');
  if (select.value === 'other') {
    customField.style.display = 'block';
  } else {
    customField.style.display = 'none';
  }
}

function updateOrderOptions() {
  const typeSelect = document.getElementById('orderTypeSelect');
  const nameSelect = document.getElementById('orderName');
  if (!typeSelect || !nameSelect) return;

  const selectedType = typeSelect.value;
  nameSelect.innerHTML = '<option value="">Select...</option>';

  if (selectedType === 'all' || selectedType === 'medications' || selectedType === 'other') {
    nameSelect.innerHTML += '<option value="other">Other (custom)</option>';
  } else {
    const categories = ORDER_NAME_OPTIONS[selectedType];
    if (categories) {
      for (const [cat, items] of Object.entries(categories)) {
        nameSelect.innerHTML += '<optgroup label="' + cat + '">' + items.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('') + '</optgroup>';
      }
    }
    nameSelect.innerHTML += '<option value="other">Other (custom)</option>';
  }

  var customField = document.getElementById('orderNameCustomField');
  if (customField) customField.style.display = 'none';
}

// ── PHYSICIAN NOTES ──
function toggleNoteForm() {
  noteFormOpen = !noteFormOpen;
  editingNoteId = null;
  noteFormData = {};
  renderSection('note');
}

function cancelNoteForm() {
  noteFormOpen = false;
  editingNoteId = null;
  noteFormData = {};
  renderSection('note');
}

function editPhysicianNote(id) {
  const note = currentPhysicianNotes.find(n => n.id === id);
  if (!note) return;
  editingNoteId = id;
  noteFormOpen = false;
  noteFormData = {};
  renderSection('note');
}

async function savePhysicianNote() {
  if (!currentPatient) return;
  function getTrixHtml(id) {
    const t = window.trixEditors && window.trixEditors[id];
    return t ? t.hidden.value : '';
  }
  const chief_complaint = getTrixHtml('noteChiefComplaint');
  const history_present_illness = getTrixHtml('noteHPI');
  const past_medical_history = getTrixHtml('notePMH');
  const surgical_history = getTrixHtml('noteSurgical');
  const hospitalizations = getTrixHtml('noteHospitalizations');
  const health_maintenance = getTrixHtml('noteHealth');
  const family_history = getTrixHtml('noteFamily');
  const social_history = getTrixHtml('noteSocial');
  const review_of_systems = getTrixHtml('noteROS');
  const physical_exam = getTrixHtml('notePhysical');
  const assessment = getTrixHtml('noteAssessment');
  const differential_diagnosis = getTrixHtml('noteDiffDx');
  const plan = getTrixHtml('notePlan');
  if (!chief_complaint && !history_present_illness && !past_medical_history && !surgical_history && !hospitalizations && !health_maintenance && !family_history && !social_history && !review_of_systems && !physical_exam && !assessment && !differential_diagnosis && !plan) {
    alert('Please enter at least one field.');
    return;
  }
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/physician-notes`, {
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
      differential_diagnosis,
      plan,
    });
    noteFormOpen = false;
    noteFormData = {};
    await loadPatientData(currentPatient.mr);
    renderSection('note');
  } catch (e) {
    alert('Error saving note: ' + e.message);
  }
}

async function saveNoteEdit() {
  if (!currentPatient || !editingNoteId) return;
  function getTrixHtml(id) {
    const t = window.trixEditors && window.trixEditors[id];
    return t ? t.hidden.value : '';
  }
  const chief_complaint = getTrixHtml('noteChiefComplaint');
  const history_present_illness = getTrixHtml('noteHPI');
  const past_medical_history = getTrixHtml('notePMH');
  const surgical_history = getTrixHtml('noteSurgical');
  const hospitalizations = getTrixHtml('noteHospitalizations');
  const health_maintenance = getTrixHtml('noteHealth');
  const family_history = getTrixHtml('noteFamily');
  const social_history = getTrixHtml('noteSocial');
  const review_of_systems = getTrixHtml('noteROS');
  const physical_exam = getTrixHtml('notePhysical');
  const assessment = getTrixHtml('noteAssessment');
  const differential_diagnosis = getTrixHtml('noteDiffDx');
  const plan = getTrixHtml('notePlan');
  if (!chief_complaint && !history_present_illness && !past_medical_history && !surgical_history && !hospitalizations && !health_maintenance && !family_history && !social_history && !review_of_systems && !physical_exam && !assessment && !differential_diagnosis && !plan) {
    alert('Please enter at least one field.');
    return;
  }
  try {
    await api('PUT', `/api/patients/${currentPatient.mr}/physician-notes/${editingNoteId}`, {
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
      differential_diagnosis,
      plan,
    });
    editingNoteId = null;
    noteFormData = {};
    await loadPatientData(currentPatient.mr);
    renderSection('note');
  } catch (e) {
    alert('Error saving edit: ' + e.message);
  }
}

async function deletePhysicianNote(id) {
  if (!currentPatient || !confirm('Delete this note?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/physician-notes/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('note');
  } catch (e) {
    alert('Error deleting note: ' + e.message);
  }
}

function toggleNoteDetails(id) {
  const details = document.getElementById('noteDetails' + id);
  details.style.display = details.style.display === 'none' ? 'block' : 'none';
}

// ── PDF REPORT GENERATION ──
function updateAddendumBtn() {
  const btn = document.getElementById('addendumBtn');
  if (addendumEnabled) {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  } else {
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
  }
}

function updateDeleteBtn() {
  const btn = document.getElementById('deletePatientBtn');
  if (currentUserRole === 'admin') {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.title = '';
  } else if (!currentPatient || !currentPatient.is_generated) {
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
    btn.title = 'Cannot delete seed/demo patients';
  } else {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.title = '';
  }
}

function buildReportContent(p) {
  const { Paragraph, TextRun, BorderStyle } = docx;
  const paragraphs = [];
  const font = 'Helvetica';

  function formatVisitType(type) {
    if (!type) return '—';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function addSimpleLine(label, value) {
    if (!value) return;
    paragraphs.push(new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: label + ': ', size: 20, font }),
        new TextRun({ text: value, size: 20, font }),
      ],
    }));
  }

  function addLabelLine(label) {
    paragraphs.push(new Paragraph({
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: label + ':', bold: true, size: 22, font })],
    }));
  }

  function addValueLine(html) {
    if (!html) return;
    addRichContent(html);
  }

  function addIndentedLine(text) {
    if (!text) return;
    paragraphs.push(new Paragraph({
      spacing: { after: 60 },
      indent: { left: 240 },
      children: [new TextRun({ text, size: 20, font })],
    }));
  }

  function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function parseInlineRuns(node) {
    const runs = [];
    node.childNodes.forEach(child => {
      if (child.nodeType === 3) {
        const text = child.textContent;
        if (text) runs.push(new TextRun({ text, size: 20, font }));
      } else if (child.nodeType === 1) {
        const tag = child.tagName.toLowerCase();
        const isBold = tag === 'strong' || tag === 'b';
        const isItalic = tag === 'em' || tag === 'i';
        if (tag === 'br') {
          runs.push(new TextRun({ text: '\n', size: 20, font }));
        } else {
          const innerRuns = parseInlineRuns(child);
          innerRuns.forEach(r => {
            if (isBold) r.options.bold = true;
            if (isItalic) r.options.italics = true;
            runs.push(r);
          });
        }
      }
    });
    return runs;
  }

  function addRichContent(html) {
    if (!html) return;
    const clean = stripHtml(html);
    if (!clean.trim()) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    function processList(listEl, level) {
      const isBullet = listEl.tagName.toLowerCase() === 'ul';
      Array.from(listEl.children).forEach(child => {
        if (child.tagName.toLowerCase() !== 'li') return;
        const runs = [];
        child.childNodes.forEach(cn => {
          if (cn.nodeType === 3) {
            const t = cn.textContent;
            if (t && t.trim()) runs.push(new TextRun({ text: t.trim(), size: 20, font }));
          } else if (cn.nodeType === 1) {
            const t = cn.tagName.toLowerCase();
            if (t !== 'ul' && t !== 'ol') {
              const innerRuns = parseInlineRuns(cn);
              const isBold = t === 'strong' || t === 'b';
              const isItalic = t === 'em' || t === 'i';
              innerRuns.forEach(r => {
                if (isBold) r.options.bold = true;
                if (isItalic) r.options.italics = true;
                runs.push(r);
              });
            }
          }
        });
        if (runs.length) {
          const pOpts = {
            spacing: { after: 60 },
            indent: { left: 360 * (level + 1) },
            children: runs,
          };
          if (isBullet) {
            pOpts.bullet = { level };
          } else {
            pOpts.numbering = { reference: 'ol-list', level };
          }
          paragraphs.push(new Paragraph(pOpts));
        }
        child.querySelectorAll(':scope > ul, :scope > ol').forEach(sub => {
          processList(sub, level + 1);
        });
      });
    }

    function processNode(node) {
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) {
          const text = child.textContent;
          if (text && text.trim()) {
            paragraphs.push(new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: text.trim(), size: 20, font })],
            }));
          }
        } else if (child.nodeType === 1) {
          const tag = child.tagName.toLowerCase();
          if (tag === 'p') {
            const runs = parseInlineRuns(child);
            if (runs.length) {
              paragraphs.push(new Paragraph({
                spacing: { after: 80 },
                children: runs,
              }));
            }
          } else if (tag === 'ul' || tag === 'ol') {
            processList(child, 0);
          } else if (tag === 'blockquote') {
            const runs = parseInlineRuns(child);
            if (runs.length) {
              paragraphs.push(new Paragraph({
                spacing: { after: 60 },
                indent: { left: 480 },
                children: runs,
              }));
            }
          } else {
            processNode(child);
          }
        }
      });
    }

    processNode(body);
  }

  // ── Title: bold 18pt ──
  paragraphs.push(new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: 'Physician Note Report', bold: true, size: 36, font })],
  }));

  // ── Section Header: bold 14pt ──
  paragraphs.push(new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: 'Patient Information', bold: true, size: 28, font })],
  }));

  addSimpleLine('Name', p.name);
  addSimpleLine('MR Number', p.mr);
  addSimpleLine('DOB', p.dob);
  addSimpleLine('Sex', p.sex === 'M' ? 'Male' : p.sex === 'F' ? 'Female' : 'Other');
  addSimpleLine('Phone', p.phone || '—');
  addSimpleLine('Insurance', p.ins || '—');

  const latestNote = currentPhysicianNotes.length > 0 ? currentPhysicianNotes[0] : null;

  if (latestNote) {
    // ── Section Header: bold 14pt ──
    paragraphs.push(new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'Physician Note', bold: true, size: 28, font })],
    }));

    addSimpleLine('Date', latestNote.visit_date || latestNote.created_at);
    addSimpleLine('Visit Type', formatVisitType(latestNote.visit_type));
    addSimpleLine('Signed by', latestNote.created_by || '—');
    if (latestNote.edited_at) {
      paragraphs.push(new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'This note was edited on ', bold: true, size: 20, font, italics: true, color: 'C00000' }),
          new TextRun({ text: latestNote.edited_at, size: 20, font, italics: true, color: 'C00000' }),
        ],
      }));
    }

    addLabelLine('Chief Complaint'); addValueLine(latestNote.chief_complaint);
    addLabelLine('History of Present Illness'); addValueLine(latestNote.history_present_illness);
    addLabelLine('Past Medical History'); addValueLine(latestNote.past_medical_history);
    addLabelLine('Surgical History'); addValueLine(latestNote.surgical_history);
    addLabelLine('Hospitalizations'); addValueLine(latestNote.hospitalizations);

    // ── Sub-Header: bold 12pt ──
    paragraphs.push(new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'Medications', bold: true, size: 24, font })],
    }));

    if (currentMeds && currentMeds.length > 0) {
      currentMeds.forEach(med => {
        const typeLabel = med.type === 'prescribed' ? 'New Prescription' : med.type === 'otc' ? 'Over the Counter' : med.type === 'supplement' ? 'Supplement' : 'Existing Medication';
        paragraphs.push(new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [new TextRun({ text: typeLabel + ': ' + med.name, bold: true, size: 20, font })],
        }));
        if (med.dose) addIndentedLine('Dose: ' + med.dose);
        if (med.freq) addIndentedLine('Frequency: ' + med.freq);
        if (med.route) addIndentedLine('Route: ' + med.route);
        if (med.start) addIndentedLine('Start Date: ' + med.start);
        if (med.prescriber) addIndentedLine('Prescriber: ' + med.prescriber);
      });
    } else {
      addLabelLine('Medications'); addValueLine('No medications on file');
    }

    // ── Sub-Header: bold 12pt ──
    paragraphs.push(new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: 'Allergies', bold: true, size: 24, font })],
    }));

    if (currentAllergies && currentAllergies.length > 0) {
      currentAllergies.forEach(allergy => {
        const allergyType = allergy.type ? allergy.type.charAt(0).toUpperCase() + allergy.type.slice(1) : 'Unknown';
        paragraphs.push(new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [new TextRun({ text: allergy.allergen + ' (' + allergyType + ')', bold: true, size: 20, font })],
        }));
        if (allergy.reaction) addIndentedLine('Reaction: ' + allergy.reaction);
        if (allergy.first_encounter) addIndentedLine('First Encountered: ' + allergy.first_encounter);
      });
    } else {
      addLabelLine('Allergies'); addValueLine('No allergies on file');
    }

    addLabelLine('Health Maintenance/Immunizations'); addValueLine(latestNote.health_maintenance);
    addLabelLine('Family History'); addValueLine(latestNote.family_history);
    addLabelLine('Social History'); addValueLine(latestNote.social_history);
    addLabelLine('Review of Systems'); addValueLine(latestNote.review_of_systems);
    addLabelLine('Physical Exam'); addValueLine(latestNote.physical_exam);

    // ── Vital Signs subsection under Physical Exam ──
    paragraphs.push(new Paragraph({
      spacing: { before: 120, after: 80 },
      children: [new TextRun({ text: 'Vital Signs', bold: true, size: 20, font })],
    }));
    addSimpleLine('Temperature', p.temp);
    addSimpleLine('Blood Pressure', p.bp);
    addSimpleLine('Pulse Rate', p.hr ? p.hr + ' bpm' : null);
    addSimpleLine('Respiratory Rate', p.resp_rate ? p.resp_rate + ' breaths/min' : null);
    addSimpleLine('O2 Saturation', p.o2_sat ? p.o2_sat + '%' : null);
    addSimpleLine('Height', p.height);
    addSimpleLine('Weight', p.wt);
    addSimpleLine('BMI', p.bmi);

    addLabelLine('Assessment'); addValueLine(latestNote.assessment);
    addLabelLine('Differential Diagnosis'); addValueLine(latestNote.differential_diagnosis);
    addLabelLine('Plan'); addValueLine(latestNote.plan);
  } else {
    addLabelLine('Physician Note'); addValueLine('No physician notes on file for this patient.');
  }

  return paragraphs;
}

function openAddendumModal() {
  if (!addendumEnabled) { alert('Please generate the report first before adding an addendum.'); return; }
  document.getElementById('addendumModal').classList.add('open');
  document.getElementById('addendumText').value = '';
}

function closeAddendumModal() {
  document.getElementById('addendumModal').classList.remove('open');
}

async function submitAddendum() {
  const addendum = document.getElementById('addendumText').value.trim();
  if (!addendum) { alert('Please enter addendum text.'); return; }
  closeAddendumModal();

  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
  const signedBy = currentUser || 'Dr. Unknown';

  try {
    const p = currentPatient;
    const reportParagraphs = buildReportContent(p);

    // Addendum section — bold 14pt header, normal 10pt body, matching PDF
    reportParagraphs.push(new docx.Paragraph({
      spacing: { before: 200 },
      children: [],
    }));
    reportParagraphs.push(new docx.Paragraph({
      spacing: { before: 160, after: 100 },
      children: [new docx.TextRun({ text: 'Addendum', bold: true, size: 28, font: 'Helvetica' })],
    }));
    reportParagraphs.push(new docx.Paragraph({
      spacing: { after: 140 },
      children: [new docx.TextRun({ text: 'Date: ', bold: true, size: 20, font: 'Helvetica' }),
                 new docx.TextRun({ text: timestamp, size: 20, font: 'Helvetica' })],
    }));
    reportParagraphs.push(new docx.Paragraph({
      spacing: { after: 140 },
      children: [new docx.TextRun({ text: addendum, size: 20, font: 'Helvetica' })],
    }));
    reportParagraphs.push(new docx.Paragraph({ spacing: { before: 200 }, children: [] }));
    reportParagraphs.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: `Signed by: ${signedBy}`, italics: true, size: 20, font: 'Helvetica' })],
    }));

    const doc = new docx.Document({
      numbering: { config: [{ reference: 'ol-list', levels: [{ level: 0, format: docx.LevelFormat.DECIMAL, text: '%1.', alignment: docx.AlignmentType.LEFT }] }] },
      sections: [{ children: reportParagraphs }],
    });

    const blob = await docx.Packer.toBlob(doc);
    const fileName = `${p.name.replace(/\s+/g, '_')}_Addendum_${now.toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating addendum:', error);
    alert('Error generating addendum: ' + error.message);
  }
}

async function generateReport() {
  if (!currentPatient) return;

  const confirmed = confirm('Generate the physician note report as a DOCX file?');
  if (!confirmed) return;

  // // Lock feature — commented out for now
  // const isAdmin = await fetch('/api/auth/user').then(r => r.json()).then(u => u.role === 'admin').catch(() => false);
  // if (!isAdmin) {
  //   try {
  //     await api('POST', `/api/patients/${currentPatient.mr}/lock`);
  //     await api('POST', `/api/patients/${currentPatient.mr}/unlock-results`);
  //   } catch (e) {
  //     alert('Error: ' + e.message);
  //     return;
  //   }
  // }

  try {
    const p = currentPatient;
    const reportParagraphs = buildReportContent(p);

    // Signed by
    reportParagraphs.push(new docx.Paragraph({ spacing: { before: 300 }, children: [] }));
    reportParagraphs.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: `Signed by: ${currentUser || 'Dr. Unknown'}`, italics: true, size: 20, font: 'Helvetica' })],
    }));

    const doc = new docx.Document({
      numbering: { config: [{ reference: 'ol-list', levels: [{ level: 0, format: docx.LevelFormat.DECIMAL, text: '%1.', alignment: docx.AlignmentType.LEFT }] }] },
      sections: [{ children: reportParagraphs }],
    });

    const blob = await docx.Packer.toBlob(doc);
    const fileName = `${p.name.replace(/\s+/g, '_')}_Physician_Note_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);

    // Enable addendum button
    addendumEnabled = true;
    updateAddendumBtn();
    updateDeleteBtn();
  } catch (error) {
    console.error('Error generating report:', error);
    alert('Error generating report: ' + error.message);
  }
}

// ── STATUS DROPDOWN FUNCTIONS ──
function showPatientStatusDropdown(index, event) {
  event.stopPropagation();
  const patient = patients[index];
  const dropdown = document.createElement('div');
  dropdown.className = 'status-dropdown';
  dropdown.style.position = 'absolute';
  dropdown.style.left = event.clientX + 'px';
  dropdown.style.top = event.clientY + 'px';
  dropdown.style.zIndex = '1000';
  dropdown.style.background = 'white';
  dropdown.style.border = '1px solid #ccc';
  dropdown.style.borderRadius = '4px';
  dropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  dropdown.innerHTML = `
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusFromDashboard(${index}, 'waiting')">Waiting</div>
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusFromDashboard(${index}, 'ready')">Ready</div>
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusFromDashboard(${index}, 'complete')">Complete</div>
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusFromDashboard(${index}, 'cancelled')">Cancelled</div>
  `;
  document.body.appendChild(dropdown);
  setTimeout(() => {
    document.addEventListener('click', function removeDropdown(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', removeDropdown);
      }
    });
  }, 0);
}

function showPatientStatusDropdownInPatient(event) {
  event.stopPropagation();
  if (!currentPatient) return;
  const dropdown = document.createElement('div');
  dropdown.className = 'status-dropdown';
  dropdown.style.position = 'absolute';
  dropdown.style.left = event.clientX + 'px';
  dropdown.style.top = event.clientY + 'px';
  dropdown.style.zIndex = '1000';
  dropdown.style.background = 'white';
  dropdown.style.border = '1px solid #ccc';
  dropdown.style.borderRadius = '4px';
  dropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  dropdown.innerHTML = `
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusInPatient('waiting')">Waiting</div>
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusInPatient('ready')">Ready</div>
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusInPatient('complete')">Complete</div>
    <div style="padding:8px 12px;cursor:pointer" onclick="updatePatientStatusInPatient('cancelled')">Cancelled</div>
  `;
  document.body.appendChild(dropdown);
  setTimeout(() => {
    document.addEventListener('click', function removeDropdown(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', removeDropdown);
      }
    });
  }, 0);
}

async function updatePatientStatusInPatient(newStatus) {
  if (!currentPatient) return;
  try {
    await api('PUT', `/api/patients/${currentPatient.mr}/status`, { status: newStatus });
    currentPatient.status = newStatus;
    const patientIndex = patients.findIndex(p => p.mr === currentPatient.mr);
    if (patientIndex !== -1) {
      patients[patientIndex].status = newStatus;
    }
    openPatient(patientIndex);
    renderSchedule(patients);
    updateStats(patients);
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

async function updatePatientStatusFromDashboard(index, newStatus) {
  const patient = patients[index];
  try {
    await api('PUT', `/api/patients/${patient.mr}/status`, { status: newStatus });
    patient.status = newStatus;
    renderSchedule(patients);
    updateStats(patients);
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

function showStatusDropdown(type, id, event, options) {
  event.stopPropagation();
  const dropdown = document.createElement('div');
  dropdown.className = 'status-dropdown';
  dropdown.style.position = 'absolute';
  dropdown.style.left = event.clientX + 'px';
  dropdown.style.top = event.clientY + 'px';
  dropdown.style.zIndex = '1000';
  dropdown.style.background = 'white';
  dropdown.style.border = '1px solid #ccc';
  dropdown.style.borderRadius = '4px';
  dropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  dropdown.innerHTML = options.map(opt => `<div style="padding:8px 12px;cursor:pointer" onclick="updateStatusFromDropdown('${type}', ${id}, '${opt}')">${opt}</div>`).join('');
  document.body.appendChild(dropdown);
  setTimeout(() => {
    document.addEventListener('click', function removeDropdown(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', removeDropdown);
      }
    });
  }, 0);
}

async function updateStatusFromDropdown(type, id, newStatus) {
  if (!currentPatient) return;
  let annotation = '';
  if (type === 'problem' && (newStatus === 'inactive' || newStatus === 'in the past')) {
    annotation = prompt('Enter annotation (when/why this is inactive/in the past):');
  }
  try {
    if (type === 'order') {
      await api('PUT', `/api/patients/${currentPatient.mr}/orders/${id}/status`, { status: newStatus });
      await loadPatientData(currentPatient.mr);
      renderSection('orders');
    } else if (type === 'consultation') {
      await api('PUT', `/api/patients/${currentPatient.mr}/consultations/${id}/status`, { status: newStatus });
      await loadPatientData(currentPatient.mr);
      renderSection('consultations');
    } else if (type === 'study') {
      await api('PUT', `/api/patients/${currentPatient.mr}/studies/${id}/status`, { status: newStatus });
      await loadPatientData(currentPatient.mr);
      renderSection('studies');
    } else if (type === 'problem') {
      await api('PUT', `/api/patients/${currentPatient.mr}/problems/${id}/status`, { status: newStatus, annotation });
      await loadPatientData(currentPatient.mr);
      renderSection('problems');
    }
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

// ── STATUS CHANGE FUNCTIONS ──
async function changePatientStatus() {
  if (!currentPatient) return;
  const newStatus = prompt('Enter new status (waiting, ready, complete, cancelled):', currentPatient.status);
  if (!newStatus || !STATUS[newStatus]) {
    alert('Invalid status. Options: waiting, ready, complete, cancelled');
    return;
  }
  try {
    await api('PUT', `/api/patients/${currentPatient.mr}/status`, { status: newStatus });
    currentPatient.status = newStatus;
    openPatient(patients.findIndex(p => p.mr === currentPatient.mr));
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

async function changeOrderStatus(id) {
  if (!currentPatient) return;
  const newStatus = prompt('Enter new status (Pending, In Progress, Complete, Cancelled):');
  if (!newStatus) return;
  try {
    await api('PUT', `/api/patients/${currentPatient.mr}/orders/${id}/status`, { status: newStatus });
    await loadPatientData(currentPatient.mr);
    renderSection('orders');
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

async function changeConsultationStatus(id) {
  if (!currentPatient) return;
  const newStatus = prompt('Enter new status (Pending, Scheduled, Completed, Cancelled):');
  if (!newStatus) return;
  try {
    await api('PUT', `/api/patients/${currentPatient.mr}/consultations/${id}/status`, { status: newStatus });
    await loadPatientData(currentPatient.mr);
    renderSection('consultations');
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

async function changeStudyStatus(id) {
  if (!currentPatient) return;
  const newStatus = prompt('Enter new status (Pending, In Progress, Final, Cancelled):');
  if (!newStatus) return;
  try {
    await api('PUT', `/api/patients/${currentPatient.mr}/studies/${id}/status`, { status: newStatus });
    await loadPatientData(currentPatient.mr);
    renderSection('studies');
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

async function changeProblemStatus(id, currentStatus) {
  if (!currentPatient) return;
  const newStatus = prompt('Enter new status (active, inactive, in the past):', currentStatus);
  if (!newStatus) return;
  let annotation = '';
  if (newStatus === 'inactive' || newStatus === 'in the past') {
    annotation = prompt('Enter annotation (when/why this is inactive/in the past):');
  }
  try {
    await api('PUT', `/api/patients/${currentPatient.mr}/problems/${id}/status`, { status: newStatus, annotation });
    await loadPatientData(currentPatient.mr);
    renderSection('problems');
  } catch (e) {
    alert('Error updating status: ' + e.message);
  }
}

// ── NURSING NOTES ──
async function saveNursingNote() {
  if (!currentPatient) return;
  const nurseName = document.getElementById('nurseName')?.value;
  const time = document.getElementById('nurseTime')?.value;
  const bloodPressure = document.getElementById('nurseBP')?.value;
  const heartRate = document.getElementById('nurseHR')?.value;
  const temperature = document.getElementById('nurseTemp')?.value;
  const weight = document.getElementById('nurseWeight')?.value;
  const note = document.getElementById('nurseNote')?.value;
  if (!nurseName && !time && !bloodPressure && !heartRate && !temperature && !weight && !note) {
    alert('Please enter at least one field.');
    return;
  }
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/nursing-notes`, {
      nurse_name: nurseName,
      time,
      blood_pressure: bloodPressure,
      heart_rate: heartRate,
      temperature,
      weight,
      note,
    });
    await loadPatientData(currentPatient.mr);
    renderSection('nursing');
    clearNursingNote();
  } catch (e) {
    alert('Error saving note: ' + e.message);
  }
}

async function deleteNursingNote(id) {
  if (!currentPatient || !confirm('Delete this note?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/nursing-notes/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('nursing');
  } catch (e) {
    alert('Error deleting note: ' + e.message);
  }
}

function clearNursingNote() {
  document.getElementById('nurseName').value = '';
  document.getElementById('nurseTime').value = '';
  document.getElementById('nurseBP').value = currentPatient?.bp || '';
  document.getElementById('nurseHR').value = currentPatient?.hr ? currentPatient.hr + ' bpm' : '';
  document.getElementById('nurseTemp').value = currentPatient?.temp || '';
  document.getElementById('nurseWeight').value = currentPatient?.wt || '';
  document.getElementById('nurseNote').value = '';
}

// ── MEDICATIONS ──
function toggleMedForm() {
  const form = document.getElementById('medForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function toggleMedTypeFields() {
  // Can be used to show/hide specific fields based on medication type
  // For now, all fields are the same for both types
}

async function addMedication() {
  if (!currentPatient) return;
  const name = document.getElementById('medName')?.value;
  if (!name) { alert('Please enter a medication name.'); return; }
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/medications`, {
      name,
      dose: document.getElementById('medDose')?.value || '',
      freq: document.getElementById('medFreq')?.value || '',
      route: document.getElementById('medRoute')?.value || '',
      start: document.getElementById('medStart')?.value || '',
      prescriber: document.getElementById('medPrescriber')?.value || '',
      type: document.getElementById('medType')?.value || 'existing',
    });
    await loadPatientData(currentPatient.mr);
    renderSection('meds');
    document.getElementById('medName').value = '';
    document.getElementById('medDose').value = '';
    document.getElementById('medFreq').value = '';
    document.getElementById('medRoute').value = '';
    document.getElementById('medStart').value = '';
    document.getElementById('medPrescriber').value = '';
  } catch (e) {
    alert('Error adding medication: ' + e.message);
  }
}

async function deleteMedication(id) {
  if (!currentPatient || !confirm('Remove this medication?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/medications/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('meds');
  } catch (e) {
    alert('Error removing medication: ' + e.message);
  }
}

// ── ORDERS ──
function setOrderType(type) {
  currentOrderType = type;
  renderSection('orders');
  // Update the order type dropdown to match the selected filter
  setTimeout(() => {
    const orderTypeSelect = document.getElementById('orderTypeSelect');
    if (orderTypeSelect && type !== 'all') {
      orderTypeSelect.value = type;
      updateOrderOptions();
    }
  }, 0);
}

async function addOrder() {
  if (!currentPatient) return;
  const typeSelect = document.getElementById('orderTypeSelect')?.value;
  const nameSelect = document.getElementById('orderName')?.value;
  const nameCustom = document.getElementById('orderNameCustom')?.value;
  let name = nameSelect;
  let category = null;

  // Find category from ORDER_NAME_OPTIONS based on selected type
  if (nameSelect && nameSelect !== 'other') {
    const typeCategories = ORDER_NAME_OPTIONS[typeSelect] || ORDER_NAME_OPTIONS.labs;
    for (const [cat, items] of Object.entries(typeCategories)) {
      if (items.includes(nameSelect)) {
        category = cat;
        break;
      }
    }
  }

  if (nameSelect === 'other') {
    name = nameCustom;
    if (!name) { alert('Please enter a custom order name.'); return; }
  }
  if (!name) return;
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/orders`, {
      type: typeSelect,
      category,
      name,
      priority: document.getElementById('orderPriority')?.value,
      order_date: document.getElementById('orderDate')?.value || null,
      status: document.getElementById('orderStatus')?.value,
      notes: document.getElementById('orderNotes')?.value || '',
    });
    await loadPatientData(currentPatient.mr);
    renderSection('orders');
    document.getElementById('orderName').value = '';
    document.getElementById('orderPriority').value = 'Routine';
    document.getElementById('orderDate').value = '';
    document.getElementById('orderStatus').value = 'Pending';
    document.getElementById('orderNotes').value = '';
    if (document.getElementById('orderNameCustomField').style.display === 'block') {
      document.getElementById('orderNameCustom').value = '';
      document.getElementById('orderNameCustomField').style.display = 'none';
      document.getElementById('orderName').value = '';
    }
  } catch (e) {
    alert('Error placing order: ' + e.message);
  }
}

async function deleteOrder(id) {
  if (!currentPatient || !confirm('Remove this order?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/orders/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('orders');
  } catch (e) {
    alert('Error removing order: ' + e.message);
  }
}

// ── PROBLEMS ──
async function addProblem() {
  if (!currentPatient) return;
  const sel = document.getElementById('problemSelect');
  const nameSelect = sel?.value;
  const nameCustom = document.getElementById('problemNameCustom')?.value;
  let name = nameSelect;
  if (nameSelect === 'other') {
    name = nameCustom;
    if (!name) { alert('Please enter a custom problem name.'); return; }
  }
  if (!name) { alert('Please select a problem from the dropdown.'); return; }
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/problems`, {
      name,
      category: getProblemCategory(name),
      status: 'active',
    });
    await loadPatientData(currentPatient.mr);
    renderSection('problems');
  } catch (e) {
    alert(e.message);
  }
}

async function deleteProblem(id) {
  if (!currentPatient) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/problems/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('problems');
  } catch (e) {
    alert('Error removing problem: ' + e.message);
  }
}

async function clearProblems() {
  if (!currentPatient || !currentProblems.length) return;
  if (!confirm('Clear all problems from this patient?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/problems`);
    await loadPatientData(currentPatient.mr);
    renderSection('problems');
  } catch (e) {
    alert('Error clearing problems: ' + e.message);
  }
}

// ── CONSULTATIONS ──
async function addConsultation() {
  if (!currentPatient) return;
  const specialty = document.getElementById('consultSpecialty')?.value;
  if (!specialty) return;
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/consultations`, {
      specialty,
      requested_date: document.getElementById('consultDate')?.value || null,
      status: document.getElementById('consultStatus')?.value,
      consultant: document.getElementById('consultConsultant')?.value || '',
      summary: document.getElementById('consultSummary')?.value || '',
    });
    await loadPatientData(currentPatient.mr);
    renderSection('consultations');
  } catch (e) {
    alert('Error requesting consult: ' + e.message);
  }
}

async function deleteConsultation(id) {
  if (!currentPatient || !confirm('Remove this consultation?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/consultations/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('consultations');
  } catch (e) {
    alert('Error removing consultation: ' + e.message);
  }
}

// ── STUDIES ──
async function addStudy() {
  if (!currentPatient) return;
  const nameSelect = document.getElementById('studyName')?.value;
  const nameCustom = document.getElementById('studyNameCustom')?.value;
  let name = nameSelect;
  if (nameSelect === 'other') {
    name = nameCustom;
    if (!name) { alert('Please enter a custom study name.'); return; }
  }
  if (!name) return;
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/studies`, {
      name,
      study_date: document.getElementById('studyDate')?.value || null,
      result: document.getElementById('studyResult')?.value || '',
      status: document.getElementById('studyStatus')?.value,
      image_data: currentStudyImageData || '',
    });
    currentStudyImageData = '';
    await loadPatientData(currentPatient.mr);
    renderSection('studies');
  } catch (e) {
    alert('Error adding study: ' + e.message);
  }
}

async function deleteStudy(id) {
  if (!currentPatient || !confirm('Remove this study?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/studies/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('studies');
  } catch (e) {
    alert('Error removing study: ' + e.message);
  }
}

// ── IMAGE PREVIEW ──
let currentImageData = '';
let currentStudyImageData = '';

function previewImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    currentImageData = ev.target.result;
    const preview = document.getElementById('imgPreview');
    if (preview) {
      preview.innerHTML = `<img src="${ev.target.result}" style="max-height:200px;max-width:100%;border-radius:4px;" />`;
    }
  };
  reader.readAsDataURL(file);
}

function previewStudyImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    currentStudyImageData = ev.target.result;
    const preview = document.getElementById('studyPreview');
    if (preview) {
      preview.innerHTML = `<img src="${ev.target.result}" style="max-height:200px;max-width:100%;border-radius:4px;cursor:pointer;" onclick="openImageLightbox(this.src)" title="Click to view full size" />`;
    }
  };
  reader.readAsDataURL(file);
}

function openImageLightbox(src) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;';
  overlay.innerHTML = `<img src="${src}" style="max-width:95vw;max-height:95vh;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);" />`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

async function saveImaging() {
  if (!currentPatient) return;
  const label = document.getElementById('imgLabel')?.value;
  const annotations = document.getElementById('imgAnnotations')?.value;
  if (!label) { alert('Please enter an image label.'); return; }
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/imaging`, {
      label,
      image_data: currentImageData,
      annotations,
    });
    await loadPatientData(currentPatient.mr);
    renderSection('imaging');
    clearImagingForm();
  } catch (e) {
    alert('Error saving image: ' + e.message);
  }
}

async function deleteImaging(id) {
  if (!currentPatient || !confirm('Delete this image?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/imaging/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('imaging');
  } catch (e) {
    alert('Error deleting image: ' + e.message);
  }
}

function clearImagingForm() {
  document.getElementById('imgLabel').value = '';
  document.getElementById('imgAnnotations').value = '';
  document.getElementById('imgUpload').value = '';
  document.getElementById('imgPreview').innerHTML = '';
  currentImageData = '';
}

// ── ALLERGIES ──
async function addAllergy() {
  if (!currentPatient) return;
  const allergen = document.getElementById('allergyAllergen')?.value;
  const type = document.getElementById('allergyType')?.value;
  const reaction = document.getElementById('allergyReaction')?.value;
  const firstEncounter = document.getElementById('allergyFirstEncounter')?.value;
  if (!allergen || !type) { alert('Please enter allergen and type.'); return; }
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/allergies`, {
      allergen,
      type,
      reaction,
      first_encounter: firstEncounter,
    });
    await loadPatientData(currentPatient.mr);
    renderSection('allergies');
    updatePatientInfo();
    document.getElementById('allergyAllergen').value = '';
    document.getElementById('allergyReaction').value = '';
    document.getElementById('allergyFirstEncounter').value = '';
  } catch (e) {
    alert('Error adding allergy: ' + e.message);
  }
}

async function deleteAllergy(id) {
  if (!currentPatient || !confirm('Remove this allergy?')) return;
  try {
    await api('DELETE', `/api/patients/${currentPatient.mr}/allergies/${id}`);
    await loadPatientData(currentPatient.mr);
    renderSection('allergies');
    updatePatientInfo();
  } catch (e) {
    alert('Error removing allergy: ' + e.message);
  }
}

function clearLabForm() {
  const el = id => document.getElementById(id);
  if (el('labTestName')) el('labTestName').value = '';
  if (el('labOrderDate')) el('labOrderDate').value = '';
  if (el('labResult')) el('labResult').value = '';
  if (el('labStatus')) el('labStatus').value = 'Completed';
  if (el('labOrderedBy')) el('labOrderedBy').value = currentPatient?.sched || '';
  if (el('labNotes')) el('labNotes').value = '';
}

async function saveLabResult() {
  if (!currentPatient) return;
  const sel = document.getElementById('labTestName');
  const name = sel?.value?.trim();
  if (!name) { alert('Select a test name.'); return; }
  const category = sel.options[sel.selectedIndex]?.getAttribute('data-category') || null;
  try {
    await api('POST', `/api/patients/${currentPatient.mr}/orders`, {
      type: 'labs',
      category,
      name,
      result: document.getElementById('labResult')?.value || '',
      priority: 'Routine',
      order_date: document.getElementById('labOrderDate')?.value || null,
      status: document.getElementById('labStatus')?.value || 'Completed',
      notes: document.getElementById('labNotes')?.value || ''
    });
    await loadPatientData(currentPatient.mr);
    renderSection('labs');
    clearLabForm();
  } catch (e) {
    alert('Error saving lab: ' + e.message);
  }
}
