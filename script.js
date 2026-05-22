// ══════════════════════════════════════════════
//  BRANCH CONFIGURATIONS
// ══════════════════════════════════════════════
const BRANCHES = {
  usaf: {
    id: 'usaf',
    label: 'USAF',
    fullName: 'Air Force',
    unitTerm: 'Squadron',
    color: '#3b82f6',   // Air Force blue
    colorRgb: '59,130,246',
    roleLabel: 'AFSC / Role',
    rolePlaceholder: 'e.g. 2A571 Crew Chief',
    tdyLabel: 'TDY',
    deployedLabel: 'Deployed',
    ranks: ['Amn','A1C','SrA','SSgt','TSgt','MSgt','SMSgt','CMSgt','2Lt','1Lt','Capt','Maj','Lt Col','Col','Brig Gen'],
    quals: ['Crew Chief','Task Certified','7-lvl','CDDAR','Weapons','Flight Lead','IP','MX Controller','Evaluator','Stan/Eval'],
    sections: [
      {id:'ops',   name:'Operations',   required:8,  positions:['Flight Lead','Wingman 1','Wingman 2','Weapons Officer','IP Slot','Scheduler','SOF','Additional Duty']},
      {id:'mx',    name:'Maintenance',  required:10, positions:['Expediter','Crew Chief A','Crew Chief B','Crew Chief C','Avionics','Weapons','Egress','Phase','CDDAR','QA']},
      {id:'intel', name:'Intelligence', required:4,  positions:['OIC','NCOIC','Analyst 1','Analyst 2']},
      {id:'log',   name:'Logistics',    required:5,  positions:['Chief','Supply 1','Supply 2','Transportation','Plans']},
      {id:'med',   name:'Medical / FP', required:3,  positions:['Flight Doc','Corpsman','Readiness NCO']},
      {id:'hq',    name:'HQ / Admin',   required:4,  positions:['DO','Chief of Staff','Admin NCO','Legal']},
    ],
    samplePeople: [
      {id:'af1', name:'Rodriguez, M.',rank:'MSgt', role:'2A571 Crew Chief', status:'available',quals:['Crew Chief','Task Certified','7-lvl'],section:'mx',   slot:1},
      {id:'af2', name:'Chen, K.',     rank:'SSgt', role:'2A571 Crew Chief', status:'available',quals:['Crew Chief','Task Certified'],        section:'mx',   slot:2},
      {id:'af3', name:'Williams, T.', rank:'TSgt', role:'2A571 Avionics',   status:'available',quals:['7-lvl'],                              section:'mx',   slot:4},
      {id:'af4', name:'Martinez, J.', rank:'Capt', role:'11F Pilot',        status:'available',quals:['Flight Lead','IP'],                   section:'ops',  slot:0},
      {id:'af5', name:'Thompson, R.', rank:'Maj',  role:'11F Pilot',        status:'available',quals:['Flight Lead','IP'],                   section:'ops',  slot:4},
      {id:'af6', name:'Davis, A.',    rank:'1Lt',  role:'11F Pilot',        status:'tdy',      quals:[],                                     section:'ops',  slot:1},
      {id:'af7', name:'Kim, S.',      rank:'Capt', role:'14N Intel',        status:'available',quals:[],                                     section:'intel',slot:0},
      {id:'af8', name:'Johnson, B.',  rank:'MSgt', role:'2S071 Supply',     status:'deployed', quals:[],                                     section:'log',  slot:1},
      {id:'af9', name:'Garcia, L.',   rank:'A1C',  role:'2A571 Crew Chief', status:'available',quals:[],                                     section:'mx',   slot:3},
      {id:'af10',name:'Patel, V.',    rank:'TSgt', role:'2A571 CDDAR',      status:'available',quals:['CDDAR','7-lvl'],                      section:'mx',   slot:8},
      {id:'af11',name:'Brown, E.',    rank:'SSgt', role:'14N Analyst',      status:'available',quals:[],                                     section:'intel',slot:2},
      {id:'af12',name:'Wilson, C.',   rank:'Lt Col',role:'DO',              status:'available',quals:[],                                     section:'hq',   slot:0},
      {id:'af13',name:'Lee, H.',      rank:'SrA',  role:'2A571 Crew Chief', status:'available',quals:['Task Certified'],                     section:null,   slot:null},
      {id:'af14',name:'Adams, P.',    rank:'TSgt', role:'Admin NCO',        status:'available',quals:[],                                     section:'hq',   slot:2},
    ],
  },

  army: {
    id: 'army',
    label: 'USA',
    fullName: 'Army',
    unitTerm: 'Company',
    color: '#4ade80',   // Army green
    colorRgb: '74,222,128',
    roleLabel: 'MOS / Role',
    rolePlaceholder: 'e.g. 11B Infantryman',
    tdyLabel: 'TDY',
    deployedLabel: 'Deployed',
    ranks: ['Pvt','PV2','PFC','SPC','CPL','SGT','SSG','SFC','MSG','1SG','SGM','CSM','2LT','1LT','CPT','MAJ','LTC','COL','BG'],
    quals: ['Airborne','Air Assault','Ranger','SERE','Combat Lifesaver','JTAC','Sniper','Demo','CBRN','Pathfinder'],
    sections: [
      {id:'hq',    name:'HQ Platoon',   required:6,  positions:['CO','XO','1SG','S3','S4','RTO']},
      {id:'alpha', name:'Alpha Plt',    required:9,  positions:['PLT LDR','PSG','TM LDR A','TM LDR B','Bravo TL','SAW 1','SAW 2','RTO','Medic']},
      {id:'bravo', name:'Bravo Plt',    required:9,  positions:['PLT LDR','PSG','TM LDR A','TM LDR B','Bravo TL','SAW 1','SAW 2','RTO','Medic']},
      {id:'charlie',name:'Charlie Plt', required:9,  positions:['PLT LDR','PSG','TM LDR A','TM LDR B','Bravo TL','SAW 1','SAW 2','RTO','Medic']},
      {id:'wpns',  name:'Weapons Plt',  required:6,  positions:['PLT LDR','PSG','Mortar TL','JTAC','Sniper TL','Anti-Armor']},
      {id:'css',   name:'CSS / Log',    required:5,  positions:['S4','Supply SGT','Mechanic 1','Mechanic 2','Comms']},
    ],
    samplePeople: [
      {id:'ar1', name:'Ramirez, J.',  rank:'CPT', role:'11A Infantry Officer',  status:'available',quals:['Ranger','Airborne'],    section:'hq',    slot:0},
      {id:'ar2', name:'Nguyen, T.',   rank:'1LT', role:'11A Infantry Officer',  status:'available',quals:['Airborne'],             section:'hq',    slot:1},
      {id:'ar3', name:'Okafor, D.',   rank:'1SG', role:'11Z Infantry Sr NCO',   status:'available',quals:['Ranger','SERE'],        section:'hq',    slot:2},
      {id:'ar4', name:'Torres, M.',   rank:'SFC', role:'11B Infantryman',        status:'available',quals:['Airborne','Air Assault'],section:'alpha', slot:1},
      {id:'ar5', name:'Smith, K.',    rank:'SGT', role:'11B Infantryman',        status:'available',quals:['Combat Lifesaver'],     section:'alpha', slot:2},
      {id:'ar6', name:'Johnson, A.',  rank:'SPC', role:'68W Combat Medic',       status:'available',quals:['Combat Lifesaver'],    section:'alpha', slot:8},
      {id:'ar7', name:'Brown, C.',    rank:'SSG', role:'11B Infantryman',        status:'tdy',      quals:['Airborne'],            section:'bravo', slot:1},
      {id:'ar8', name:'Davis, R.',    rank:'SGT', role:'11C Indirect Fire',      status:'available',quals:[],                      section:'wpns',  slot:2},
      {id:'ar9', name:'Wilson, E.',   rank:'SPC', role:'25U Signal',             status:'deployed', quals:[],                      section:'css',   slot:4},
      {id:'ar10',name:'Martinez, F.', rank:'SSG', role:'11B Infantryman',        status:'available',quals:['JTAC'],                section:'wpns',  slot:3},
      {id:'ar11',name:'Garcia, L.',   rank:'PFC', role:'11B Infantryman',        status:'available',quals:[],                      section:null,    slot:null},
    ],
  },

  navy: {
    id: 'navy',
    label: 'USN',
    fullName: 'Navy',
    unitTerm: 'Division',
    color: '#60a5fa',   // Navy blue (lighter for dark bg)
    colorRgb: '96,165,250',
    roleLabel: 'NEC / Rating',
    rolePlaceholder: 'e.g. BM Boatswain\'s Mate',
    tdyLabel: 'TAD',
    deployedLabel: 'Underway',
    ranks: ['SR','SA','SN','PO3','PO2','PO1','CPO','SCPO','MCPO','CMDCM','MCPON','ENS','LTJG','LT','LCDR','CDR','CAPT','RDML'],
    quals: ['Qualified OOD','EOOW','Surface Warfare','EOD','SEAL','Diver','Rescue Swimmer','JTAC','SERE','Nuclear'],
    sections: [
      {id:'ops',  name:'Operations',    required:6, positions:['OOD','JOOD','CIC Watch','Radar Supervisor','Signals','Helm']},
      {id:'eng',  name:'Engineering',   required:8, positions:['CHENG','EOOW','Electrician 1','Electrician 2','Machinist 1','Machinist 2','Damage Control','Hull Tech']},
      {id:'deck', name:'Deck / Boats',  required:5, positions:['BMC','BM1','BM2','BM3','Messenger']},
      {id:'supply',name:'Supply',       required:4, positions:['Supply Off','CS1','SK1','PC1']},
      {id:'med',  name:'Medical',       required:3, positions:['Medical Off','HM1','HM2']},
      {id:'admin',name:'Admin / XO',    required:4, positions:['XO','YN1','NC1','Chaplain']},
    ],
    samplePeople: [
      {id:'nv1', name:'Petersen, J.', rank:'LCDR',role:'1100 Surface Warfare Off',status:'available',quals:['Qualified OOD','Surface Warfare'],section:'ops',  slot:0},
      {id:'nv2', name:'Yamamoto, T.', rank:'LT',  role:'1120 Submarine Off',      status:'available',quals:['EOOW'],                          section:'eng',  slot:0},
      {id:'nv3', name:'Williams, D.', rank:'CPO', role:'BM Boatswain\'s Mate',    status:'available',quals:['Surface Warfare'],               section:'deck', slot:0},
      {id:'nv4', name:'Rodriguez, A.',rank:'PO1', role:'EM Electrician\'s Mate',   status:'available',quals:['Nuclear'],                       section:'eng',  slot:2},
      {id:'nv5', name:'Chen, M.',     rank:'PO2', role:'HM Hospital Corpsman',     status:'available',quals:['Rescue Swimmer'],               section:'med',  slot:1},
      {id:'nv6', name:'Thompson, R.', rank:'PO1', role:'YN Yeoman',               status:'tdy',      quals:[],                               section:'admin',slot:1},
      {id:'nv7', name:'Davis, S.',    rank:'PO3', role:'CS Culinary Specialist',   status:'available',quals:[],                               section:'supply',slot:1},
      {id:'nv8', name:'Johnson, K.',  rank:'LT',  role:'1160 EOD Officer',         status:'deployed', quals:['EOD','SERE'],                   section:null,   slot:null},
      {id:'nv9', name:'Kim, B.',      rank:'PO2', role:'BM Boatswain\'s Mate',     status:'available',quals:[],                               section:'deck', slot:1},
    ],
  },

  marines: {
    id: 'marines',
    label: 'USMC',
    fullName: 'Marine Corps',
    unitTerm: 'Company',
    color: '#f97316',   // USMC scarlet-orange
    colorRgb: '249,115,22',
    roleLabel: 'MOS / Role',
    rolePlaceholder: 'e.g. 0311 Rifleman',
    tdyLabel: 'TAD',
    deployedLabel: 'Deployed',
    ranks: ['Pvt','PFC','LCpl','Cpl','Sgt','SSgt','GySgt','MSgt','1stSgt','MGySgt','SgtMaj','2ndLt','1stLt','Capt','Maj','LtCol','Col','BGen'],
    quals: ['Rifle Expert','Pistol Expert','Jump Qual','SERE','JTAC','Scout Sniper','Combat Diver','ANGLICO','EOD','Martial Arts Instructor'],
    sections: [
      {id:'hq',   name:'H&S Plt',        required:5, positions:['CO','XO','SgtMaj','S3 SNCO','Gunner']},
      {id:'1plt', name:'1st Platoon',     required:8, positions:['PLT CDR','PLT SGT','Squad Ldr 1','Squad Ldr 2','Squad Ldr 3','Corpsman','SAW Gunner','Asst Gunner']},
      {id:'2plt', name:'2nd Platoon',     required:8, positions:['PLT CDR','PLT SGT','Squad Ldr 1','Squad Ldr 2','Squad Ldr 3','Corpsman','SAW Gunner','Asst Gunner']},
      {id:'3plt', name:'3rd Platoon',     required:8, positions:['PLT CDR','PLT SGT','Squad Ldr 1','Squad Ldr 2','Squad Ldr 3','Corpsman','SAW Gunner','Asst Gunner']},
      {id:'wpns', name:'Weapons Plt',     required:6, positions:['PLT CDR','PLT SGT','SMAW Tm Ldr','Mortar Sec Ldr','JTAC','Scout Sniper']},
      {id:'log',  name:'Logistics / CSS', required:4, positions:['S4','Motor T Chief','Supply Chief','Comms Chief']},
    ],
    samplePeople: [
      {id:'mc1', name:'Reyes, J.',    rank:'Capt', role:'0302 Infantry Officer',  status:'available',quals:['Rifle Expert','SERE'],         section:'hq',   slot:0},
      {id:'mc2', name:'Nguyen, T.',   rank:'1stLt',role:'0302 Infantry Officer',  status:'available',quals:['Rifle Expert'],                section:'1plt', slot:0},
      {id:'mc3', name:'Jackson, D.',  rank:'GySgt', role:'0369 Inf Unit Ldr',     status:'available',quals:['Scout Sniper','Rifle Expert'], section:'hq',   slot:3},
      {id:'mc4', name:'Torres, A.',   rank:'Sgt',  role:'0311 Rifleman',          status:'available',quals:['Rifle Expert','JTAC'],         section:'1plt', slot:2},
      {id:'mc5', name:'Okafor, C.',   rank:'LCpl', role:'0311 Rifleman',          status:'available',quals:['Rifle Expert'],                section:'2plt', slot:3},
      {id:'mc6', name:'Smith, R.',    rank:'SSgt', role:'0369 Inf Unit Ldr',      status:'tdy',      quals:['Rifle Expert'],                section:'2plt', slot:1},
      {id:'mc7', name:'Davis, M.',    rank:'Sgt',  role:'0341 Mortar Man',        status:'available',quals:[],                             section:'wpns', slot:3},
      {id:'mc8', name:'Kim, E.',      rank:'LCpl', role:'0352 Anti-Armor',        status:'deployed', quals:[],                             section:null,   slot:null},
      {id:'mc9', name:'Brown, P.',    rank:'Capt', role:'0402 Logistics Officer', status:'available',quals:[],                             section:'log',  slot:0},
    ],
  },

  coastguard: {
    id: 'coastguard',
    label: 'USCG',
    fullName: 'Coast Guard',
    unitTerm: 'Station',
    color: '#f59e0b',   // CG orange
    colorRgb: '245,158,11',
    roleLabel: 'Rating / Role',
    rolePlaceholder: 'e.g. BM Boatswain\'s Mate',
    tdyLabel: 'TDY',
    deployedLabel: 'Underway',
    ranks: ['SR','SA','SN','PO3','PO2','PO1','CPO','SCPO','MCPO','MCPOCG','ENS','LTJG','LT','LCDR','CDR','CAPT','RDML'],
    quals: ['Coxswain','OIC Qualified','SAR Certified','ATON','Law Enforcement','Port Security','Rescue Swimmer','Diver','Aviation Survival','JTAC'],
    sections: [
      {id:'ops',    name:'Operations',       required:5, positions:['OIC','AOIC','Operations Supervisor','Coxswain 1','Coxswain 2']},
      {id:'boat',   name:'Boat Crew',        required:6, positions:['Coxswain','Engineer','Crew 1','Crew 2','Crew 3','Rescue Swimmer']},
      {id:'sar',    name:'SAR / Response',   required:4, positions:['SAR Mission Coord','Rescue Swimmer 1','Rescue Swimmer 2','Comms Watch']},
      {id:'me',     name:'Maritime Enf.',    required:4, positions:['LE Supervisor','Boarding Officer 1','Boarding Officer 2','Intel']},
      {id:'aton',   name:'Aids to Nav',      required:3, positions:['ATON OIC','Buoy Deck PO','Electronics Tech']},
      {id:'admin',  name:'Admin / Support',  required:3, positions:['XPO','YN1','HS1']},
    ],
    samplePeople: [
      {id:'cg1', name:'Hansen, J.',  rank:'LCDR',role:'OIC Station Commander',   status:'available',quals:['OIC Qualified','Coxswain'],     section:'ops',  slot:0},
      {id:'cg2', name:'Park, S.',    rank:'LT',  role:'AOIC',                    status:'available',quals:['Coxswain','SAR Certified'],     section:'ops',  slot:1},
      {id:'cg3', name:'Torres, M.',  rank:'CPO', role:'BM Boatswain\'s Mate',    status:'available',quals:['Coxswain','SAR Certified'],     section:'boat', slot:0},
      {id:'cg4', name:'Williams, A.',rank:'PO1', role:'MK Machinery Tech',       status:'available',quals:[],                              section:'boat', slot:1},
      {id:'cg5', name:'Nguyen, T.',  rank:'PO2', role:'RS Rescue Swimmer',       status:'available',quals:['Rescue Swimmer','SAR Certified'],section:'sar', slot:1},
      {id:'cg6', name:'Davis, R.',   rank:'PO1', role:'LE Boarding Officer',     status:'tdy',      quals:['Law Enforcement'],             section:'me',   slot:1},
      {id:'cg7', name:'Kim, C.',     rank:'PO2', role:'ET Electronics Tech',     status:'available',quals:[],                              section:'aton', slot:2},
      {id:'cg8', name:'Brown, L.',   rank:'PO3', role:'BM Boatswain\'s Mate',    status:'available',quals:[],                              section:'boat', slot:2},
      {id:'cg9', name:'Garcia, E.',  rank:'LT',  role:'LE Supervisor',           status:'deployed', quals:['Law Enforcement','Port Security'],section:null, slot:null},
    ],
  },
};

