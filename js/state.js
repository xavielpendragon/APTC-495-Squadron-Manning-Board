import { BRANCHES } from './config.js';

// ══════════════════════════════════════════════════════════════════════════
// 🟢 DATABASE INITIALIZATION (PouchDB - Offline Local Storage)
// ══════════════════════════════════════════════════════════════════════════
// Using window.PouchDB ensures we avoid ReferenceErrors if the module loads quickly
const db = new window.PouchDB('manning_board_db');

export let currentBranch = 'usaf';
export const branchPeople = {};
export let nextId = 1000;
export let dragId = null;
export let editingId = null;
export let isWhatIfMode = false;
export function setWhatIfMode(val) { isWhatIfMode = val; }
export const undoStack = [];
const UNDO_LIMIT = 20;

// ══════════════════════════════════════════════════════════════════════════
// 🟢 AUTHENTICATION & SESSIONS
// ══════════════════════════════════════════════════════════════════════════
export let currentUserRole = null; 

// Simple hardcoded offline credentials
const CREDENTIALS = {
  'admin': { pass: 'admin123', role: 'admin' },
  'user': { pass: 'user123', role: 'user' }
};

export function checkSession() {
  const sessionRole = sessionStorage.getItem('manning_session');
  if (sessionRole) {
    currentUserRole = sessionRole;
    return true;
  }
  return false;
}

export function login(username, password) {
  const user = CREDENTIALS[username.toLowerCase()];
  if (user && user.pass === password) {
    currentUserRole = user.role;
    sessionStorage.setItem('manning_session', user.role);
    return true;
  }
  return false;
}

export function logout() {
  currentUserRole = null;
  sessionStorage.removeItem('manning_session');
  window.location.reload(); 
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 CORE INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════

Object.keys(BRANCHES).forEach(k => {
  branchPeople[k] = defaultPeople(k);
  BRANCHES[k].sections = defaultSections(k);
});

export function setBranch(val) { currentBranch = val; }
export function setNextId(val) { nextId = val; }
export function setDragId(val) { dragId = val; }
export function setEditingId(val) { editingId = val; }

export function branch() { return BRANCHES[currentBranch]; }
export function people() { return branchPeople[currentBranch]; }
export function setPeople(arr) { branchPeople[currentBranch] = arr; }

export function defaultPeople(k) {
  return BRANCHES[k].samplePeople.map(p => ({...p, quals:[...p.quals]}));
}

function defaultSections(k) {
  return BRANCHES[k].sections.map(s => {
    const structuralPositions = [...s.positions];
    const requiredSize = s.required;
    const currentSlotsCount = structuralPositions.length;
    
    if (requiredSize > currentSlotsCount) {
      const slotsToInflate = requiredSize - currentSlotsCount;
      for (let i = 0; i < slotsToInflate; i++) {
        structuralPositions.push('Open');
      }
    }
    
    return {
      id: s.id,
      name: s.name,
      required: requiredSize,
      positions: structuralPositions
    };
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 ASYNCHRONOUS DATABASE TRANSACTIONS
// ══════════════════════════════════════════════════════════════════════════

export async function saveState() {   
// 🟢 ADD THIS LINE: Prevent DB writes during What-If mode
  if (isWhatIfMode) return;
  try {
    const sectionSnap = {};
    Object.keys(BRANCHES).forEach(k => {
      sectionSnap[k] = BRANCHES[k].sections.map(s => ({
        id: s.id, name: s.name, required: s.required, positions: [...s.positions]
      }));
    });

    const payload = {
      _id: 'board_state',
      currentBranch,
      branchPeople,
      sectionSnap,
      nextId,
      unitName: document.getElementById('unit-name')?.value || '',
    };

    try {
      const existing = await db.get('board_state');
      payload._rev = existing._rev; 
    } catch (err) {}

    await db.put(payload);
  } catch(e) {
    console.warn('Could not save state to local database:', e);
  } 
}

export async function loadState() {   
  try {
    const payload = await db.get('board_state');

    if (payload.currentBranch && BRANCHES[payload.currentBranch]) {
      currentBranch = payload.currentBranch;
    }
    if (payload.branchPeople) {
      Object.keys(BRANCHES).forEach(k => {
        if (payload.branchPeople[k]) branchPeople[k] = payload.branchPeople[k];
      });
    }
    if (payload.sectionSnap) {
      Object.keys(BRANCHES).forEach(k => {
        if (payload.sectionSnap[k]) BRANCHES[k].sections = payload.sectionSnap[k];
      });
    }

    if (payload.nextId) nextId = payload.nextId;
    if (payload.unitName) {
      const el = document.getElementById('unit-name');
      if (el) el.value = payload.unitName;
    }
    
    return true;
  } catch(e) {
    if (e.name === 'not_found') {
      await saveState();
    }
    return false;
  } 
}

export async function clearState() {
  if (currentUserRole !== 'admin') return; 
  if (!confirm('WARNING: Reset ALL branches to default rosters and clear ID history? This cannot be undone.')) return;
  
  try {
    // 1. Remove the entire state document from the DB
    const existing = await db.get('board_state');
    await db.remove(existing);
  } catch (err) { }
  
  // 2. Force reset all in-memory variables to their original factory settings
  Object.keys(BRANCHES).forEach(k => {
    branchPeople[k] = defaultPeople(k);
    BRANCHES[k].sections = defaultSections(k);
  });
  
  // 3. 🟢 THE FIX: Reset the ID counter and clear the undo history
  nextId = 1000; 
  undoStack.length = 0; 
  
// 4. Save the empty/default state back to DB
// await saveState();
  
  // 5. 🟢 THE FIX: Force a hard browser reload to clear all cached logic
  if (window.showToast) window.showToast('Board reset to defaults');
  setTimeout(() => { window.location.reload(true); }, 300);
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 RUNTIME MEMORY
// ══════════════════════════════════════════════════════════════════════════

// 1. The Stack Variable (keeps track of the last 20 moves)
// (Already declared at the top of state.js)

// 2. The Snapshot Function (records the current state)
export function takeSnapshot() {
  if (undoStack.length >= 20) {
    undoStack.shift(); 
  }
  
  // 🟢 FIX: Clone branchPeople and the current active branch's sections correctly
  const memory = {
    people: JSON.parse(JSON.stringify(branchPeople)),
    sections: JSON.parse(JSON.stringify(BRANCHES[currentBranch].sections))
  };
  
  undoStack.push(memory);
}

// 3. The Undo Function (restores the last memory)
export function undo() {
  if (undoStack.length === 0) return false; 
  
  const lastState = undoStack.pop();
  
  // 🟢 FIX: Restore the data deep-cloned into the active objects
  Object.assign(branchPeople, lastState.people);
  BRANCHES[currentBranch].sections = lastState.sections;
  
  saveState(); 
  return true; 
}