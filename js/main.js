import { BRANCHES, PALETTES } from './config.js';
import * as s from './state.js'; 
import { importCSV, executeExport, toggleExportMenu, downloadCSVTemplate, exportPDF } from './importExport.js';
import './dragDrop.js'; 

export function openConfigPosModal() {
  const modal = document.getElementById('config-pos-modal');
  if (modal) {
    modal.classList.remove('hidden');
    initPositionQualConfig();
  }
}

export function closeConfigPosModal(event) {
  const modal = document.getElementById('config-pos-modal');
  if (modal) {
    modal.classList.add('hidden');
    const dropdownContainer = document.getElementById('config-qual-dropdown-container');
    if (dropdownContainer) dropdownContainer.classList.add('hidden');
  }
}

export function toggleQualDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('config-qual-dropdown-container');
  if (dropdown) dropdown.classList.toggle('hidden');
}

window.addEventListener('click', function(e) {
  const container = document.getElementById('config-qual-dropdown-container');
  const displayBox = document.getElementById('config-qual-display');
  if (container && !container.contains(e.target) && displayBox && !displayBox.contains(e.target)) {
    container.classList.add('hidden');
  }
});

export function initPositionQualConfig() {
  const positionSelect = document.getElementById('config-position-select');
  const dropdownContainer = document.getElementById('config-qual-dropdown-container');
  const _b = s.branch(); 
  
  if (!positionSelect || !dropdownContainer || !_b) return;
  if (document.activeElement === positionSelect) return;

  const savedSel = positionSelect.value;
  positionSelect.innerHTML = '';
  dropdownContainer.innerHTML = '';

  _b.sections.forEach(section => {
    section.positions.forEach((pos, index) => {
      const posName = typeof pos === 'object' ? pos.name : pos;
      const option = document.createElement('option');
      option.value = `${section.id}:${index}`;
      option.textContent = `${section.name} — ${posName}`;
      positionSelect.appendChild(option);
    });
  });

  _b.quals.forEach(qual => {
    const wrapper = document.createElement('div');
    wrapper.className = 'qual-check-row';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = qual;
    checkbox.id = `req-qual-chk-${qual.replace(/[^a-z0-9]/gi, '_')}`;
    checkbox.className = 'qual-checkbox-item';
    checkbox.onchange = updateQualDisplayText;

    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.textContent = qual;
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    
    wrapper.onclick = (e) => {
      if(e.target !== checkbox && e.target !== label) {
        checkbox.checked = !checkbox.checked;
        updateQualDisplayText();
      }
    };
    dropdownContainer.appendChild(wrapper);
  });

  if (savedSel && positionSelect.querySelector(`option[value="${savedSel}"]`)) {
    positionSelect.value = savedSel;
  }
  loadCurrentPositionQual();
}

export function updateQualDisplayText() {
  const checkboxes = document.querySelectorAll('.qual-checkbox-item');
  const selected = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
  const textDisplay = document.getElementById('config-qual-text');
  if (textDisplay) textDisplay.textContent = selected.length > 0 ? selected.join(', ') : 'None (Open Slot)';
}

export function loadCurrentPositionQual() {
  const positionValue = document.getElementById('config-position-select')?.value;
  if (!positionValue) return;

  const [sectionId, slotIndex] = positionValue.split(':');
  const _b = s.branch();
  const section = _b.sections.find(sec => sec.id === sectionId);
  const position = section ? section.positions[parseInt(slotIndex)] : null;

  document.querySelectorAll('.qual-checkbox-item').forEach(chk => {
    chk.checked = false;
    if (position && typeof position === 'object') {
      const activeQuals = Array.isArray(position.reqQual) ? position.reqQual : (position.reqQual?.split('|') || []);
      if (activeQuals.includes(chk.value)) chk.checked = true;
    }
  });
  updateQualDisplayText();
}

export function savePositionQualRequirement() {
  const positionValue = document.getElementById('config-position-select').value;
  if (!positionValue) return;

  const [sectionId, slotIndex] = positionValue.split(':');
  const _b = s.branch();
  const section = _b.sections.find(sec => sec.id === sectionId);

  if (section && section.positions[parseInt(slotIndex)]) {
    const selectedQuals = Array.from(document.querySelectorAll('.qual-checkbox-item:checked')).map(c => c.value);
    const pos = section.positions[parseInt(slotIndex)];
    section.positions[parseInt(slotIndex)] = {
      name: typeof pos === 'object' ? pos.name : pos,
      reqQual: selectedQuals.length > 0 ? selectedQuals : null
    };
    s.saveState();
    render();
    showToast('Position qualification criteria updated.');
    closeConfigPosModal();
  }
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'});
}