// ══════════════════════════════════════════════
//  PERSISTENCE
// ══════════════════════════════════════════════
const STORAGE_KEY = 'sqdn_manning_v1';

function defaultPeople(k) {
  return BRANCHES[k].samplePeople.map(p => ({...p, quals:[...p.quals]}));
}
function defaultSections(k) {
  return BRANCHES[k].sections.map(s => ({...s, positions:[...s.positions]}));
}

function saveState() {
  try {
    // Snapshot mutable section configs back into a plain object
    const sectionSnap = {};
    Object.keys(BRANCHES).forEach(k => {
      sectionSnap[k] = BRANCHES[k].sections.map(s => ({
        id: s.id, name: s.name, required: s.required, positions: [...s.positions]
      }));
    });
    const payload = {
      currentBranch,
      branchPeople,
      sectionSnap,
      nextId,
      unitName: document.getElementById('unit-name')?.value || '',
    };
    const serialized = JSON.stringify(payload);
    // Warn if approaching 4MB limit
    if (serialized.length > 4_000_000) {
      showToast('Warning: storage near limit — consider exporting a backup');
    }
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch(e) {
    console.warn('Could not save state:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const payload = JSON.parse(raw);

    // Restore branch
    if (payload.currentBranch && BRANCHES[payload.currentBranch]) {
      currentBranch = payload.currentBranch;
    }

    // Restore rosters
    if (payload.branchPeople) {
      Object.keys(BRANCHES).forEach(k => {
        if (payload.branchPeople[k]) {
          branchPeople[k] = payload.branchPeople[k];
        }
      });
    }

    // Restore section mutations (names, slot counts, slot labels)
    if (payload.sectionSnap) {
      Object.keys(BRANCHES).forEach(k => {
        if (payload.sectionSnap[k]) {
          BRANCHES[k].sections = payload.sectionSnap[k];
        }
      });
    }

    if (payload.nextId) nextId = payload.nextId;
    if (payload.unitName) {
      const el = document.getElementById('unit-name');
      if (el) el.value = payload.unitName;
    }
    return true;
  } catch(e) {
    console.warn('Could not load state:', e);
    return false;
  }
}

function clearState() {
  if (!confirm('Reset ALL branches to default rosters? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  // Reset all sections and rosters to defaults
  Object.keys(BRANCHES).forEach(k => {
    branchPeople[k] = defaultPeople(k);
    BRANCHES[k].sections = defaultSections(k);
  });
  nextId = 1000;
  render();
  showToast('Board reset to defaults');
}

// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let currentBranch = 'usaf';
const branchPeople = {};
Object.keys(BRANCHES).forEach(k => {
  branchPeople[k] = defaultPeople(k);
  // Also snapshot sections so they're mutable objects (not references to BRANCHES config)
  BRANCHES[k].sections = defaultSections(k);
});
let nextId = 1000;
let dragId = null, editingId = null;

function branch() { return BRANCHES[currentBranch]; }
function people() { return branchPeople[currentBranch]; }
function setPeople(arr) { branchPeople[currentBranch] = arr; }

// ══════════════════════════════════════════════
//  AVATAR COLORS
// ══════════════════════════════════════════════
const PALETTES = [
  ['#1e3a5f','#60a5fa'],['#1a3a2a','#4ade80'],['#3a1e1e','#f87171'],
  ['#3a2e1a','#fbbf24'],['#2a1a3a','#c084fc'],['#1a2e3a','#38bdf8'],
  ['#3a1a2e','#f472b6'],['#1e2a1a','#86efac'],
];
function avatarColors(name) {
  let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))%PALETTES.length;
  return PALETTES[h];
}
function initials(name) {
  const p=name.split(','); return p.length>1?(p[1].trim()[0]||'')+(p[0].trim()[0]||''):name.slice(0,2).toUpperCase();
}
function statusColor(s) { return s==='deployed'?'var(--red)':s==='tdy'?'var(--amber)':'var(--green)'; }

// ══════════════════════════════════════════════
//  BRANCH SWITCHER
// ══════════════════════════════════════════════
function buildSwitcher() {
  const sw = document.getElementById('branch-switcher');
  sw.innerHTML = Object.values(BRANCHES).map(b =>
    `<button class="branch-btn ${b.id===currentBranch?'active':''}" onclick="switchBranch('${b.id}')">
      <span class="dot"></span>${b.label}
    </button>`
  ).join('');
}

function switchBranch(id) {
  if (id === currentBranch) return;
  currentBranch = id;
  const b = branch();

  // Update accent color CSS vars
  document.documentElement.style.setProperty('--accent', b.color);
  document.documentElement.style.setProperty('--accent-rgb', b.colorRgb);

  // Update header text
  document.getElementById('branch-badge').textContent = b.label;
  document.getElementById('header-title').textContent = `${b.unitTerm} Manning Board`;
  document.getElementById('leg-tdy').textContent = b.tdyLabel;
  document.getElementById('leg-deployed').textContent = b.deployedLabel;
  document.getElementById('f-role-label').textContent = b.roleLabel;
  document.getElementById('f-role').placeholder = b.rolePlaceholder;

  // Rebuild rank dropdown
  const rs = document.getElementById('f-rank');
  rs.innerHTML = b.ranks.map(r=>`<option>${r}</option>`).join('');

  buildSwitcher();

  // Fade transition
  const grids = [document.getElementById('sections-grid'), document.getElementById('metrics'), document.querySelector('.pool-section')];
  grids.forEach(el => el.classList.add('fading'));
  setTimeout(() => { render(); grids.forEach(el => el.classList.remove('fading')); }, 180);

  saveState();
  showToast(`Switched to ${b.fullName} · ${b.unitTerm} view`);
}

// ══════════════════════════════════════════════
//  METRICS
// ══════════════════════════════════════════════
function calcMetrics() {
  const ps = people().filter(p => !whatIfOut.has(p.id));
  const total = people().length;
  const deployed = ps.filter(p=>p.status==='deployed').length;
  const tdy = ps.filter(p=>p.status==='tdy').length;
  const totalReq = branch().sections.reduce((a,s)=>a+s.required,0);
  const filled = ps.filter(p=>p.section).length;
  const readiness = totalReq > 0 ? Math.round((filled/totalReq)*100) : 0;
  return {total,deployed,tdy,totalReq,filled,readiness};
}

// ══════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'});
}
function derosClass(d) {
  if (!d) return '';
  const days = (new Date(d+'T00:00:00') - new Date()) / 86400000;
  if (days < 60) return 'deros-urgent';
  if (days < 180) return 'deros-soon';
  return '';
}
function buildPersonCard(p) {
  const [bg,fg] = avatarColors(p.name);
  const tags = p.quals.slice(0,3).map(q=>`<span class="tag">${q}</span>`).join('');
  const hasDates = p.dutyStart || p.arrived || p.deros;
  const dc = derosClass(p.deros);
  const datesHtml = hasDates ? `<div class="card-dates">
    <div class="card-date">DUTY START<span>${fmtDate(p.dutyStart)}</span></div>
    <div class="card-date">ARRIVED<span>${fmtDate(p.arrived)}</span></div>
    <div class="card-date ${dc}">DEROS<span>${fmtDate(p.deros)}</span></div>
  </div>` : '';
  const notesHtml = p.notes ? `<div class="card-notes">${p.notes.replace(/</g,'&lt;')}</div>` : '';
  const wiClass = whatIfMode && whatIfOut.has(p.id) ? ' whatif-out' : '';
  return `<div class="person-card status-${p.status}${wiClass}" id="card-${p.id}" draggable="${whatIfMode?'false':'true'}" data-id="${p.id}" title="Double-click to edit">
    <div class="card-top">
      <div class="avatar" style="background:${bg};color:${fg}">${initials(p.name)}</div>
      <div class="card-info">
        <div class="card-name">${p.rank} ${p.name}</div>
        <div class="card-role">${p.role}</div>
      </div>
      <div class="status-pip" style="background:${statusColor(p.status)}"></div>
    </div>
    ${tags?`<div class="card-tags">${tags}</div>`:''}
    ${datesHtml}
    ${notesHtml}
  </div>`;
}

function render() {
  renderAlerts();
  renderMetrics();
  renderSections();
  renderPool();
  document.getElementById('timestamp').textContent =
    'Updated ' + new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  applySearch();
  if (document.getElementById('deros-panel').classList.contains('open')) renderDerosPanel();
}

function renderAlerts() {
  const b = branch(), ps = people();
  const alerts = [];
  b.sections.forEach(sec => {
    const count = ps.filter(p=>p.section===sec.id).length;
    const pct = count/sec.required;
    if (pct < 0.5) alerts.push({level:'crit', msg:`${sec.name} critically undermanned — ${count}/${sec.required} filled`});
    else if (pct < 0.75) alerts.push({level:'warn', msg:`${sec.name} below 75% manning — ${count}/${sec.required} filled`});
  });
  const depAssigned = ps.filter(p=>p.status==='deployed'&&p.section);
  if (depAssigned.length) alerts.push({level:'warn', msg:`${depAssigned.length} ${b.deployedLabel.toLowerCase()} personnel still holding assigned slots`});
  const wi = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  document.getElementById('alerts').innerHTML = alerts.slice(0,3)
    .map(a=>`<div class="alert alert-${a.level}">${wi}${a.msg}</div>`).join('');
}

function renderMetrics() {
  const m = calcMetrics(), b = branch();
  const fillColor = m.readiness>=80?'var(--green)':m.readiness>=60?'var(--amber)':'var(--red)';
  document.getElementById('metrics').innerHTML = `
    <div class="metric-card">
      <div class="metric-label">Total personnel</div>
      <div class="metric-value">${m.total}</div>
      <div class="metric-sub">${people().filter(p=>p.section).length} assigned</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Readiness</div>
      <div class="metric-value" style="color:${fillColor}">${m.readiness}%</div>
      <div class="metric-bar"><div class="metric-fill" style="width:${Math.min(m.readiness,100)}%;background:${fillColor}"></div></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${b.deployedLabel}</div>
      <div class="metric-value" style="color:var(--red)">${m.deployed}</div>
      <div class="metric-sub">${m.tdy} on ${b.tdyLabel}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Required fill</div>
      <div class="metric-value">${m.filled} <span style="font-size:15px;color:var(--text3)">/ ${m.totalReq}</span></div>
      <div class="metric-sub">${m.totalReq - m.filled} positions unfilled</div>
    </div>`;
}

function renderSections() {
  const ps = people();
  document.getElementById('sections-grid').innerHTML = branch().sections.map(sec => {
    const inSec = ps.filter(p=>p.section===sec.id);
    const avail = inSec.filter(p=>p.status==='available').length;
    const pct = Math.round((inSec.length/sec.required)*100);
    const bc = pct>=80?'badge-ok':pct>=50?'badge-warn':'badge-crit';
    const bt = pct>=80?'Manned':pct>=50?'Undermanned':'Critical';
    const slots = sec.positions.map((pos,i) => {
      const occ = inSec.find(p=>p.slot===i);
      return `<div class="slot" data-section="${sec.id}" data-slot="${i}">
        <div class="slot-label">${pos}</div>
        ${occ ? buildPersonCard(occ) : '<div class="slot-empty">—</div>'}
      </div>`;
    }).join('');
    return `<div class="section-card">
      <div class="section-header">
        <div class="section-name" data-rename="${sec.id}" title="Click to rename" style="cursor:pointer;border-bottom:1px dashed var(--border2)">${sec.name}</div>
        <div style="display:flex;align-items:center;gap:5px">
          <span class="badge ${bc}">${bt}</span>
          <div class="section-controls">
            <button class="sec-ctrl-btn" onclick="changeSlots('${sec.id}',-1)" title="Remove last slot">−</button>
            <button class="sec-ctrl-btn" onclick="changeSlots('${sec.id}',1)" title="Add slot">+</button>
          </div>
          <button class="del-section-btn" onclick="deleteSection('${sec.id}')" title="Delete section">×</button>
        </div>
      </div>
      <div class="section-meta" style="display:flex;align-items:center;gap:8px">
        <span>${inSec.length} filled · ${avail} available · ${sec.positions.length} slots</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text3)">
          Auth:
          <input type="number" min="1" max="999" value="${sec.required}"
            style="width:40px;background:var(--surface2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono);font-size:10px;padding:1px 4px;outline:none;text-align:center"
            title="Authorized strength — drives readiness %"
            onchange="setRequired('${sec.id}',this.value)"
            onclick="event.stopPropagation()"
          />
        </span>
      </div>
      ${slots}
    </div>`;
  }).join('');
}

function renderPool() {
  const rankOrder = branch().ranks;
  let pool = people().filter(p=>!p.section);
  const sortBy = document.getElementById('pool-sort')?.value || 'name';
  pool = pool.slice().sort((a,b) => {
    if (sortBy === 'rank') {
      const ai = rankOrder.indexOf(a.rank), bi = rankOrder.indexOf(b.rank);
      return (bi===-1?999:bi) - (ai===-1?999:ai); // higher rank first
    }
    if (sortBy === 'status') {
      const order = {deployed:0,tdy:1,available:2};
      return (order[a.status]??3) - (order[b.status]??3);
    }
    if (sortBy === 'role') return a.role.localeCompare(b.role);
    return a.name.localeCompare(b.name);
  });
  const badge = document.getElementById('pool-badge');
  badge.textContent = `${pool.length} unassigned`;
  badge.className = 'badge ' + (pool.length>0?'badge-warn':'badge-ok');
  document.getElementById('pool-drop').innerHTML = pool.length===0
    ? '<div class="pool-empty">// all personnel assigned</div>'
    : pool.map(p=>buildPersonCard(p)).join('');
}

// ══════════════════════════════════════════════
//  DRAG & DROP (delegated — survives DOM re-renders)
// ══════════════════════════════════════════════
function clearDragState() {
  dragId = null;
  document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
  document.querySelectorAll('.dragging').forEach(el=>el.classList.remove('dragging'));
}

document.addEventListener('dragstart', ev => {
  const card = ev.target.closest('[data-id]');
  if (!card) return;
  dragId = card.dataset.id;
  ev.dataTransfer.effectAllowed = 'move';
  ev.dataTransfer.setData('text/plain', dragId);
  requestAnimationFrame(() => card.classList.add('dragging'));
});

document.addEventListener('dragend', () => clearDragState());

document.addEventListener('dragover', ev => {
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  if (slot || pool) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    const target = slot || pool;
    if (!target.classList.contains('drag-over')) {
      document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
      target.classList.add('drag-over');
    }
  }
});

