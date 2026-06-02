import { BRANCHES, SAMPLE_PEOPLE } from './config.js';

// ══════════════════════════════════════════════════════════════════════════
// 🟢 DATABASE INITIALIZATION (PouchDB - Offline Local Storage)
// ══════════════════════════════════════════════════════════════════════════
const db = new window.PouchDB('manning_board_db');

export let currentBranch = 'usaf';
export const branchPeople = {};
export let nextId = 1000;
export let dragId = null;
export let editingId = null;
export let isWhatIfMode = false;

export function setWhatIfMode(val) { isWhatIfMode = val; }
export function setDragId(id) { dragId = id; }
export function setNextId(val) { nextId = val; }
export function setCurrentBranch(b) { currentBranch = b; }
export function people() { return branchPeople[currentBranch] || []; }
export function branch() { return BRANCHES[currentBranch]; }

export const undoStack = [];
const UNDO_LIMIT = 20;

// ══════════════════════════════════════════════════════════════════════════
// 🟢 DATA INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════

function defaultPeople(branchId) {
  const samples = SAMPLE_PEOPLE || [];
  return samples.map(p => ({
    ...p,
    quals: p.quals ? [...p.quals] : [] 
  }));
}

// Populate default arrays on boot
Object.keys(BRANCHES).forEach(k => {
  branchPeople[k] = defaultPeople(k); 
});

function defaultSections(branchId) {
  const branchObj = BRANCHES[branchId];
  if (!branchObj || !branchObj.sections) return [];
  
  return branchObj.sections.map(s => ({
    ...s,
    positions: [...s.positions]
  }));
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 AUTHENTICATION & SESSIONS
// ══════════════════════════════════════════════════════════════════════════
export let currentUserRole = null; 

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
  if (window.render) window.render();
  if (window.showToast) window.showToast('Logged out', 'info');
  window.location.reload();
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 SNAPSHOTS & UNDO
// ══════════════════════════════════════════════════════════════════════════
export function takeSnapshot() {
  if (isWhatIfMode) return;
  const snap = {
    people: JSON.parse(JSON.stringify(branchPeople)),
    nextId: nextId,
    sections: JSON.parse(JSON.stringify(BRANCHES[currentBranch].sections))
  };
  undoStack.push(snap);
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
}

export function undo() {
  if (undoStack.length === 0) return false;
  const snap = undoStack.pop();
  
  // Restore people and counters
  branchPeople[currentBranch] = snap.people[currentBranch];
  nextId = snap.nextId;
  
  // Restore sections
  if (snap.sections) {
    BRANCHES[currentBranch].sections = snap.sections;
  }
  
  saveState();
  return true;
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 STATE MANAGEMENT (Load, Save, Reset)
// ══════════════════════════════════════════════════════════════════════════

export async function loadState() {
  try {
    const doc = await db.get('board_state');
    
    if (doc.currentBranch) currentBranch = doc.currentBranch;
    if (doc.nextId) nextId = doc.nextId;
    if (doc.unitName) {
        const titleInput = document.getElementById('unit-name');
        if (titleInput) titleInput.value = doc.unitName;
    }
    
    Object.keys(BRANCHES).forEach(k => {
      branchPeople[k] = doc.branchPeople && doc.branchPeople[k] ? doc.branchPeople[k] : defaultPeople(k);
      if (doc.sectionSnap && doc.sectionSnap[k]) {
        BRANCHES[k].sections = doc.sectionSnap[k];
      }
    });
  } catch (err) {
    // If DB is completely empty, populate defaults safely
    Object.keys(BRANCHES).forEach(k => {
      branchPeople[k] = defaultPeople(k); 
    });
  }
}

let saveTimeout = null; // Debounce timer to prevent database flooding
export async function saveState() {   
  if (isWhatIfMode) return;
  
  clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(async () => {
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
  }, 400); 
}

export async function clearState() {
  // 1. Wipe the database
  try {
    const existing = await db.get('board_state');
    await db.remove(existing);
  } catch (e) { }

  // 2. Reset memory using the corrected defaultPeople function
  Object.keys(BRANCHES).forEach(k => {
    branchPeople[k] = defaultPeople(k); 
    
    // Reset sections from config
    if (BRANCHES[k] && BRANCHES[k].sections) {
      BRANCHES[k].sections = BRANCHES[k].sections.map(sec => ({
        ...sec,
        positions: [...sec.positions]
      }));
    }
  });

  // 3. Reset ID and update the UI
  nextId = 1100; 
  await saveState();
  
  if (window.render) window.render();
  if (window.showToast) window.showToast('Board reset to default personnel', 'success');
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 REMOTE DATABASE SYNCHRONIZATION (UI / LocalStorage Model)
// ══════════════════════════════════════════════════════════════════════════
let syncHandler = null;
let pullTimeout = null; 

export function getSavedSyncUrl() {
  return localStorage.getItem('manning_remote_db') || '';
}

export function startSync(remoteDbUrl, updateUIStatusCallback) {
  if (!remoteDbUrl) return;

  // Save the URL locally so it reconnects automatically on refresh
  localStorage.setItem('manning_remote_db', remoteDbUrl);
  
  try {
    const remoteDB = new window.PouchDB(remoteDbUrl);

    // Initiate real-time, two-way sync
    syncHandler = db.sync(remoteDB, {
      live: true,
      retry: true
    })
    .on('change', function (info) {
      // If the change came from the remote database...
      if (info.direction === 'pull') {
         // Debounce: Wait for the remote database to stop sending rapid packets for 300ms
         clearTimeout(pullTimeout);
         pullTimeout = setTimeout(async () => {
            await loadState(); // Reload the fresh data into memory arrays
            if (window.render) window.render(); // Redraw the board ONCE
            if (window.showToast) window.showToast('Board updated by remote user', 'info');
         }, 300);
      }
    })
    .on('paused', function (err) {
      updateUIStatusCallback(err ? 'error' : 'synced');
    })
    .on('active', function () {
      updateUIStatusCallback('syncing');
    })
    .on('denied', function (err) {
      updateUIStatusCallback('error');
    })
    .on('error', function (err) {
      updateUIStatusCallback('error');
    });

    updateUIStatusCallback('connecting');
    
  } catch (err) {
    // Catches bad URLs typed into the UI Modal
    console.error("Invalid database URL:", err);
    updateUIStatusCallback('error');
    if (window.showToast) window.showToast('Invalid Database URL', 'error');
  }
}

export function stopSync(updateUIStatusCallback) {
  if (syncHandler) {
    syncHandler.cancel();
    syncHandler = null;
  }
  localStorage.removeItem('manning_remote_db');
  updateUIStatusCallback('offline');
}