export function derosClass(d) {
  if (!d) return '';
  const days = (new Date(d+'T00:00:00') - new Date()) / 86400000;
  return days < 60 ? 'deros-urgent' : days < 180 ? 'deros-soon' : '';
}

export function avatarColors(name) {
  let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))%PALETTES.length;
  return PALETTES[h];
}

export function initials(name) {
  const p=name.split(','); return p.length>1?(p[1].trim()[0]||'')+(p[0].trim()[0]||''):name.slice(0,2).toUpperCase();
}

export function statusColor(status) {
    const map = { deployed: 'var(--red)', tdy: 'var(--amber)', leave: '#a855f7', medical: '#38bdf8' };
    return map[status] || 'var(--green)';
}

export function buildPersonCard(p) {
  const [bg,fg] = avatarColors(p.name);
  const tags = (p.quals || []).slice(0, 5).map(q=>`<span class="tag">${q}</span>`).join('');
  const dc = derosClass(p.deros);
  const datesHtml = (p.dutyStart || p.arrived || p.deros) ? `<div class="card-dates">
    <div class="card-date">DUTY START<span>${fmtDate(p.dutyStart)}</span></div>
    <div class="card-date">ARRIVED<span>${fmtDate(p.arrived)}</span></div>
    <div class="card-date ${dc}">DEROS<span>${fmtDate(p.deros)}</span></div>
  </div>` : '';
  
  return `<div class="person-card status-${p.status}" id="card-${p.id}" draggable="true" data-id="${p.id}" title="Double-click to edit" ondblclick="window.openModal('${p.id}')">
    <div class="card-top">
      <div class="avatar" style="background:${bg};color:${fg}">${initials(p.name)}</div>
      <div class="card-info">
        <div class="card-name">${p.rank} ${p.name}</div>
        <div class="card-role">${p.role || ''}</div>
      </div>
      <div class="status-pip" style="background:${statusColor(p.status)}"></div>
    </div>
    ${tags?`<div class="card-tags">${tags}</div>`:''}
    ${datesHtml}
    ${p.notes ? `<div class="card-notes">${p.notes.replace(/</g,'&lt;')}</div>` : ''}
  </div>`;
}

// ══════════════════════════════════════════════════════════════════════════
// 🟢 WHAT-IF SCENARIO LOGIC
// ══════════════════════════════════════════════════════════════════════════
let preWhatIfState = null;

export function toggleWhatIfMode() {
  if (!s.isWhatIfMode) {
    // 1. Save a deep clone backup of the live state
    preWhatIfState = {
      people: JSON.parse(JSON.stringify(s.branchPeople[s.currentBranch])),
      sections: JSON.parse(JSON.stringify(BRANCHES[s.currentBranch].sections))
    };
    
    // 2. Activate the flag to pause database saving
    if (s.setWhatIfMode) s.setWhatIfMode(true);
    
    // 3. Show the warning banner
    const banner = document.getElementById('what-if-banner');
    if (banner) banner.style.display = 'flex';
    
    if (window.showToast) window.showToast('What-If Mode Active. Database saving paused.', 'warn');
  }
}

export function commitWhatIf() {
  // 1. Turn off the flag
  if (s.setWhatIfMode) s.setWhatIfMode(false);
  
  // 2. Force a manual save to write the new simulated state to the live DB
  s.saveState(); 
  
  const banner = document.getElementById('what-if-banner');
  if (banner) banner.style.display = 'none';
  
  if (window.showToast) window.showToast('Scenario committed to live board', 'info');
}

export function cancelWhatIf() {
  if (preWhatIfState) {
    // 1. Empty the current arrays and repopulate them with the backup data
    s.branchPeople[s.currentBranch].length = 0;
    s.branchPeople[s.currentBranch].push(...preWhatIfState.people);
    BRANCHES[s.currentBranch].sections = preWhatIfState.sections;
  }
  
  // 2. Turn off the flag
  if (s.setWhatIfMode) s.setWhatIfMode(false);
  
  const banner = document.getElementById('what-if-banner');
  if (banner) banner.style.display = 'none';
  
  // 3. Redraw the board to snap everyone back to their original positions
  render();
  if (window.showToast) window.showToast('Scenario discarded. Live board restored.', 'info');
}

export function render() { 
  renderAlerts(); renderMetrics(); renderSections(); renderPool(); renderDeployed();
  const ts = document.getElementById('timestamp');
  if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  applySearch();
  if (document.getElementById('deros-panel')?.classList.contains('open')) renderDerosPanel();
}