document.addEventListener('dragleave', ev => {
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  const target = slot || pool;
  if (target && !target.contains(ev.relatedTarget)) target.classList.remove('drag-over');
});

document.addEventListener('drop', ev => {
  ev.preventDefault();
  document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
  if (!dragId) return;
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  if (slot) {
    const secId = slot.dataset.section;
    const slotIdx = parseInt(slot.dataset.slot, 10);
    const ps = people();
    const p = ps.find(x=>x.id===dragId); if (!p) { clearDragState(); return; }
    const occ = ps.find(x=>x.section===secId&&x.slot===slotIdx);
    takeSnapshot();
    if (occ && occ.id !== dragId) { occ.section = p.section; occ.slot = p.slot; }
    p.section = secId; p.slot = slotIdx;
    clearDragState(); render(); saveState();
  } else if (pool) {
    const p = people().find(x=>x.id===dragId);
    if (p) { takeSnapshot(); p.section = null; p.slot = null; }
    clearDragState(); render(); saveState();
  }
});

// ══════════════════════════════════════════════
//  SECTION SLOT COUNT & RENAME
// ══════════════════════════════════════════════
function setRequired(secId, val) {
  const sec = branch().sections.find(s=>s.id===secId);
  if (!sec) return;
  const n = parseInt(val, 10);
  if (!isNaN(n) && n > 0) sec.required = n;
  render(); saveState();
}

