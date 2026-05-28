import { BRANCHES } from './config.js';
import * as s from './state.js'; 
import { render, showToast, validateAssignment } from './main.js';

export function clearDragState() {
  if (s.setDragId) s.setDragId(null); 
  else s.dragId = null;
  
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
}

document.addEventListener('dragstart', (e) => { 
  const card = e.target.closest('[data-id]');
  if (!card) return;
  
  // Safely assign the drag ID to the state manager
  if (s.setDragId) s.setDragId(card.dataset.id);
  else s.dragId = card.dataset.id;
  
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', card.dataset.id);
  
  requestAnimationFrame(() => card.classList.add('dragging'));
});

document.addEventListener('dragend', () => clearDragState());

document.addEventListener('dragover', ev => {
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  const deployed = ev.target.closest('#deployed-drop'); // 🟢 ADDED: Deployed Dropzone
  
  if (slot || pool || deployed) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';

    const target = slot || pool || deployed;
    if (!target.classList.contains('drag-over')) {
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      target.classList.add('drag-over');
    }
  }
});

document.addEventListener('dragleave', ev => {
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  const deployed = ev.target.closest('#deployed-drop'); // 🟢 ADDED: Deployed Dropzone
  
  const target = slot || pool || deployed;
  if (target && !target.contains(ev.relatedTarget)) target.classList.remove('drag-over');
});

// ══════════════════════════════════════════════
// 🟢 SINGLE, CONSOLIDATED DROP LISTENER
// ══════════════════════════════════════════════
document.addEventListener('drop', ev => {
  ev.preventDefault();
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  
  // Safely retrieve the active drag ID from state
  const activeDragId = s.dragId || (s.getDragId ? s.getDragId() : null);
  if (!activeDragId) return; 
  
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  const deployed = ev.target.closest('#deployed-drop'); // 🟢 ADDED: Deployed Dropzone
  
  // 1. Handling assignment TO A SLOT 
  if (slot) {
    const secId = slot.dataset.section;
    const slotIdx = parseInt(slot.dataset.slot, 10);
    const ps = s.people ? s.people() : s.branchPeople[s.currentBranch];
    
    const person = ps.find(x => x.id === activeDragId); 
    if (!person) { clearDragState(); return; }

    // Look up the active section and position requirements
    const _b = s.branch ? s.branch() : BRANCHES[s.currentBranch];
    const targetSection = _b.sections.find(sec => sec.id === secId);
    const targetPosition = targetSection ? targetSection.positions[slotIdx] : null;
    
    // 🛑 REQUIREMENT 5.2.3: ENFORCE QUALIFICATION LOGIC
    if (targetPosition && typeof validateAssignment === 'function') {
      const validation = validateAssignment(person, targetPosition);
      
      if (!validation.valid) {
        // REJECT ASSIGNMENT: Show error toast and abort the drop
        if (typeof showToast === 'function') {
          showToast(`Restricted Slot: ${person.name} is missing the "${validation.missing}" qualification.`, 'error');
        }
        clearDragState();
        if (typeof render === 'function') render(); // Snap the card back visually
        return; 
      }
    }

    // Check if the slot is already occupied to swap them
    
    const occ = ps.find(x => x.section === secId && x.slot === slotIdx);
    
    s.takeSnapshot();
    
    // 🟢 THE FIX: If they were deployed, automatically make them available again
    if (person.status === 'deployed') person.status = 'available'; 
    
    if (occ && occ.id !== activeDragId) {
      occ.section = person.section;
      occ.slot = person.slot;
    }
    
    person.section = secId;
    person.slot = slotIdx;
    
    s.saveState();
    if (typeof render === 'function') render();
    clearDragState();
  }
  
  // 2. Handling assignment TO THE DEPLOYED POOL
  else if (deployed) {
    const ps = s.people ? s.people() : s.branchPeople[s.currentBranch];
    const person = ps.find(x => x.id === activeDragId);
    
    if (person && person.section !== 'deployed') {
      s.takeSnapshot();
      person.section = 'deployed';
      person.slot = ''; 
      person.status = 'deployed'; // 🟢 THE FIX: Auto-update the dropdown status
      s.saveState();
      if (typeof render === 'function') render();
    }
    clearDragState();
  }

  // 3. Handling unassignment TO THE UNASSIGNED POOL
  else if (pool) {
    const ps = s.people ? s.people() : s.branchPeople[s.currentBranch];
    const person = ps.find(x => x.id === activeDragId);
    
    if (person && (person.section !== null && person.section !== '')) {
      s.takeSnapshot();
      person.section = ''; 
      person.slot = '';
      if (person.status === 'deployed') person.status = 'available'; // 🟢 THE FIX: Clear deployed status
      s.saveState();
      if (typeof render === 'function') render();
    }
    clearDragState();
  }
});