export function renderAlerts() {
  const b = s.branch(); 
  const ps = s.people() || []; 
  const alerts = [];
  
  b.sections.forEach(sec => {
    const count = ps.filter(p => p.section === sec.id).length;
    const activeSlots = sec.positions.length;
    
    if (activeSlots > 0) {
      const pct = count / activeSlots;
      if (pct < 0.5) {
        alerts.push({ level: 'crit', msg: `${sec.name} critically undermanned — ${count}/${activeSlots} slots filled` });
      } else if (pct < 0.75) {
        alerts.push({ level: 'warn', msg: `${sec.name} below 75% manning — ${count}/${activeSlots} slots filled` });
      }
    }
  });

  const depAssigned = ps.filter(p => p.status === 'deployed' && p.section);
  if (depAssigned.length) {
    const depLabel = b.deployedLabel ? b.deployedLabel.toLowerCase() : 'deployed';
    alerts.push({ level: 'warn', msg: `${depAssigned.length} ${depLabel} personnel still holding assigned slots` });
  }

  const container = document.getElementById('alerts');
  if (container) {
    const wi = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;margin-right:6px;vertical-align:text-bottom"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    container.innerHTML = alerts.slice(0, 3).map(a => 
      `<div class="alert alert-${a.level}">${wi}${a.msg}</div>`
    ).join('');
  }
}

export function renderMetrics() {
  const ps = s.people() || []; 
  const totalReq = s.branch().sections.reduce((a, x) => a + x.positions.length, 0);
  const m = {
    total: ps.length, 
    deployed: ps.filter(p => p.status === 'deployed').length,
    tdy: ps.filter(p => p.status === 'tdy').length, 
    leave: ps.filter(p => p.status === 'leave').length,
    medical: ps.filter(p => p.status === 'medical').length, 
    filled: ps.filter(p => p.section).length,
    readiness: totalReq > 0 ? Math.round((ps.filter(p => p.section).length / totalReq) * 100) : 0
  };
  
  const fillColor = m.readiness >= 80 ? 'var(--green)' : m.readiness >= 60 ? 'var(--amber)' : 'var(--red)';
  const mCont = document.getElementById('metrics');
  
  if (mCont) {
    mCont.innerHTML = `
      <div class="metric-card">
        <div class="metric-label">Status</div>
        <div style="display:flex; gap:10px;">
          <div style="flex:1">
            <div class="metric-value" style="color:var(--text); font-size:20px">${m.total}</div>
            <div class="metric-label" style="font-size:8px">Total</div>
          </div>
          <div style="flex:1">
            <div class="metric-value" style="color:var(--text2); font-size:20px">${m.filled}</div>
            <div class="metric-label" style="font-size:8px">Assigned</div>
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Readiness</div>
        <div style="display:flex; gap:10px;">
          <div style="flex:1">
            <div class="metric-value" style="color:${fillColor}; font-size:20px">${m.readiness}%</div>
          </div>
          <div style="flex:1">
            <div class="metric-value" style="color:var(--text2); font-size:20px">${m.filled}/${totalReq}</div>
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Medical / Leave</div>
        <div style="display:flex; gap:10px;">
          <div style="flex:1">
            <div class="metric-value" style="color:#38bdf8; font-size:20px">${m.medical}</div>
          </div>
          <div style="flex:1">
            <div class="metric-value" style="color:#a855f7; font-size:20px">${m.leave}</div>
          </div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-label">Deployment / TDY</div>
        <div style="display:flex; gap:10px;">
          <div style="flex:1">
            <div class="metric-value" style="color:var(--red); font-size:20px">${m.deployed}</div>
          </div>
          <div style="flex:1">
            <div class="metric-value" style="color:var(--amber); font-size:20px">${m.tdy}</div>
          </div>
        </div>
      </div>`;
  }
}