function changeSlots(secId, delta) {
  const sec = branch().sections.find(s=>s.id===secId);
  if (!sec) return;
  const newCount = sec.positions.length + delta;
  if (newCount < 1) return;
  if (delta > 0) {
    sec.positions.push(`Position ${newCount}`);
    sec.required = Math.max(sec.required, newCount);
  } else {
    // Unassign anyone in the last slot
    const ps = people();
    const lastIdx = sec.positions.length - 1;
    const occupant = ps.find(p=>p.section===secId&&p.slot===lastIdx);
    if (occupant) { occupant.section = null; occupant.slot = null; }
    sec.positions.pop();
    sec.required = Math.min(sec.required, sec.positions.length);
  }
  render(); saveState();
}

// Inline rename — delegated click on [data-rename]
document.addEventListener('click', ev => {
  const nameEl = ev.target.closest('[data-rename]');
  if (!nameEl || nameEl.querySelector('input')) return;
  const secId = nameEl.dataset.rename;
  const sec = branch().sections.find(s=>s.id===secId);
  if (!sec) return;
  const inp = document.createElement('input');
  inp.className = 'section-name-edit';
  inp.value = sec.name;
  nameEl.textContent = '';
  nameEl.style.borderBottom = 'none';
  nameEl.appendChild(inp);
  inp.focus(); inp.select();
  function commit() {
    const val = inp.value.trim();
    if (val) sec.name = val;
    render(); saveState();
  }
  inp.addEventListener('blur', commit);
  inp.addEventListener('keydown', e => { if(e.key==='Enter') inp.blur(); if(e.key==='Escape'){inp.value=sec.name;inp.blur();} });
});

