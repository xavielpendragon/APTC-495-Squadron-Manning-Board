// ══════════════════════════════════════════════════════════════════════════
//  config.js
//  Contains global application settings, branch definitions, and sample data.
// ══════════════════════════════════════════════════════════════════════════

export const PALETTES = [
  ['#3b82f6', '#ffffff'], ['#ef4444', '#ffffff'], ['#22c55e', '#ffffff'],
  ['#f59e0b', '#ffffff'], ['#a855f7', '#ffffff'], ['#ec4899', '#ffffff'],
  ['#14b8a6', '#ffffff'], ['#f97316', '#ffffff']
];

export const BRANCHES = {
  usaf: {
    id: 'usaf',
    label: 'USAF',
    fullName: 'United States Air Force',
    unitTerm: 'Squadron',
    color: '#3b82f6',
    colorRgb: '59, 130, 246',
    tdyLabel: 'TDY',
    deployedLabel: 'Deployed',
    roleLabel: 'AFSC / Duty Title',
    rolePlaceholder: 'e.g., 2W051 / Munitions Systems',
    ranks: [
      'AB','Amn','A1C','SrA','SSgt','TSgt','MSgt','SMSgt','CMSgt',
      'CCC','2d Lt','1st Lt','Capt','Maj','Lt Col','Col'
    ],
    quals: [
      '7-lvl', '5-lvl', 'Flight Lead', 'Task Certified', 'Stan/Eval', 
      'IP', 'Evaluator', 'CDDAR', 'MX Controller', 'Crew Chief',
      'PRP Certified', 'Nuclear Certified', 'Vault Certified', 'NARS Certified'
    ],
    sections: [
      { id: 'hq', name: 'Command & Staff', required: 3, positions: ['Commander', 'MX DO', 'SEL'] },
      { id: 'mat', name: 'Materiel Flight', required: 4, positions: ['Flight CC', 'Flight Chief', 'Section Chief', 'Open Slot'] },
      { id: 'arm', name: 'Armament Flight', required: 4, positions: ['Flight CC', 'Flight Chief', 'Section Chief', 'Open Slot'] },
      { id: 'mun_ops', name: 'Munitions Operations', required: 3, positions: ['Flight Leadership', 'Munitions Operations', 'Stockpile Surveillance'] },
      { id: 'sys', name: 'Systems Flight', required: 4, positions: ['Flight Leadership', 'Munitions Control', 'Plans & Scheduling', 'Combat Plans, Training & Mobility'] },
      { id: 'spec', name: 'Special Weapons Flight', required: 3, positions: ['Flight Leadership', 'NARS', 'Vault Mx'] }
    ]
  }
};

// ══════════════════════════════════════════════════════════════════════════
// 🟢 INITIAL SAMPLE DATA (Loaded if database is completely empty)
// ══════════════════════════════════════════════════════════════════════════
// STATUS MUST BE: 'available', 'tdy', 'medical', 'leave', or 'deployed'
// SECTION MUST BE: A valid section ID (e.g., 'hq', 'deployed', or '' (Unassigned))
// ══════════════════════════════════════════════════════════════════════════

export const SAMPLE_PEOPLE = [
  // ── COMMAND & STAFF ────────────────────────────────────────────────────────
  { 
    id: 'p100', 
    name: 'Miller, James', 
    rank: 'Maj', 
    role: '21A3 Munitions/MX', 
    status: 'available', 
    quals: [], 
    notes: 'Commander', 
    dutyStart: '2023-08-01', 
    arrived: '2023-08-01', 
    deros: '2025-08-28', 
    section: 'hq', 
    slot: 0 
  },
  { 
    id: 'p101', 
    name: 'Davis, Robert', 
    rank: 'CMSgt', 
    role: '2W091 Muns Superintendent', 
    status: 'available', 
    quals: ['Evaluator'], 
    notes: 'Senior Enlisted Leader', 
    dutyStart: '2022-05-15', 
    arrived: '2022-05-15', 
    deros: '2026-05-15', 
    section: 'hq', 
    slot: 2 
  },

  // ── MATERIEL / OPERATIONS ──────────────────────────────────────────────────
  { 
    id: 'p102', 
    name: 'Taylor, David', 
    rank: 'TSgt', 
    role: '2W071 Muns Systems', 
    status: 'leave', 
    quals: ['Task Certified', 'MX Controller'], 
    notes: 'On leave until the 15th', 
    dutyStart: '2023-07-05', 
    arrived: '2023-07-05', 
    deros: '2028-07-28', 
    section: 'mat', 
    slot: 0 
  },
  { 
    id: 'p103', 
    name: 'Young, Michael', 
    rank: 'SrA', 
    role: '2W051 Muns Systems', 
    status: 'tdy', 
    quals: ['Crew Chief'], 
    notes: 'TDY to Nellis for Red Flag', 
    dutyStart: '2023-01-27', 
    arrived: '2023-01-27', 
    deros: '2027-04-29', 
    section: 'mat', 
    slot: 1 
  },

  // ── ARMAMENT / MAINTENANCE ─────────────────────────────────────────────────
  { 
    id: 'p104', 
    name: 'Thompson, Jessica', 
    rank: 'SSgt', 
    role: '2W171 Armament Sys', 
    status: 'medical', 
    quals: ['Crew Chief', 'IP', 'Stan/Eval'], 
    notes: 'Profile restricts lifting over 20lbs', 
    dutyStart: '2022-07-10', 
    arrived: '2022-07-10', 
    deros: '2028-11-07', 
    section: 'arm', 
    slot: 0 
  },

  // ── UNASSIGNED POOL ────────────────────────────────────────────────────────
  { 
    id: 'p105', 
    name: 'Gutierrez, Hiroshi', 
    rank: 'Amn', 
    role: '2W231 Nuclear Wpns', 
    status: 'available', 
    quals: ['PRP Certified', 'Nuclear Certified'], 
    notes: 'In-processing', 
    dutyStart: '2026-03-03', 
    arrived: '2026-03-03', 
    deros: '2029-03-03', 
    section: '',  // Empty string keeps them in the pool
    slot: '' 
  },

  // ── DEPLOYED POOL ──────────────────────────────────────────────────────────
  { 
    id: 'p106', 
    name: 'Ross, Joan', 
    rank: 'SrA', 
    role: '2W051 Muns Systems', 
    status: 'deployed', // Automatically excluded from Readiness math
    quals: ['Task Certified'], 
    notes: 'Deployed to CENTCOM', 
    dutyStart: '2021-01-20', 
    arrived: '2021-01-20', 
    deros: '2025-01-20', 
    section: 'deployed', // Renders them in the deployed dropzone
    slot: '' 
  }
];