export function renderSections() {
  const ps = s.people() || [];
  const grid = document.getElementById('sections-grid');
  
  if (grid) {
    grid.innerHTML = s.branch().sections.map(sec => {
      const inSec = ps.filter(p => p.section === sec.id);
      const avail = inSec.filter(p => p.status === 'available').length;
      
      const req = sec.required || 1; 
      const pct = Math.round((inSec.length / req) * 100);
      const pctColor = pct >= 90 ? 'var(--green)' : pct >= 70 ? 'var(--amber)' : 'var(--red)';
      
      const isAdmin = s.currentUserRole === 'admin';

      // 🟢 Slot Controls available to ALL
      const slotControlsHTML = `
        <div class="section-controls">
          <button class="sec-ctrl-btn" onclick="window.changeSlots('${sec.id}',-1)" title="Remove last slot">−</button>
          <button class="sec-ctrl-btn" onclick="window.changeSlots('${sec.id}',1)" title="Add slot">+</button>
        </div>
      `;

      // 🔴 Delete Section Admin ONLY
      const deleteSectionHTML = isAdmin ? `
        <button class="del-section-btn" onclick="window.deleteSection('${sec.id}')" title="Delete section">×</button>
      ` : '';

      // 🔴 Auth Input Admin ONLY
      const authInputHTML = isAdmin ? `
        Auth: <input type="number" min="1" max="999" value="${sec.required}"
          style="width:40px;background:var(--surface2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono);font-size:10px;padding:1px 4px;outline:none;text-align:center"
          title="Authorized strength — drives readiness %"
          onchange="window.setRequired('${sec.id}',this.value)"
          onclick="event.stopPropagation()" />
      ` : `Auth: <span style="font-weight:bold; color:var(--text);">${sec.required}</span>`;


      const slots = sec.positions.map((pos, i) => {
        const occ = inSec.find(p => p.section === sec.id && p.slot === i);
        const posName = typeof pos === 'object' ? (pos ? pos.name : 'Open Slot') : pos;
        
        // Slot renaming is admin only
        const renameAttr = isAdmin ? `ondblclick="window.renameSlot('${sec.id}', ${i})"` : '';
        const renameTitle = isAdmin ? 'title="Double-click slot label to change position criteria"' : '';
  
        return `<div class="slot" data-section="${sec.id}" data-slot="${i}" ${renameTitle} ${renameAttr}>
          <div class="slot-label">${posName}</div>
          ${occ ? buildPersonCard(occ) : '<div class="slot-empty">—</div>'}
        </div>`;
      }).join('');
      
      const renameSecAttr = isAdmin ? `onclick="window.renameSection('${sec.id}')" style="cursor:pointer;border-bottom:1px dashed var(--border2)" title="Click to rename"` : '';

      return `<div class="section-card">
        <div class="section-header">
          <div class="section-name" ${renameSecAttr}>${sec.name}</div>
          
          <div style="display:flex;align-items:center;gap:10px">
            <span style="color:${pctColor}; font-weight:bold; font-size:11px;">${pct}% Manned</span>
            ${slotControlsHTML}
            ${deleteSectionHTML}
          </div>
        </div>
        
        <div class="section-meta" style="display:flex;align-items:center;gap:8px">
          <span>${inSec.length} filled · ${avail} available · ${sec.positions.length} slots</span>
          <span style="margin-left:auto;display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text3)">
            ${authInputHTML}
          </span>
        </div>
        <div class="section-slots">
          ${slots}
        </div>
      </div>`;
    }).join('');
  }
}

export function addSection() {
  if (s.currentUserRole !== 'admin') return;
  const name = prompt('Enter new section name:');
  if (!name || name.trim() === '') return;
  
  s.takeSnapshot();
  const id = 'sec_' + Date.now();
  s.branch().sections.push({
    id, name: name.trim(), required: 5, positions: ['Open','Open','Open','Open','Open']
  });
  s.saveState();
  render();
}

export function deleteSection(secId) {
  if (s.currentUserRole !== 'admin') return;
  if (!confirm('Are you sure you want to delete this section? All assigned personnel will be returned to the unassigned pool.')) return;
  
  s.takeSnapshot();
  s.people().filter(p => p.section === secId).forEach(p => {
    p.section = null;
    p.slot = null;
  });
  
  const branchSections = s.branch().sections;
  const index = branchSections.findIndex(sec => sec.id === secId);
  if (index !== -1) branchSections.splice(index, 1);
  
  s.saveState();
  render();
}

export function renameSlot(secId, slotIdx) {
  if (s.currentUserRole !== 'admin') return;
  const sec = s.branch().sections.find(x => x.id === secId);
  if (!sec || slotIdx === undefined || slotIdx === null) return;

  const currentPos = sec.positions[slotIdx];
  const oldName = typeof currentPos === 'object' ? (currentPos ? currentPos.name : '') : currentPos;

  const newName = prompt('Enter new role / requirement title for this specific slot:', oldName);
  if (newName === null) return;

  s.takeSnapshot();

  if (typeof currentPos === 'object' && currentPos !== null) {
    sec.positions[slotIdx] = {
      ...currentPos,
      name: newName.trim() || 'Open Slot'
    };
  } else {
    sec.positions[slotIdx] = newName.trim() || 'Open Slot';
  }

  s.saveState();
  render();
}

export function changeSlots(secId, delta) {
  const activeSections = BRANCHES[s.currentBranch].sections;
  const sec = activeSections.find(x => x.id === secId);
  if (!sec) return;
  
  s.takeSnapshot();
  
  if (delta > 0) {
    sec.positions.push('Open');
  } else if (delta < 0 && sec.positions.length > 0) {
    const removedSlotIdx = sec.positions.length - 1;
    const activePeople = s.branchPeople[s.currentBranch];
    
    const occ = activePeople.find(p => p.section === secId && Number(p.slot) === removedSlotIdx);
    
    if (occ) {
        occ.section = ''; 
        occ.slot = '';
        if (window.showToast) window.showToast(`${occ.name} was returned to the pool`, 'warn');
    }
    sec.positions.pop();
  }
  
  sec.required = sec.positions.length;
  
  s.saveState();
  render();
}