function downloadCSVTemplate() {
  const cols = 'name,rank,role,status,quals,notes,dutyStart,arrived,deros';
  const example = `Smith, John,${branch().ranks[5]||'SSgt'},${branch().rolePlaceholder||'Duty Title'},available,Qual1|Qual2,Notes here,2023-06-01,2023-06-15,2025-06-01`;
  const csv = `${cols}\n${example}\n`;
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `manning-template-${branch().id}.csv`;
  a.click();
  showToast('Template downloaded');
}

// ══════════════════════════════════════════════
//  CSV IMPORT
// ══════════════════════════════════════════════
// Expected columns (case-insensitive, any order):
// name, rank, role, status, section, quals, notes, dutyStart, arrived, deros
function importCSV(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const text = e.target.result;
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) { showToast('CSV must have a header row + data rows'); return; }

      // Parse header
      const sep = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/[^a-z]/g,''));

      const idx = k => headers.indexOf(k);
      const get = (row, k) => { const i = idx(k); return i >= 0 ? (row[i]||'').trim() : ''; };

      let added = 0, skipped = 0;
      lines.slice(1).forEach(line => {
        if (!line.trim()) return;
        const row = line.split(sep).map(c => c.trim().replace(/^"|"$/g,''));
        const name = get(row,'name');
        if (!name) { skipped++; return; }
        const rank = get(row,'rank') || branch().ranks[0];
        const role = get(row,'role') || get(row,'afsc') || get(row,'mos') || '';
        const rawStatus = (get(row,'status')||'available').toLowerCase();
        const status = ['available','tdy','deployed'].includes(rawStatus) ? rawStatus : 'available';
        const rawQuals = get(row,'quals') || get(row,'qualifications') || '';
        const quals = rawQuals ? rawQuals.split(/[;|]/).map(q=>q.trim()).filter(Boolean) : [];
        const notes = get(row,'notes') || get(row,'remarks') || null;
        const dutyStart = get(row,'dutystart') || get(row,'duty') || null;
        const arrived = get(row,'arrived') || get(row,'datearrived') || null;
        const deros = get(row,'deros') || null;
        branchPeople[currentBranch].push({
          id:'p'+(nextId++), name, rank, role, status, quals,
          notes:notes||null, dutyStart:dutyStart||null, arrived:arrived||null, deros:deros||null,
          section:null, slot:null
        });
        added++;
      });

      input.value = '';
      render(); saveState();
      showToast(`Imported ${added} personnel${skipped ? ` · ${skipped} rows skipped` : ''}`);
    } catch(err) {
      console.error(err);
      showToast('Import failed — check CSV format');
      input.value = '';
    }
  };
  reader.readAsText(file);
}

