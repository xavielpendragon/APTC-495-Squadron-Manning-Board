import { BRANCHES, SAMPLE_PEOPLE } from './config.js';

// ══════════════════════════════════════════════════════════════════════════
// 🟢 DATABASE INITIALIZATION (PouchDB - Offline Local Storage)
// ══════════════════════════════════════════════════════════════════════════
const db = new window.PouchDB('manning_board_db');
const ORIGINAL_BRANCH_SECTIONS = JSON.parse(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(BRANCHES).map(([branchId, branch]) => [
        branchId,
        branch.sections || []
      ])
    )
  )
);

export let currentBranch = 'usaf';
export const branchPeople = {};
export let nextId = 1000;
export let dragId = null;
export let editingId = null;
export let isWhatIfMode = false;
export function setWhatIfMode(val) { isWhatIfMode = val; }
export function setDragId(id) { dragId = id; }
export function getDragId() { return dragId; }
export function setEditingId(id) { editingId = id; }
export function setNextId(val) { nextId = val; }
export function setCurrentBranch(b) { currentBranch = b; }
export function setPeople(newPeople) { branchPeople[currentBranch] = newPeople; }
export function people() { return branchPeople[currentBranch] || []; }
export function branch() { return BRANCHES[currentBranch]; }
export const undoStack = [];
const UNDO_LIMIT = 20;

// ══════════════════════════════════════════════════════════════════════════
// 🟢 DATA INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════

function defaultPeople(branchId) {
  const samples = SAMPLE_PEOPLE || [];
  return JSON.parse(JSON.stringify(samples));
}

function defaultSections(branchId) {
  return JSON.parse(JSON.stringify(ORIGINAL_BRANCH_SECTIONS[branchId] || []));
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 AUTHENTICATION & SESSIONS
// ══════════════════════════════════════════════════════════════════════════
export let currentUserRole = null;
export let currentUserName = null;
export let currentUserDisplayName = null;
export let lastModifiedBy = null;
export let lastModifiedAt = null;

const CREDENTIALS = {
  'admin': {
    pass: 'admin123',
    role: 'admin',
    displayName: 'Administrator'
  },
  'user': {
    pass: 'user123',
    role: 'user',
    displayName: 'Standard User'
  }
};

export function checkSession() {
  const sessionRole = sessionStorage.getItem('manning_session_role');
  const sessionUser = sessionStorage.getItem('manning_session_user');
  const sessionDisplay = sessionStorage.getItem('manning_session_display');

  if (sessionRole && sessionUser) {
    currentUserRole = sessionRole;
    currentUserName = sessionUser;
    currentUserDisplayName = sessionDisplay || sessionUser;
    return true;
  }

  return false;
}

export function login(username, password) {
  const normalizedUser = String(username || '').toLowerCase().trim();
  const user = CREDENTIALS[normalizedUser];
  if (user && user.pass === password) {
    currentUserRole = user.role;
    currentUserName = normalizedUser;
    currentUserDisplayName = user.displayName || normalizedUser;
    sessionStorage.setItem('manning_session_role', user.role);
    sessionStorage.setItem('manning_session_user', normalizedUser);
    sessionStorage.setItem('manning_session_display', currentUserDisplayName);
    return true;
  }
  return false;
}

export function logout() {
  currentUserRole = null;
  currentUserName = null;
  currentUserDisplayName = null;
  sessionStorage.removeItem('manning_session_role');
  sessionStorage.removeItem('manning_session_user');
  sessionStorage.removeItem('manning_session_display');
  if (window.render) window.render();
  if (window.showToast) window.showToast('Logged out', 'info');
  window.location.reload();
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 SNAPSHOTS & UNDO
// ══════════════════════════════════════════════════════════════════════════
export function takeSnapshot() {
  if (isWhatIfMode) return;
  const sectionSnap = {};
  Object.keys(BRANCHES).forEach(branchId => {
    sectionSnap[branchId] = JSON.parse(JSON.stringify(BRANCHES[branchId].sections || []));
  });
  const snap = {
    people: JSON.parse(JSON.stringify(branchPeople)),
    nextId,
    currentBranch,
    sections: sectionSnap
  };
  undoStack.push(snap);
  if (undoStack.length > UNDO_LIMIT) {
    undoStack.shift();
  }
}

export function undo() {
  if (undoStack.length === 0) return false;
  const snap = undoStack.pop();
  Object.keys(BRANCHES).forEach(branchId => {
    branchPeople[branchId] = snap.people[branchId] || defaultPeople(branchId);
    if (snap.sections && snap.sections[branchId]) {
      BRANCHES[branchId].sections = snap.sections[branchId];
    }
  });
  nextId = snap.nextId;
  currentBranch = snap.currentBranch || currentBranch;
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
    if (doc.lastModifiedBy) lastModifiedBy = doc.lastModifiedBy;
    if (doc.lastModifiedAt) lastModifiedAt = doc.lastModifiedAt;
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

export function saveState() {
  if (isWhatIfMode) {
    return Promise.resolve(false);
  }

  clearTimeout(saveTimeout);

  return new Promise(resolve => {
    saveTimeout = setTimeout(async () => {
      try {
        await saveStateImmediate();
        resolve(true);
      } catch (e) {
        console.warn('Could not save state to local database:', e);
        resolve(false);
      }
    }, 400);
  });
}

export async function saveStateImmediate() {
  if (isWhatIfMode) return;

  clearTimeout(saveTimeout);

  try {
    const sectionSnap = {};
    Object.keys(BRANCHES).forEach(k => {
      sectionSnap[k] = JSON.parse(JSON.stringify(BRANCHES[k].sections || []));
    });

    const payload = {
      _id: 'board_state',
      currentBranch,
      branchPeople,
      sectionSnap,
      nextId,
      unitName: document.getElementById('unit-name')?.value || '',
      lastModifiedBy: currentUserDisplayName || currentUserName || currentUserRole || 'Unknown User',
      lastModifiedAt: new Date().toISOString()
    };

    try {
      const existing = await db.get('board_state');
      payload._rev = existing._rev;
    } catch (err) {
      // New document.
    }

    await db.put(payload);
    lastModifiedBy = payload.lastModifiedBy;
    lastModifiedAt = payload.lastModifiedAt;
  } catch (e) {
    console.warn('Could not immediately save state to local database:', e);
  }
}

export async function clearState() {
  try {
    const existing = await db.get('board_state');
    await db.remove(existing);
  } catch (e) {
    // Ignore if board_state does not exist.
  }

  Object.keys(BRANCHES).forEach(branchId => {
    branchPeople[branchId] = defaultPeople(branchId);
    BRANCHES[branchId].sections = defaultSections(branchId);
  });

  currentBranch = 'usaf';
  nextId = 1100;
  dragId = null;
  editingId = null;
  undoStack.length = 0;

  await saveStateImmediate();
  
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