export function setRequired(secId, val) {
  if (s.currentUserRole !== 'admin') return;
  const sec = s.branch().sections.find(s => s.id === secId);
  if (!sec) return;
  
  const num = parseInt(val, 10);
  if (!isNaN(num) && num >= 0) {
    s.takeSnapshot();
    
    sec.required = num;
    const currentSlotCount = sec.positions.length;
    
    if (num > currentSlotCount) {
      const slotsToAdd = num - currentSlotCount;
      for (let i = 0; i < slotsToAdd; i++) {
        sec.positions.push('Open');
      }
    } else if (num < currentSlotCount) {
      const slotsToRemove = currentSlotCount - num;
      for (let i = 0; i < slotsToRemove; i++) {
        const removedSlotIdx = sec.positions.length - 1;
        
        // 🟢 THE FIX: Convert p.slot to a Number
        const occ = s.people().find(p => p.section === secId && Number(p.slot) === removedSlotIdx);
        
        if (occ) {
          occ.section = ''; // Explicitly set to unassigned
          occ.slot = '';
          if (window.showToast) window.showToast(`${occ.name} was returned to the pool`, 'warn');
        }
        sec.positions.pop();
      }
    }
    
    s.saveState();
    render();
  }
}

export function renderPool() {
  let pool = (s.people() || []).filter(p => !p.section);
  const drop = document.getElementById('pool-drop');
  if (drop) drop.innerHTML = pool.map(p=>buildPersonCard(p)).join('');
}