// ══════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════
let searchQuery = '';
function onSearch(val) {
  searchQuery = val.trim().toLowerCase();
  document.getElementById('search-clear').classList.toggle('vis', !!searchQuery);
  applySearch();
}
function clearSearch() {
  document.getElementById('search-input').value = '';
  onSearch('');
}
function applySearch() {
  if (!searchQuery) {
    document.querySelectorAll('.person-card').forEach(el => el.classList.remove('dimmed'));
    return;
  }
  document.querySelectorAll('.person-card[data-id]').forEach(el => {
    const pid = el.dataset.id;
    const p = people().find(x=>x.id===pid);
    if (!p) return;
    const hay = `${p.name} ${p.rank} ${p.role} ${p.quals.join(' ')} ${p.notes||''}`.toLowerCase();
    el.classList.toggle('dimmed', !hay.includes(searchQuery));
  });
}

// ══════════════════════════════════════════════
//  WHAT-IF MODE
// ══════════════════════════════════════════════
let whatIfMode = false;
const whatIfOut = new Set(); // person IDs toggled out

function toggleWhatIf() {
  whatIfMode = !whatIfMode;
  const btn = document.getElementById('whatif-btn');
  btn.classList.toggle('on', whatIfMode);
  document.getElementById('whatif-banner').classList.toggle('on', whatIfMode);
  if (!whatIfMode) { whatIfOut.clear(); }
  render();
}
function clearWhatIf() { whatIfOut.clear(); render(); }

// delegated click for what-if toggling — single click only, not dblclick
let lastClickTime = 0, lastClickId = null;
document.addEventListener('click', ev => {
  if (!whatIfMode) return;
  const card = ev.target.closest('[data-id]');
  if (!card) return;
  const pid = card.dataset.id;
  const now = Date.now();
  // If two clicks on same card within 300ms it's a dblclick — let edit modal fire instead
  if (pid === lastClickId && now - lastClickTime < 300) {
    lastClickTime = 0; lastClickId = null;
    return;
  }
  lastClickTime = now; lastClickId = pid;
  ev.stopImmediatePropagation();
  whatIfOut.has(pid) ? whatIfOut.delete(pid) : whatIfOut.add(pid);
  render();
}, true);

// ══════════════════════════════════════════════
//  DEROS PANEL
// ══════════════════════════════════════════════
function toggleDerosPanel() {
  const panel = document.getElementById('deros-panel');
  const isOpen = panel.classList.toggle('open');
  if (isOpen) renderDerosPanel();
}
function renderDerosPanel() {
  const now = new Date();
  const ps = people()
    .filter(p=>p.deros)
    .map(p => {
      const days = Math.round((new Date(p.deros+'T00:00:00') - now) / 86400000);
      return {...p, days};
    })
    .filter(p=>p.days < 365)
    .sort((a,b)=>a.days-b.days);

  const sec = id => branch().sections.find(s=>s.id===id);
  document.getElementById('deros-list').innerHTML = ps.length === 0
    ? '<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:8px">// no rotations within 12 months</div>'
    : ps.map(p => {
        const cls = p.days < 60 ? 'urgent' : p.days < 180 ? 'soon' : '';
        const secName = p.section ? (sec(p.section)?.name || '—') : 'Unassigned';
        const daysLabel = p.days < 0 ? `${Math.abs(p.days)}d overdue` : `${p.days}d remaining`;
        const col = p.days < 60 ? 'var(--red)' : p.days < 180 ? 'var(--amber)' : 'var(--text2)';
        return `<div class="deros-row ${cls}" ondblclick="openEditModal('${p.id}')">
          <div class="deros-name">${p.rank} ${p.name}</div>
          <div class="deros-meta">${secName} · ${p.role}</div>
          <div class="deros-days" style="color:${col}">${daysLabel}</div>
        </div>`;
      }).join('');
}

// ══════════════════════════════════════════════
//  ADD / DELETE SECTION
// ══════════════════════════════════════════════
function addSection() {
  const b = branch();
  const newId = 'sec_' + Date.now();
  b.sections.push({id:newId, name:'New Section', required:4, positions:['Position 1','Position 2','Position 3','Position 4']});
  render(); saveState();
  // Trigger rename immediately
  setTimeout(() => {
    const el = document.querySelector(`[data-rename="${newId}"]`);
    if (el) el.click();
  }, 50);
}
function deleteSection(secId) {
  const b = branch();
  const sec = b.sections.find(s=>s.id===secId);
  if (!sec) return;
  if (!confirm(`Delete section "${sec.name}"? Assigned personnel will move to staging.`)) return;
  // Unassign everyone in this section
  people().forEach(p => { if(p.section===secId){p.section=null;p.slot=null;} });
  b.sections = b.sections.filter(s=>s.id!==secId);
  render(); saveState();
}

// ══════════════════════════════════════════════
//  SLOT LABEL RENAME (delegated)
// ══════════════════════════════════════════════
document.addEventListener('click', ev => {
  const lbl = ev.target.closest('.slot-label');
  if (!lbl || lbl.querySelector('input')) return;
  // Don't fire inside a card
  if (ev.target.closest('.person-card')) return;
  const slot = lbl.closest('.slot');
  if (!slot) return;
  const secId = slot.dataset.section;
  const slotIdx = parseInt(slot.dataset.slot, 10);
  const sec = branch().sections.find(s=>s.id===secId);
  if (!sec) return;
  const inp = document.createElement('input');
  inp.className = 'slot-label-input';
  inp.value = sec.positions[slotIdx];
  lbl.textContent = '';
  lbl.appendChild(inp);
  inp.focus(); inp.select();
  function commit() {
    const val = inp.value.trim();
    if (val) sec.positions[slotIdx] = val;
    render(); saveState();
  }
  inp.addEventListener('blur', commit);
  inp.addEventListener('keydown', e => { if(e.key==='Enter') inp.blur(); if(e.key==='Escape'){inp.value=sec.positions[slotIdx];inp.blur();} });
  inp.addEventListener('click', e => e.stopPropagation());
});

