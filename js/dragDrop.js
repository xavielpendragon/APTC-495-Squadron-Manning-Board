import { BRANCHES } from './config.js';
import * as s from './state.js'; 
import { render, showToast, validateAssignment } from './main.js';

export function clearDragState() {
  if (s.setDragId) {
    s.setDragId(null);
  }

  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
}

document.addEventListener('dragstart', (e) => { 
  const card = e.target.closest('[data-id]');
  if (!card) return;

  if (s.setDragId) {
    s.setDragId(card.dataset.id);
  }

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', card.dataset.id);

  requestAnimationFrame(() => card.classList.add('dragging'));
});

document.addEventListener('dragend', () => {
  clearDragState();
});

document.addEventListener('dragover', (ev) => {
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  const deployed = ev.target.closest('#deployed-drop');

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

document.addEventListener('dragleave', (ev) => {
  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  const deployed = ev.target.closest('#deployed-drop');

  const target = slot || pool || deployed;

  if (target && !target.contains(ev.relatedTarget)) {
    target.classList.remove('drag-over');
  }
});

document.addEventListener('drop', (ev) => {
  ev.preventDefault();

  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

  const activeDragId = s.dragId || (s.getDragId ? s.getDragId() : null);
  if (!activeDragId) return;

  const slot = ev.target.closest('.slot');
  const pool = ev.target.closest('#pool-drop');
  const deployed = ev.target.closest('#deployed-drop');

  const ps = s.people ? s.people() : s.branchPeople[s.currentBranch];
  const person = ps.find(x => x.id === activeDragId);

  if (!person) {
    clearDragState();
    return;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1. Drop onto assigned section slot
  // ════════════════════════════════════════════════════════════════════════
  if (slot) {
    const secId = slot.dataset.section;
    const slotIdx = parseInt(slot.dataset.slot, 10);

    const activeBranch = s.branch ? s.branch() : BRANCHES[s.currentBranch];
    const targetSection = activeBranch.sections.find(sec => sec.id === secId);
    const targetPosition = targetSection ? targetSection.positions[slotIdx] : null;

    // Validate required qualification for restricted slots.
    if (targetPosition && typeof validateAssignment === 'function') {
      const validation = validateAssignment(person, targetPosition);

      if (!validation.valid) {
        if (typeof showToast === 'function') {
          showToast(
            `Restricted Slot: ${person.name} is missing the "${validation.missing}" qualification.`,
            'error'
          );
        }

        clearDragState();

        if (typeof render === 'function') {
          render();
        }

        return;
      }
    }

    const occ = ps.find(x => x.section === secId && Number(x.slot) === slotIdx);
    const oldSection = person.section || '';
    const oldSlot = person.slot ?? '';

    s.takeSnapshot();

    // If another person is already in the target slot, swap them.
    if (occ && occ.id !== activeDragId) {
      occ.section = oldSection;
      occ.slot = oldSlot;

      // Keep displaced person's status aligned with their new location.
      if (oldSection === 'deployed') {
        occ.status = 'deployed';
      } else if (occ.status === 'deployed') {
        occ.status = 'available';
      }
    }

    person.section = secId;
    person.slot = slotIdx;

    // If dragging someone back from deployed, make them available again.
    if (person.status === 'deployed') {
      person.status = 'available';
    }

    s.saveState();

    if (typeof render === 'function') {
      render();
    }

    clearDragState();
    return;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. Drop onto deployed pool
  // ════════════════════════════════════════════════════════════════════════
  if (deployed) {
    if (person.section !== 'deployed') {
      s.takeSnapshot();

      person.section = 'deployed';
      person.slot = '';
      person.status = 'deployed';

      s.saveState();

      if (typeof render === 'function') {
        render();
      }
    }

    clearDragState();
    return;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. Drop onto unassigned pool
  // ════════════════════════════════════════════════════════════════════════
  if (pool) {
    if (person.section !== null && person.section !== '') {
      s.takeSnapshot();

      person.section = '';
      person.slot = '';

      if (person.status === 'deployed') {
        person.status = 'available';
      }

      s.saveState();

      if (typeof render === 'function') {
        render();
      }
    }

    clearDragState();
    return;
  }

  clearDragState();
});