export function showToast(msg, type) { 
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toast-msg').textContent = msg;
  t.className = 'toast show ' + (type || '');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

export function populateRankSelect() {
  const sel = document.getElementById('f-rank');
  if (sel) sel.innerHTML = s.branch().ranks.map(r=>`<option>${r}</option>`).join('');
}

export function buildQualGrid(selected) {
  const qGrid = document.getElementById('qual-grid');
  if (qGrid) {
    qGrid.innerHTML = s.branch().quals.map(q =>
      `<label class="qual-label"><input type="checkbox" value="${q}" ${selected.includes(q)?'checked':''}> ${q}</label>`
    ).join('');
  }
}

export function populateAssignmentDropdown(currentPersonId = null) {
  const sel = document.getElementById('f-assign-slot');
  if (!sel) return;

  const person = s.people().find(p => p.id === currentPersonId);
  const currentVal = person && person.section ? `${person.section}:${person.slot}` : "";

  let html = `<option value="">-- Unassigned (Pool) --</option>`;
  const _b = s.branch();
  const ps = s.people();

  _b.sections.forEach(sec => {
    let options = '';
    sec.positions.forEach((pos, i) => {
      const val = `${sec.id}:${i}`;
      const occupant = ps.find(p => p.section === sec.id && p.slot === i);
      const isOccupied = occupant && occupant.id !== currentPersonId;
      
      if (!isOccupied) {
        const posName = typeof pos === 'object' ? pos.name : pos;
        const selected = (val === currentVal) ? 'selected' : '';
        options += `<option value="${val}" ${selected}>${posName}</option>`;
      }
    });
    
    if (options) {
      html += `<optgroup label="${sec.name}">${options}</optgroup>`;
    }
  });

  sel.innerHTML = html;
}

export function openAddModal() {
  s.setEditingId(null);
  
  populateRankSelect();
  buildQualGrid([]);
  
  populateAssignmentDropdown(null);

  document.getElementById('f-name').value = '';
  document.getElementById('f-rank').value = s.branch().ranks[0];
  document.getElementById('f-role').value = '';
  document.getElementById('f-status').value = 'available';
  document.getElementById('f-assign-slot').value = '';
  document.getElementById('f-duty-start').value = '';
  document.getElementById('f-arrived').value = '';
  document.getElementById('f-deros').value = '';
  document.getElementById('f-notes').value = '';
  
  const btnDelete = document.getElementById('btn-delete');
  if (btnDelete) btnDelete.style.display = 'none';
  const btnUnassign = document.getElementById('btn-unassign');
  if (btnUnassign) btnUnassign.style.display = 'none';
  
  document.getElementById('modal-overlay').classList.add('open');
}

export function openModal(id) {
  s.setEditingId(id);
  const p = s.people().find(x=>x.id===id);
  if (p) {
    populateRankSelect();
    buildQualGrid(p.quals || []);
    populateAssignmentDropdown(id);

    document.getElementById('f-name').value = p.name;
    document.getElementById('f-rank').value = p.rank;
    document.getElementById('f-role').value = p.role || '';
    document.getElementById('f-status').value = p.status;
    document.getElementById('f-duty-start').value = p.dutyStart || '';
    document.getElementById('f-arrived').value = p.arrived || '';
    document.getElementById('f-deros').value = p.deros || '';
    document.getElementById('f-notes').value = p.notes || '';

    if (p.section && p.slot !== null) {
      document.getElementById('f-assign-slot').value = `${p.section}:${p.slot}`;
    } else {
      document.getElementById('f-assign-slot').value = '';
    }

    const btnDelete = document.getElementById('btn-delete');
    if (btnDelete) btnDelete.style.display = 'block';
    
    const btnUnassign = document.getElementById('btn-unassign');
    if (btnUnassign) btnUnassign.style.display = p.section ? 'inline-flex' : 'none';

    document.getElementById('modal-overlay').classList.add('open');
  }
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  s.setEditingId(null);
}

export function validateAssignment(person, position) {
  if (typeof position === 'string' || !position.reqQual) return { valid: true };

  const reqQuals = Array.isArray(position.reqQual) 
    ? position.reqQual 
    : (typeof position.reqQual === 'string' ? position.reqQual.split('|') : []);
    
  if (reqQuals.length === 0) return { valid: true };

  const personQuals = person.quals || [];

  for (const q of reqQuals) {
    if (!personQuals.includes(q)) {
      return { valid: false, missing: q };
    }
  }

  return { valid: true };
}

<<<<<<< HEAD
// ══════════════════════════════════════════════════════════════════════════
// 🟢 REMOTE SYNC UI CONTROLS
// ══════════════════════════════════════════════════════════════════════════

export function updateSyncUI(status) {
  const dot = document.getElementById('sync-dot');
  const text = document.getElementById('sync-text');
  if (!dot || !text) return;

  if (status === 'synced') {
    dot.style.background = 'var(--green)';
    text.textContent = 'Synced Live';
  } else if (status === 'syncing' || status === 'connecting') {
    dot.style.background = 'var(--amber)';
    text.textContent = 'Syncing...';
  } else if (status === 'error') {
    dot.style.background = 'var(--red)';
    text.textContent = 'Sync Error';
  } else {
    dot.style.background = 'var(--text3)';
    text.textContent = 'Local Only';
  }
}

export function openSyncModal() {
  const modal = document.getElementById('sync-modal-overlay');
  if (modal) {
    document.getElementById('f-sync-url').value = s.getSavedSyncUrl();
    modal.classList.add('open');
  }
}

export function closeSyncModal() {
  const modal = document.getElementById('sync-modal-overlay');
  if (modal) modal.classList.remove('open');
}

export function connectSync() {
  const url = document.getElementById('f-sync-url').value.trim();
  if (url) {
    s.startSync(url, updateSyncUI);
    closeSyncModal();
    if (window.showToast) window.showToast('Connecting to remote database...', 'info');
  }
}

export function disconnectSync() {
  s.stopSync(updateSyncUI);
  document.getElementById('f-sync-url').value = '';
  closeSyncModal();
  if (window.showToast) window.showToast('Disconnected. Operating on local storage.', 'warn');
}

=======
>>>>>>> b3ce99c4fd54bb6677c627886068b9d35dec23a6
export function savePerson() {
  const name = document.getElementById('f-name').value.trim();
  const rank = document.getElementById('f-rank').value;
  const role = document.getElementById('f-role').value.trim();
  const status = document.getElementById('f-status').value; // e.g., 'deployed'
  const quals = Array.from(document.querySelectorAll('#qual-grid input:checked')).map(el=>el.value);
  const dutyStart = document.getElementById('f-duty-start').value || null;
  const arrived = document.getElementById('f-arrived').value || null;
  const deros = document.getElementById('f-deros').value || null;
  const notes = document.getElementById('f-notes').value || null;
  
  const assignVal = document.getElementById('f-assign-slot')?.value;
  
  if (!name) return; 

  let targetSecId = null;
  let targetSlotIdx = null;

  // 🟢 THE FIX: If their status is set to 'deployed', override any slot assignment 
  // and route them directly to the deployed section container.
  if (status === 'deployed') {
    targetSecId = 'deployed';
    targetSlotIdx = '';
  } 
  // Otherwise, process their slot assignment normally
  else if (assignVal) {
    const [secId, slotIdxStr] = assignVal.split(':');
    targetSecId = secId;
    targetSlotIdx = parseInt(slotIdxStr, 10);
    
    const sec = s.branch().sections.find(x => x.id === targetSecId);
    const targetPosition = sec ? sec.positions[targetSlotIdx] : null;
    
    if (targetPosition) {
      const validation = validateAssignment({ quals: quals }, targetPosition);
      if (!validation.valid) {
        if (window.showToast) {
          window.showToast(`Assignment Blocked: Missing "${validation.missing}" qualification.`, 'error');
        }
        return; 
      }
    }
  }
  
  s.takeSnapshot();
  
  // Apply the target location and data to the person object
  if (s.editingId) {
    const p = s.people().find(x=>x.id===s.editingId);
    if (p) Object.assign(p, {
      name, rank, role, status, quals, dutyStart, arrived, deros, notes, 
      section: targetSecId, slot: targetSlotIdx 
    });
  } else {
    s.branchPeople[s.currentBranch].push({
      id: 'p' + s.nextId, name, rank, role, status, quals, 
      dutyStart, arrived, deros, notes, 
      section: targetSecId, slot: targetSlotIdx
    });
    s.setNextId(s.nextId + 1);
  }
  
  closeModal(); 
  render(); 
  s.saveState();
  if (window.showToast) window.showToast(s.editingId ? 'Personnel Updated' : 'Personnel Added');
}

export function deletePerson() {
  if (!s.editingId) return;
  s.takeSnapshot();
  s.setPeople(s.people().filter(p=>p.id!==s.editingId));
  closeModal(); 
  render(); 
  s.saveState();
  showToast('Personnel Removed', 'error');
}

export function unassignPerson() {
  if (!s.editingId) return;
  const p = s.people().find(p=>p.id===s.editingId);
  if (p) { 
    p.section = null; 
    p.slot = null; 
    render(); 
    s.saveState(); 
  }
  closeModal();
}

let searchQuery = '';
export function onSearch(val) {
  searchQuery = val.trim().toLowerCase();
  applySearch();
}
export function clearSearch() {
  const sInp = document.getElementById('search-input');
  if (sInp) sInp.value = '';
  onSearch('');
}
export function applySearch() {
  if (!searchQuery) {
    document.querySelectorAll('.person-card').forEach(el => el.classList.remove('dimmed'));
    return;
  }
  document.querySelectorAll('.person-card[data-id]').forEach(el => {
    const pid = el.dataset.id;
    const p = s.people().find(x=>x.id===pid);
    if (!p) return;
    const hay = `${p.name} ${p.rank} ${p.role || ''} ${(p.quals || []).join(' ')} ${p.notes||''}`.toLowerCase();
    el.classList.toggle('dimmed', !hay.includes(searchQuery));
  });
}

document.getElementById('modal-overlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') {
    closeModal();
    closeConfigPosModal();
  }
});