// ══════════════════════════════════════════════
//  UNDO STACK (20 levels)
// ══════════════════════════════════════════════
const undoStack = [];
const UNDO_LIMIT = 20;
function takeSnapshot() {
  try {
    const sectionSnap = {};
    Object.keys(BRANCHES).forEach(k => {
      sectionSnap[k] = BRANCHES[k].sections.map(s=>({...s,positions:[...s.positions]}));
    });
    const snap = JSON.stringify({branchPeople: JSON.parse(JSON.stringify(branchPeople)), sectionSnap});
    undoStack.push(snap);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  } catch(e) {}
}
function undo() {
  if (!undoStack.length) { showToast('Nothing to undo'); return; }
  try {
    const snap = JSON.parse(undoStack.pop());
    Object.keys(BRANCHES).forEach(k => {
      if (snap.branchPeople[k]) branchPeople[k] = snap.branchPeople[k];
      if (snap.sectionSnap[k]) BRANCHES[k].sections = snap.sectionSnap[k];
    });
    render(); saveState();
    showToast(`Undo · ${undoStack.length} step${undoStack.length!==1?'s':''} remaining`);
  } catch(e) { showToast('Undo failed'); }
}
document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key==='z' && !e.shiftKey) { e.preventDefault(); undo(); }
});

// ══════════════════════════════════════════════
//  MODAL
// ══════════════════════════════════════════════
function populateRankSelect() {
  const sel = document.getElementById('f-rank');
  sel.innerHTML = branch().ranks.map(r=>`<option>${r}</option>`).join('');
}
function buildQualGrid(selected) {
  document.getElementById('qual-grid').innerHTML = branch().quals.map(q =>
    `<label class="qual-label"><input type="checkbox" value="${q}" ${selected.includes(q)?'checked':''}> ${q}</label>`
  ).join('');
}
function openAddModal() {
  editingId = null;
  populateRankSelect();
  document.getElementById('modal-title').textContent = 'Add personnel';
  document.getElementById('f-name').value = '';
  document.getElementById('f-rank').value = branch().ranks[5] || branch().ranks[0];
  document.getElementById('f-role').value = '';
  document.getElementById('f-role').placeholder = branch().rolePlaceholder;
  document.getElementById('f-status').value = 'available';
  document.getElementById('f-duty-start').value = '';
  document.getElementById('f-arrived').value = '';
  document.getElementById('f-deros').value = '';
  document.getElementById('f-notes').value = '';
  document.getElementById('btn-delete').style.display = 'none';
  buildQualGrid([]);
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('f-name').focus(), 50);
}
function openEditModal(pid) {
  const p = people().find(x=>x.id===pid); if (!p) return;
  editingId = pid;
  populateRankSelect();
  document.getElementById('modal-title').textContent = 'Edit personnel';
  document.getElementById('f-name').value = p.name;
  document.getElementById('f-rank').value = p.rank;
  document.getElementById('f-role').value = p.role;
  document.getElementById('f-role').placeholder = branch().rolePlaceholder;
  document.getElementById('f-status').value = p.status;
  document.getElementById('f-duty-start').value = p.dutyStart || '';
  document.getElementById('f-arrived').value = p.arrived || '';
  document.getElementById('f-deros').value = p.deros || '';
  document.getElementById('f-notes').value = p.notes || '';
  document.getElementById('btn-delete').style.display = 'block';
  buildQualGrid(p.quals);
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); editingId = null; }
function savePerson() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { document.getElementById('f-name').focus(); return; }
  const rank = document.getElementById('f-rank').value;
  const role = document.getElementById('f-role').value.trim();
  const status = document.getElementById('f-status').value;
  const quals = [...document.querySelectorAll('#qual-grid input:checked')].map(el=>el.value);
  const dutyStart = document.getElementById('f-duty-start').value || null;
  const arrived = document.getElementById('f-arrived').value || null;
  const deros = document.getElementById('f-deros').value || null;
  const notes = document.getElementById('f-notes').value.trim() || null;

  // Date validation
  if (dutyStart && arrived && arrived < dutyStart) {
    showToast('Date Arrived cannot be before Duty Start'); return;
  }
  if (deros && arrived && deros < arrived) {
    showToast('DEROS cannot be before Date Arrived'); return;
  }

  // Duplicate name check
  const dupName = people().find(p => p.name.toLowerCase()===name.toLowerCase() && p.id!==editingId);
  if (dupName && !confirm(`"${name}" already exists (${dupName.rank}). Add anyway?`)) return;

  takeSnapshot();
  if (editingId) {
    const p = people().find(x=>x.id===editingId);
    if (p) Object.assign(p, {name,rank,role,status,quals,dutyStart,arrived,deros,notes});
  } else {
    branchPeople[currentBranch].push({id:'p'+(nextId++),name,rank,role,status,quals,dutyStart,arrived,deros,notes,section:null,slot:null});
  }
  closeModal(); render(); saveState();
  showToast(editingId?'Personnel updated':'Personnel added');
}
function deletePerson() {
  if (!editingId) return;
  takeSnapshot();
  setPeople(people().filter(p=>p.id!==editingId));
  closeModal(); render(); saveState();
  showToast('Personnel removed');
}

// ══════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(()=>t.classList.remove('show'), 3000);
}

