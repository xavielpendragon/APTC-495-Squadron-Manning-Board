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
    rolePlaceholder: 'e.g., 2A353 / Crew Chief',
    ranks: ['AB','Amn','A1C','SrA','SSgt','TSgt','MSgt','SMSgt','CMSgt','CCC','2d Lt','1st Lt','Capt','Maj','Lt Col','Col'],
    quals: ['7-lvl', '5-lvl', 'Flight Lead', 'Task Certified', 'Stan/Eval', 'IP', 'Evaluator', 'CDDAR', 'MX Controller', 'Crew Chief'],
    sections: [
      {id:'hq',   name:'Command & Staff',        required:13, positions:['Commander', 'MX DO', 'SEL', 'First Sergeant', 'CSS', 'Resource Advisor', 'PRP / Security']},
      {id:'prod', name:'Production Flight',      required:56, positions:['Flight Leadership', 'Conventional Mx', 'Precision Guided Missiles', 'Trailer Mx', 'Inspection']},
      {id:'arm',  name:'Armament Flight',        required:47, positions:['Flight Leadership', 'Weapons Mx', 'Weapon Systems Mx']},
      {id:'mat',  name:'Materiel Flight',        required:28, positions:['Flight Leadership', 'Munitions Operations', 'Stockpile Surveillance']},
      {id:'sys',  name:'Systems Flight',         required:26, positions:['Flight Leadership', 'Munitions Control', 'Plans & Scheduling', 'Combat Plans, Training & Mobility']},
      {id:'spec', name:'Special Weapons Flight', required:11, positions:['Flight Leadership', 'NARS', 'Vault Mx']}
    ],
    samplePeople: [
      { id: 'p100', name: 'Brown, Matthew', rank: 'SrA', role: '2A571', status: 'medical', quals: ['Evaluator'], notes: null, dutyStart: '2024-05-25', arrived: '2024-05-25', deros: '2028-05-08', section: 'hq', slot: 4 }, // Assigned to CSS
      { id: 'p101', name: 'Doe, Jane', rank: 'TSgt', role: '2A353', status: 'medical', quals: ['CDDAR', 'Stan/Eval'], notes: null, dutyStart: '2023-11-10', arrived: '2023-11-10', deros: '2027-07-27', section: 'prod', slot: 4 }, // Assigned to Inspection
      { id: 'p102', name: 'Miller, Ravi', rank: 'SSgt', role: '2A571', status: 'tdy', quals: ['Flight Lead', 'Task Certified'], notes: null, dutyStart: '2023-08-01', arrived: '2023-08-01', deros: '2025-08-28', section: 'hq', slot: 0 }, // Assigned to Commander
      { id: 'p103', name: 'Thompson, Jessica', rank: 'SrA', role: '2A571', status: 'leave', quals: ['Crew Chief', 'IP', 'Stan/Eval'], notes: null, dutyStart: '2022-07-10', arrived: '2022-07-10', deros: '2028-11-07', section: 'arm', slot: 1 }, // Assigned to Weapons Mx
      { id: 'p104', name: 'Taylor, David', rank: 'SrA', role: '2A353', status: 'leave', quals: ['Evaluator', 'Task Certified'], notes: null, dutyStart: '2023-07-05', arrived: '2023-07-05', deros: '2028-07-28', section: 'mat', slot: 1 }, // Assigned to Munitions Operations
      { id: 'p105', name: 'Young, Michael', rank: 'SrA', role: '2A353', status: 'leave', quals: ['MX Controller'], notes: null, dutyStart: '2023-01-27', arrived: '2023-01-27', deros: '2027-04-29', section: 'sys', slot: 1 }, // Assigned to Munitions Control
      { id: 'p106', name: 'Taylor, Ravi', rank: 'TSgt', role: '2A353', status: 'leave', quals: ['IP', 'MX Controller', 'Task Certified'], notes: null, dutyStart: '2022-02-11', arrived: '2022-02-11', deros: '2027-02-08', section: 'hq', slot: 2 }, // Assigned to SEL
      { id: 'p107', name: 'Garcia, Ravi', rank: 'SSgt', role: '2A353', status: 'available', quals: ['Flight Lead', 'Stan/Eval'], notes: null, dutyStart: '2024-11-16', arrived: '2024-11-16', deros: '2028-03-19', section: 'spec', slot: 0 } // Assigned to Flight Leadership (Special Weapons)
    ]
  }
};