export function toggleDerosPanel() {
  const panel = document.getElementById('deros-panel');
  if (panel) {
    const isOpen = panel.classList.toggle('open');
    if (isOpen) renderDerosPanel();
  }
}

export function renderDeployed() {
  // Filter for people who are explicitly marked as deployed
  let deployed = (s.people() || []).filter(p => p.section === 'deployed');
  
  // Render the cards
  const drop = document.getElementById('deployed-drop');
  if (drop) drop.innerHTML = deployed.map(p => buildPersonCard(p)).join('');
  
  // Update the live counter
  const countEl = document.getElementById('deployed-count');
  if (countEl) countEl.textContent = deployed.length;
}

export function renderDerosPanel() {
  const now = new Date();
  const ps = s.people()
    .filter(p=>p.deros)
    .map(p => {
      const days = Math.round((new Date(p.deros+'T00:00:00') - now) / 86400000);
      return {...p, days};
    })
    .filter(p=>p.days < 365)
    .sort((a,b)=>a.days-b.days);

  const sec = id => s.branch().sections.find(x=>x.id===id);
  const dList = document.getElementById('deros-list');
  if (dList) {
    dList.innerHTML = ps.length === 0
      ? '<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:8px">// no rotations within 12 months</div>'
      : ps.map(p => {
          const cls = p.days < 60 ? 'urgent' : p.days < 180 ? 'soon' : '';
          const secName = p.section ? (sec(p.section)?.name || '—') : 'Unassigned';
          const daysLabel = p.days < 0 ? `${Math.abs(p.days)}d overdue` : `${p.days}d remaining`;
          const col = p.days < 60 ? 'var(--red)' : p.days < 180 ? 'var(--amber)' : 'var(--text2)';
          return `<div class="deros-row ${cls}" ondblclick="window.openModal('${p.id}')">
            <div class="deros-name">${p.rank} ${p.name}</div>
            <div class="deros-meta">${secName} · ${p.role || ''}</div>
            <div class="deros-days" style="color:${col}">${daysLabel}</div>
          </div>`;
        }).join('');
  }
}