// ══════════════════════════════════════════════
//  PDF EXPORT
// ══════════════════════════════════════════════
function exportPDF() {
  if (!window.jspdf) { showToast('PDF library loading, try again'); return; }
  const btn = document.getElementById('export-btn');
  btn.querySelector('span').textContent = 'Generating…';
  btn.disabled = true;
  setTimeout(() => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
      const W=297, H=210;
      const b = branch(), ps = people(), m = calcMetrics();
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
      const timeStr = now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

      // parse branch accent color to RGB for jsPDF
      function hexToRgb(hex) {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), bl = parseInt(hex.slice(5,7),16);
        return [r,g,bl];
      }
      const [ar,ag,abl] = hexToRgb(b.color);

      // Header bar
      doc.setFillColor(13,15,18); doc.rect(0,0,W,20,'F');
      doc.setFillColor(ar,ag,abl); doc.rect(0,18,W,2,'F');
      doc.setTextColor(232,234,240); doc.setFontSize(13); doc.setFont('helvetica','bold');
      doc.text(`${b.fullName.toUpperCase()} — ${b.unitTerm.toUpperCase()} MANNING BOARD`, 14, 12);
      doc.setFontSize(7); doc.setFont('courier','normal'); doc.setTextColor(138,143,168);
      doc.text(`Generated: ${dateStr} at ${timeStr}`, W-14, 9, {align:'right'});
      doc.text('UNCLASSIFIED // FOR OFFICIAL USE ONLY', W-14, 14, {align:'right'});

      // Metric boxes
      const rColor = m.readiness>=80?[34,197,94]:m.readiness>=60?[245,158,11]:[239,68,68];
      const mboxes = [
        {label:'TOTAL PERSONNEL', val:String(m.total), sub:`${ps.filter(p=>p.section).length} assigned`},
        {label:'OVERALL READINESS', val:m.readiness+'%', sub:`${m.filled}/${m.totalReq} slots`, color:rColor},
        {label:b.deployedLabel.toUpperCase(), val:String(m.deployed), sub:`${m.tdy} on ${b.tdyLabel}`, color:[239,68,68]},
        {label:'UNFILLED', val:String(m.totalReq-m.filled), sub:'positions open', color:(m.totalReq-m.filled)>0?[239,68,68]:[34,197,94]},
      ];
      const bw=62,bh=24,bx=14,by=25,gap=5;
      mboxes.forEach((box,i) => {
        const x=bx+i*(bw+gap);
        doc.setFillColor(28,32,48); doc.roundedRect(x,by,bw,bh,2,2,'F');
        doc.setFontSize(6); doc.setFont('courier','bold'); doc.setTextColor(85,90,114);
        doc.text(box.label, x+5, by+7);
        const [r,g,bl]=box.color||[232,234,240];
        doc.setTextColor(r,g,bl); doc.setFontSize(18); doc.setFont('helvetica','bold');
        doc.text(box.val, x+5, by+18);
        doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(85,90,114);
        doc.text(box.sub, x+5, by+23);
      });

      // Section table
      let ty=57;
      doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(232,234,240);
      doc.text('Section Manning Summary', 14, ty-2);
      const sCols=['Section','Required','Filled','Available',b.tdyLabel,'Deployed','Status','Fill %'];
      const sW=[40,22,18,22,18,22,30,22];
      const rh=7;
      doc.setFillColor(28,32,48); doc.rect(14,ty,W-28,rh,'F');
      doc.setTextColor(138,143,168); doc.setFontSize(6.5); doc.setFont('courier','bold');
      let cx=14; sCols.forEach((c,i)=>{doc.text(c,cx+2,ty+4.8);cx+=sW[i];});
      b.sections.forEach((sec,si) => {
        const inSec=ps.filter(p=>p.section===sec.id);
        const avail=inSec.filter(p=>p.status==='available').length;
        const tdy=inSec.filter(p=>p.status==='tdy').length;
        const dep=inSec.filter(p=>p.status==='deployed').length;
        const pct=Math.round((inSec.length/sec.required)*100);
        const ry=ty+rh+(si*rh);
        doc.setFillColor(si%2===0?20:24,si%2===0?23:27,si%2===0?35:42);
        doc.rect(14,ry,W-28,rh,'F');
        const st=pct>=80?'Manned':pct>=50?'Undermanned':'Critical';
        const sc=pct>=80?[34,197,94]:pct>=50?[245,158,11]:[239,68,68];
        const row=[sec.name,sec.required,inSec.length,avail,tdy,dep,st,pct+'%'];
        cx=14;
        row.forEach((v,ci)=>{
          doc.setTextColor(ci===6?sc[0]:200,ci===6?sc[1]:200,ci===6?sc[2]:200);
          doc.setFontSize(6.5); doc.setFont('helvetica',ci===0?'bold':'normal');
          doc.text(String(v),cx+2,ry+4.8); cx+=sW[ci];
        });
        doc.setDrawColor(30,35,50); doc.setLineWidth(0.2);
        doc.line(14,ry+rh,W-14,ry+rh);
      });

      // Personnel roster — multi-page
      const rosterY=ty+rh*(b.sections.length+1)+8;
      doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(232,234,240);
      doc.text('Full Personnel Roster', 14, rosterY-2);
      doc.setDrawColor(ar,ag,abl); doc.setLineWidth(0.5);
      doc.line(14,rosterY,W-14,rosterY);
      const rCols=['Name','Rank',b.roleLabel,'Section','Position','Status','Duty Start','DEROS','Notes'];
      const rW=[30,13,36,24,28,18,20,20,74];
      const rY=rosterY+3;
      const rowH=6.5;
      const pageBottom=H-12;

      function drawRosterHeader(yPos) {
        doc.setFillColor(28,32,48); doc.rect(14,yPos,W-28,7,'F');
        doc.setTextColor(138,143,168); doc.setFontSize(6.5); doc.setFont('courier','bold');
        let cx=14; rCols.forEach((c,i)=>{doc.text(c,cx+2,yPos+4.8);cx+=rW[i];});
      }
      drawRosterHeader(rY);
      let curY = rY+7;
      let pageNum = 1;

      ps.forEach((p,pi) => {
        // New page if needed
        if (curY+rowH > pageBottom) {
          doc.addPage();
          pageNum++;
          // Page header
          doc.setFillColor(13,15,18); doc.rect(0,0,W,14,'F');
          doc.setFillColor(ar,ag,abl); doc.rect(0,13,W,1,'F');
          doc.setTextColor(232,234,240); doc.setFontSize(9); doc.setFont('helvetica','bold');
          doc.text(`${b.fullName.toUpperCase()} — MANNING BOARD (cont.)`, 14, 9);
          doc.setFontSize(7); doc.setFont('courier','normal'); doc.setTextColor(138,143,168);
          doc.text(`Page ${pageNum}`, W-14, 9, {align:'right'});
          curY = 18;
          drawRosterHeader(curY);
          curY += 7;
        }
        const sec=b.sections.find(s=>s.id===p.section);
        const slotName=sec&&p.slot!=null?sec.positions[p.slot]:'—';
        doc.setFillColor(pi%2===0?20:24,pi%2===0?23:27,pi%2===0?35:42);
        doc.rect(14,curY,W-28,rowH,'F');
        const sc=p.status==='deployed'?[239,68,68]:p.status==='tdy'?[245,158,11]:[200,200,200];
        const fmt=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'}):'—';
        const row=[p.name,p.rank,p.role,sec?sec.name:'Unassigned',slotName,p.status.toUpperCase(),fmt(p.dutyStart),fmt(p.deros),(p.notes||'—')];
        let cx=14;
        row.forEach((v,ci)=>{
          doc.setTextColor(ci===5?sc[0]:180,ci===5?sc[1]:180,ci===5?sc[2]:180);
          doc.setFontSize(6); doc.setFont('helvetica',ci===0?'bold':'normal');
          let tv=String(v); const maxW=rW[ci]-3;
          while(doc.getTextWidth(tv)>maxW&&tv.length>3) tv=tv.slice(0,-2)+'…';
          doc.text(tv,cx+2,curY+4.4); cx+=rW[ci];
        });
        doc.setDrawColor(28,32,48); doc.setLineWidth(0.2);
        doc.line(14,curY+rowH,W-14,curY+rowH);
        curY += rowH;
      });

      // Footer on all pages
      const totalPages = doc.getNumberOfPages();
      for (let pg=1; pg<=totalPages; pg++) {
        doc.setPage(pg);
        doc.setFillColor(13,15,18); doc.rect(0,H-9,W,9,'F');
        doc.setTextColor(85,90,114); doc.setFontSize(6.5); doc.setFont('courier','normal');
        doc.text('UNCLASSIFIED // FOR OFFICIAL USE ONLY',W/2,H-3.5,{align:'center'});
        doc.text(`Page ${pg} of ${totalPages}`,W-14,H-3.5,{align:'right'});
        if (pg===1) {
          const unitName = document.getElementById('unit-name')?.value;
          if (unitName) doc.text(unitName, 14, H-3.5);
        }
      }

      doc.save(`manning-board-${b.id}-${now.toISOString().slice(0,10)}.pdf`);
      showToast('PDF exported successfully');
    } catch(e) {
      console.error(e); showToast('Export failed — check console');
    }
    btn.querySelector('span').textContent = 'Export PDF';
    btn.disabled = false;
  }, 100);
}

// ══════════════════════════════════════════════
//  DELEGATED EVENTS
// ══════════════════════════════════════════════
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('dblclick', e => {
  const card = e.target.closest('[data-id]');
  if (card) openEditModal(card.dataset.id);
});

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
const restored = loadState();

// Apply branch theme (accent color + header text)
const _b = branch();
document.documentElement.style.setProperty('--accent', _b.color);
document.documentElement.style.setProperty('--accent-rgb', _b.colorRgb);
document.getElementById('branch-badge').textContent = _b.label;
document.getElementById('header-title').textContent = `${_b.unitTerm} Manning Board`;
document.getElementById('leg-tdy').textContent = _b.tdyLabel;
document.getElementById('leg-deployed').textContent = _b.deployedLabel;
document.getElementById('f-role-label').textContent = _b.roleLabel;
document.getElementById('f-role').placeholder = _b.rolePlaceholder;

buildSwitcher();
populateRankSelect();
render();

if (restored) showToast('Board restored from last session');