export function toggleUnitNameEdit() {
  if (s.currentUserRole !== 'admin') return; // Security Check
  const input = document.getElementById('unit-name');
  const icon = document.getElementById('lock-icon');
  
  if (!input || !icon) return;

  const isLocked = input.hasAttribute('readonly');

  if (isLocked) {
    input.removeAttribute('readonly');
    input.focus();
    icon.innerHTML = `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>`;
  } else {
    input.setAttribute('readonly', 'true');
    input.blur();
    s.saveState();
    icon.innerHTML = `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`;
  }
}

const unitNameInput = document.getElementById('unit-name');
if (unitNameInput) {
  unitNameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      toggleUnitNameEdit();
    }
  });
}

// ══════════════════════════════════════════════
// 🟢 BOOT SEQUENCE & LOGIN LOGIC
// ══════════════════════════════════════════════
window.document.addEventListener('DOMContentLoaded', async () => {
  if (s.checkSession()) {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.remove('open');
    await initializeApp();
  } else {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('open');
  }
});

async function initializeApp() {
  await s.loadState();
  
  const unitNameInput = document.getElementById('unit-name');
  if (unitNameInput && !unitNameInput.value) {
    unitNameInput.value = "31st Munitions Squadron";
  }

  const _b = s.branch();
  document.documentElement.style.setProperty('--accent', _b.color);
  
  const branchBadge = document.getElementById('branch-badge');
  if (branchBadge) branchBadge.textContent = _b.label;
  
  const headerTitle = document.getElementById('header-title');
  if (headerTitle) {
    headerTitle.textContent = `${unitNameInput ? unitNameInput.value : _b.unitTerm} Manning Board`;
  }

  // Hide Admin-Only global controls if standard user
  if (s.currentUserRole !== 'admin') {
    const resetBtn = document.querySelector('button[onclick="window.clearState()"]');
    if (resetBtn) resetBtn.style.display = 'none';
    
    const addSectionBtn = document.querySelector('button[onclick="window.addSection()"]');
    if (addSectionBtn) addSectionBtn.style.display = 'none';

    if (unitNameInput) {
      unitNameInput.setAttribute('readonly', 'true');
      const lockIcon = document.getElementById('lock-icon');
      if (lockIcon) lockIcon.style.display = 'none';
    }
  }
  
  render();
}

window.attemptLogin = async function() {
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  
  if (s.login(u, p)) {
    if (err) err.style.display = 'none';
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.remove('open');
    await initializeApp();
  } else {
    if (err) err.style.display = 'block';
  }
};

// ══════════════════════════════════════════════
// GLOBAL WINDOW BINDINGS
// ══════════════════════════════════════════════
window.importCSV = importCSV;
window.executeExport = executeExport;
window.toggleExportMenu = toggleExportMenu;
window.downloadCSVTemplate = downloadCSVTemplate;
window.exportPDF = exportPDF; 
window.clearState = s.clearState;

window.openConfigPosModal = openConfigPosModal;
window.closeConfigPosModal = closeConfigPosModal;
window.loadCurrentPositionQual = loadCurrentPositionQual;
window.savePositionQualRequirement = savePositionQualRequirement;
window.toggleQualDropdown = toggleQualDropdown;
window.toggleUnitNameEdit = toggleUnitNameEdit;
window.saveState = s.saveState;

window.openAddModal = openAddModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.savePerson = savePerson;
window.deletePerson = deletePerson;
window.unassignPerson = unassignPerson;

window.onSearch = onSearch;
window.clearSearch = clearSearch;
window.validateAssignment = validateAssignment;
window.addSection = addSection;
window.deleteSection = deleteSection;
window.renameSlot = renameSlot;
window.changeSlots = changeSlots;
window.setRequired = setRequired;

window.toggleDerosPanel = toggleDerosPanel;
window.renderPool = renderPool;

window.logout = s.logout;
window.render = render;
window.showToast = showToast;
window.toggleWhatIfMode = toggleWhatIfMode;
window.commitWhatIf = commitWhatIf;
window.cancelWhatIf = cancelWhatIf;
window.undo = () => {
  const success = s.undo();
  if (success) {
    render(); // 🟢 THE FIX: Force the board to redraw
    if (window.showToast) window.showToast('Undo successful', 'info');
  } else {
    if (window.showToast) window.showToast('Nothing to undo', 'warn');
  }
<<<<<<< HEAD
};

window.updateSyncUI = updateSyncUI;
window.openSyncModal = openSyncModal;
window.closeSyncModal = closeSyncModal;
window.connectSync = connectSync;
window.disconnectSync = disconnectSync;

// Auto-start sync if a URL was previously saved
window.addEventListener('DOMContentLoaded', () => {
  const savedUrl = s.getSavedSyncUrl();
  if (savedUrl) s.startSync(savedUrl, updateSyncUI);
});
=======
};
>>>>>>> b3ce99c4fd54bb6677c627886068b9d35dec23a6
