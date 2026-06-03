import { branchPeople, currentBranch, branch, people, nextId, setNextId, saveState, takeSnapshot } from './state.js';
import { BRANCHES } from './config.js';
import { calculateBoardMetrics, calculateSectionMetrics } from './metrics.js';

function cleanCSVValue(value) {
  const val = String(value || '').trim();
  return val.toLowerCase() === 'none' ? '' : val;
}

function parseQuals(value) {
  const val = cleanCSVValue(value);
  if (!val) return [];

  return val
    .split('|')
    .map(q => q.trim())
    .filter(Boolean);
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function importCSV(inputElement) {
  const file = inputElement.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    parseCSV(text);
    inputElement.value = ''; 
  };
  reader.readAsText(file);
}

export function parseCSVRow(str) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const next = str[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }

  result.push(cur.trim());
  return result;
}

export function parseCSV(text) {
  const lines = text
    .replace(/^\uFEFF/, '') // remove hidden BOM if present
    .split(/\r?\n/)
    .filter(line => line.trim() !== '');

  if (lines.length < 2) {
    if (window.showToast) {
      window.showToast('CSV is empty or invalid format', 'error');
    }
    return;
  }

  function normalizeHeader(header) {
    return String(header || '')
      .replace(/^\uFEFF/, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
  }

  function getHeaderKey(header) {
    const h = normalizeHeader(header);

    const aliases = {
      name: 'name',
      fullname: 'name',
      personnel: 'name',

      rank: 'rank',
      grade: 'rank',
      paygrade: 'rank',
      paygrades: 'rank',

      role: 'role',
      dutytitle: 'role',
      afsc: 'role',
      afscdutytitle: 'role',
      positiontitle: 'role',

      status: 'status',

      quals: 'quals',
      qualifications: 'quals',
      qualification: 'quals',

      notes: 'notes',
      note: 'notes',

      dutystart: 'dutyStart',
      dutystartdate: 'dutyStart',

      arrived: 'arrived',
      arrival: 'arrived',
      arrivaldate: 'arrived',

      deros: 'deros',
      derosdate: 'deros',

      section: 'section',
      sectionname: 'section',
      assignedsection: 'section',
      assignedto: 'section',

      position: 'position',
      slot: 'position',
      billet: 'position',
      requirement: 'position',
      rankrequirement: 'position'
    };

    return aliases[h] || h;
  }

  function normalizeSectionName(value) {
    return cleanCSVValue(value).trim();
  }

  function normalizePositionName(value) {
    const cleaned = cleanCSVValue(value).trim();
    return cleaned || 'Open Slot';
  }

  function makeSectionId(name) {
    const base = String(name || 'section')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    let id = base ? `sec_${base}` : `sec_${Date.now()}`;
    let counter = 1;

    while (sections.some(sec => sec.id === id)) {
      id = `${base}_${counter++}`;
    }

    return id;
  }

  function getPositionLabel(pos) {
    if (typeof pos === 'object' && pos !== null) {
      return pos.name || 'Open Slot';
    }

    return pos || 'Open Slot';
  }

  function setPositionLabel(sec, slotIndex, label) {
    const current = sec.positions[slotIndex];

    if (typeof current === 'object' && current !== null) {
      sec.positions[slotIndex] = {
        ...current,
        name: label
      };
    } else {
      sec.positions[slotIndex] = label;
    }
  }

  const headers = parseCSVRow(lines[0]).map(getHeaderKey);

  const importedPeople = [];
  let currentId = nextId;

  const activeBranch = BRANCHES[currentBranch];

  if (!activeBranch) {
    if (window.showToast) {
      window.showToast('Current branch configuration not found.', 'error');
    }
    return;
  }

  if (!Array.isArray(activeBranch.sections)) {
    activeBranch.sections = [];
  }

  const sections = activeBranch.sections;
  const currentBoardPeople = branchPeople[currentBranch] || [];

  function getOrCreateSection(sectionName) {
    const cleanedName = normalizeSectionName(sectionName);

    if (!cleanedName) return null;

    let existingSec = sections.find(sec =>
      String(sec.name || '').trim().toLowerCase() === cleanedName.toLowerCase()
    );

    if (!existingSec) {
      existingSec = {
        id: makeSectionId(cleanedName),
        name: cleanedName,
        required: 0,
        positions: []
      };

      sections.push(existingSec);
    }

    if (!Array.isArray(existingSec.positions)) {
      existingSec.positions = [];
    }

    existingSec.required = Number(existingSec.required) || existingSec.positions.length || 0;

    return existingSec;
  }

  function getOccupiedSlots(sectionId) {
    const occupied = new Set();

    currentBoardPeople.forEach(p => {
      if (
        p.section === sectionId &&
        p.slot !== '' &&
        p.slot !== null &&
        p.slot !== undefined
      ) {
        occupied.add(Number(p.slot));
      }
    });

    importedPeople.forEach(p => {
      if (
        p.section === sectionId &&
        p.slot !== '' &&
        p.slot !== null &&
        p.slot !== undefined
      ) {
        occupied.add(Number(p.slot));
      }
    });

    return occupied;
  }

  function findOrCreateSlot(sec, positionName) {
    const occupied = getOccupiedSlots(sec.id);
    const normalizedPosition = positionName.trim().toLowerCase();

    // 1. Prefer an unoccupied existing slot with the same position/rank label.
    for (let i = 0; i < sec.positions.length; i++) {
      const label = getPositionLabel(sec.positions[i]).trim().toLowerCase();

      if (!occupied.has(i) && label === normalizedPosition) {
        return i;
      }
    }

    // 2. Use the first unoccupied Open slot.
    for (let i = 0; i < sec.positions.length; i++) {
      const label = getPositionLabel(sec.positions[i]).trim().toLowerCase();

      if (
        !occupied.has(i) &&
        (!label || label === 'open' || label === 'open slot')
      ) {
        setPositionLabel(sec, i, positionName);
        return i;
      }
    }

    // 3. Create a new slot if the section is full or no matching slot exists.
    sec.positions.push(positionName);
    sec.required = sec.positions.length;

    return sec.positions.length - 1;
  }

  // Take snapshot BEFORE modifying people/sections.
  takeSnapshot();

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVRow(lines[i]);

    const person = {
      id: 'p' + currentId++,
      name: '',
      rank: '',
      role: '',
      status: 'available',
      quals: [],
      notes: '',
      dutyStart: '',
      arrived: '',
      deros: '',
      section: '',
      slot: ''
    };

    let sectionName = '';
    let positionName = '';

    headers.forEach((h, idx) => {
      const rawVal = fields[idx] || '';
      const val = cleanCSVValue(rawVal);

      if (h === 'name') person.name = val;
      else if (h === 'rank') person.rank = val;
      else if (h === 'role') person.role = val;
      else if (h === 'status') person.status = val.toLowerCase() || 'available';
      else if (h === 'quals') person.quals = parseQuals(rawVal);
      else if (h === 'notes') person.notes = val;
      else if (h === 'dutyStart') person.dutyStart = val;
      else if (h === 'arrived') person.arrived = val;
      else if (h === 'deros') person.deros = val;
      else if (h === 'section') sectionName = val;
      else if (h === 'position') positionName = val;
    });

    sectionName = normalizeSectionName(sectionName);
    positionName = normalizePositionName(positionName);

    if (!person.name) {
      continue;
    }

    if (!person.status) {
      person.status = 'available';
    }

    const lowerSection = sectionName.toLowerCase();

    if (!sectionName || lowerSection === 'pool' || lowerSection === 'unassigned') {
      person.section = '';
      person.slot = '';
    } else if (lowerSection === 'deployed') {
      person.section = 'deployed';
      person.slot = '';
      person.status = 'deployed';
    } else {
      const sec = getOrCreateSection(sectionName);

      if (sec) {
        const slotIndex = findOrCreateSlot(sec, positionName);

        person.section = sec.id;
        person.slot = slotIndex;

        sec.required = Math.max(
          Number(sec.required) || 0,
          sec.positions.length
        );
      }
    }

    importedPeople.push(person);
  }

  if (!branchPeople[currentBranch]) {
    branchPeople[currentBranch] = [];
  }

  branchPeople[currentBranch].push(...importedPeople);

  setNextId(currentId);
  saveState();

  if (window.render) {
    window.render();
  }

  if (window.showToast) {
    window.showToast(
      `Imported ${importedPeople.length} personnel and updated ${sections.length} sections`,
      'success'
    );
  }
}

export function executeExport(format) {
  if (format === 'csv') {
    const ps = branchPeople[currentBranch] || [];
    const sections = BRANCHES[currentBranch]?.sections || [];
    let csvContent = "name,rank,role,status,quals,notes,dutyStart,arrived,deros,section,position\n";
    ps.forEach(p => {
      let secName = '';
      let positionName = '';
      if (p.section && p.section !== 'pool' && p.section !== 'deployed') {
        const secObj = sections.find(s => s.id === p.section);
        if (secObj) {
          secName = secObj.name;
          if (p.slot !== '' && p.slot !== null && p.slot !== undefined) {
            const slot = secObj.positions[Number(p.slot)];
            if (typeof slot === 'object' && slot !== null) {
              positionName = slot.name || '';
            } else {
              positionName = slot || '';
            }
          }
        }
      } else if (p.section === 'deployed') {
        secName = 'Deployed';
      } else {
        secName = 'Unassigned';
      }
      const row = [
        csvEscape(p.name || ''),
        csvEscape(p.rank || ''),
        csvEscape(p.role || ''),
        csvEscape(p.status || 'available'),
        csvEscape((p.quals || []).join('|')),
        csvEscape(p.notes || ''),
        csvEscape(p.dutyStart || ''),
        csvEscape(p.arrived || ''),
        csvEscape(p.deros || ''),
        csvEscape(secName),
        csvEscape(positionName)
      ];
      csvContent += row.join(',') + "\n";
    });
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `manning_board_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (window.showToast) {
      window.showToast('CSV Exported Successfully', 'info');
    }
    return;
  }
  if (format === 'pdf') {
    exportPDF();
    return;
  }
  if (window.showToast) {
    window.showToast(`Unsupported export format: ${format}`, 'error');
  }
}

export function downloadCSVTemplate() {
  const header = "name,rank,role,status,quals,notes,dutyStart,arrived,deros,section,position\n";
  const sample =
    '"Doe, John",SSgt,2W051 Muns Systems,available,Crew Chief|Task Certified,None,2024-01-01,2024-01-01,2027-01-01,Weapons Mx,E5\n';
  const blob = new Blob([header + sample], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "manning_board_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function toggleExportMenu() {
   // Empty hook
}

export function exportPDF() {
  if (!window.jspdf) { 
    if (window.showToast) window.showToast('PDF library loading, try again'); 
    return; 
  }
  
  const btn = document.getElementById('export-btn');
  if (btn) {
    btn.querySelector('span').textContent = 'Generating…';
    btn.disabled = true;
  }
  
  setTimeout(() => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
      const W=297, H=210;
      
      const b = branch();
      const ps = people();

      const currentUnitName = document.getElementById('unit-name')?.value || "31st Munitions Squadron";

      const sanitizedUnitName = currentUnitName
        .trim()
        .replace(/[^a-z0-9_-]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '') || 'manning_board';
      const boardMetrics = calculateBoardMetrics(b, ps);

      const m = {
        total: boardMetrics.totalPersonnel,
        deployed: boardMetrics.deployed,
        tdy: boardMetrics.tdy,
        leave: boardMetrics.leave,
        medical: boardMetrics.medical,
        filled: boardMetrics.assignedCount,
        readiness: boardMetrics.readinessPct,
        manned: boardMetrics.mannedPct,
        totalReq: boardMetrics.totalAuthorized
      };

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
      const timeStr = now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

      function hexToRgb(hex) {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), bl = parseInt(hex.slice(5,7),16);
        return [r,g,bl];
      }
      const [ar,ag,abl] = hexToRgb(b.color);

      // Header bar
      doc.setFillColor(13,15,18); doc.rect(0,0,W,20,'F');
      doc.setFillColor(ar,ag,abl); doc.rect(0,18,W,2,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
      doc.text(`${currentUnitName.toUpperCase()} — ${b.id.toUpperCase()} MANNING BOARD`, 14, 12);
      
      doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(180,185,200);
      doc.text(`Generated: ${dateStr} at ${timeStr}`, W-14, 9, {align:'right'});
      doc.text('UNCLASSIFIED // FOR OFFICIAL USE ONLY', W-14, 14, {align:'right'});

      // ══════════════════════════════════════════════
      // FIXED: DYNAMIC METRICS BOXES (Scaled Typography)
      // ══════════════════════════════════════════════
      const rColor = m.readiness>=80?[34,197,94]:m.readiness>=60?[245,158,11]:[239,68,68];
      const mboxes = [
        {label:'TOTAL', val:String(m.total), sub:`${ps.filter(p=>p.section).length} assigned`},
        {label:'READINESS', val:m.readiness+'%', sub:`${m.filled}/${m.totalReq} filled`, color:rColor},
        {label:'OPS (DEP/TDY)', val:`${m.deployed} / ${m.tdy}`, sub:'Deployed / TDY', color:[239,68,68]},
        {label:'ADMIN (LV/MED)', val:`${m.leave} / ${m.medical}`, sub:'Leave / Medical', color:[168,85,247]},
      ];
      const bw=62,bh=26,bx=14,by=25,gap=5; // Slightly taller box bounds to give room for bigger text
      mboxes.forEach((box,i) => {
        const x=bx+i*(bw+gap);
        doc.setFillColor(28,32,48); doc.roundedRect(x,by,bw,bh,2,2,'F');
        
        // Main Labels: TOTAL, READINESS, OPS (DEP/TDY), ADMIN (LV/MED) -> Set to 8.5pt
        doc.setFontSize(8.5); doc.setFont('helvetica','bold'); doc.setTextColor(170,175,195);
        doc.text(box.label, x+5, by+7);
        
        // Large Numbers
        const [r,g,bl]=box.color||[255,255,255];
        doc.setTextColor(r,g,bl); doc.setFontSize(22); doc.setFont('helvetica','bold');
        doc.text(box.val, x+5, by+17);
        
        // Sub-Labels: assigned, filled, Deployed / TDY, Leave / Medical -> Set to 8pt
        doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(150,155,175);
        doc.text(box.sub, x+5, by+23);
      });

      // ══════════════════════════════════════════════
      // FIXED: SECTION TABLE HEADER (High Contrast Dark Slate)
      // ══════════════════════════════════════════════
      let ty=60;
      doc.setFontSize(11); doc.setFont('helvetica','bold'); 
      doc.setTextColor(20,24,35); // Pure dark slate tone for visibility on light/white background canvas
      doc.text('Section Manning Summary', 14, ty-2.5);
      
      const sCols=['Section','Req','Filled','Avail','TDY','Leave','Med','Dep','Fill %'];
      const sW=[50,18,18,18,18,18,18,18,22]; 
      const rh=9; 
      
      doc.setFillColor(35,40,55); doc.rect(14,ty,W-28,rh,'F');
      doc.setTextColor(235,240,255); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
      let cx=14; sCols.forEach((c,i)=>{doc.text(c,cx+3,ty+6);cx+=sW[i];});
      
      b.sections.forEach((sec,si) => {
        const inSec=ps.filter(p=>p.section===sec.id);
        const avail=inSec.filter(p=>p.status==='available').length;
        const tdy=inSec.filter(p=>p.status==='tdy').length;
        const dep=inSec.filter(p=>p.status==='deployed').length;
        const leave=inSec.filter(p=>p.status==='leave').length;
        const med=inSec.filter(p=>p.status==='medical').length;
        const pct=Math.round((inSec.length/sec.required)*100);
        const ry=ty+rh+(si*rh);
        
        doc.setFillColor(si%2===0?20:24,si%2===0?23:27,si%2===0?35:42);
        doc.rect(14,ry,W-28,rh,'F');
        
        const sc=pct>=80?[34,197,94]:pct>=50?[245,158,11]:[239,68,68];
        const row=[sec.name,sec.required,inSec.length,avail,tdy,leave,med,dep,pct+'%']; 
        
        cx=14;
        row.forEach((v,ci)=>{
          doc.setTextColor(ci===8?sc[0]:245,ci===8?sc[1]:245,ci===8?sc[2]:245);
          doc.setFontSize(8.5); doc.setFont('helvetica',ci===0?'bold':'normal');
          doc.text(String(v),cx+3,ry+6); cx+=sW[ci];
        });
        doc.setDrawColor(40,45,65); doc.setLineWidth(0.3);
        doc.line(14,ry+rh,W-14,ry+rh);
      });

      // ══════════════════════════════════════════════
      // FIXED: PERSONNEL ROSTER HEADER (High Contrast Dark Slate)
      // ══════════════════════════════════════════════
      const rosterY = ty + rh * (b.sections.length + 1) + 12;
      doc.setFontSize(11); doc.setFont('helvetica','bold'); 
      doc.setTextColor(20,24,35); // Pure dark slate tone for visibility on light/white background canvas
      doc.text('Full Personnel Roster', 14, rosterY-2.5);
      doc.setDrawColor(ar,ag,abl); doc.setLineWidth(0.5);
      doc.line(14,rosterY,W-14,rosterY);
      
      const rCols=['Name','Rank',b.roleLabel,'Section','Position','Status','Duty Start','DEROS','Notes'];
      const rW=[38, 14, 40, 32, 34, 22, 22, 22, 45]; 
      const rY=rosterY+3;
      const rowH=9; 
      const pageBottom=H-15;

      function drawRosterHeader(yPos) {
        doc.setFillColor(35,40,55); doc.rect(14,yPos,W-28,8,'F');
        doc.setTextColor(235,240,255); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
        let cx=14; rCols.forEach((c,i)=>{doc.text(c,cx+2,yPos+5.5);cx+=rW[i];});
      }
      
      drawRosterHeader(rY);
      let curY = rY+8;
      let pageNum = 1;

      ps.forEach((p,pi) => {
        if (curY+rowH > pageBottom) {
          doc.addPage();
          pageNum++;
          doc.setFillColor(13,15,18); doc.rect(0,0,W,16,'F');
          doc.setFillColor(ar,ag,abl); doc.rect(0,15,W,1,'F');
          doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont('helvetica','bold');
          doc.text(`${currentUnitName.toUpperCase()} — MANNING BOARD (cont.)`, 14, 10);
          doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(180,185,200);
          doc.text(`Page ${pageNum}`, W-14, 10, {align:'right'});
          curY = 22;
          drawRosterHeader(curY);
          curY += 8;
        }
        
        const sec=b.sections.find(s=>s.id===p.section);
        const slotName=sec&&p.slot!=null?sec.positions[p.slot]:'—';
        const actualSlotName = typeof slotName === 'object' ? slotName.name : slotName;
        
        doc.setFillColor(pi%2===0?20:24,pi%2===0?23:27,pi%2===0?35:42);
        doc.rect(14,curY,W-28,rowH,'F');
        
        const statusColors = {deployed: [248, 113, 113],tdy: [251, 191, 36],leave: [192, 132, 252],medical: [56, 189, 248]};
        const sc = statusColors[p.status] || [240, 240, 245];
        const fmt=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'}):'—';
        
        const row=[p.name, p.rank, p.role, sec?sec.name:'Unassigned', actualSlotName, p.status.toUpperCase(), fmt(p.dutyStart), fmt(p.deros), (p.notes||'—')];
        
        let cx=14;
        row.forEach((v,ci)=>{
          doc.setTextColor(ci===5?sc[0]:240,ci===5?sc[1]:240,ci===5?sc[2]:240); 
          doc.setFontSize(8); doc.setFont('helvetica',ci===0?'bold':'normal');
          
          let tv=String(v); 
          const maxW=rW[ci]-3;
          while(doc.getTextWidth(tv)>maxW && tv.length>3) tv=tv.slice(0,-2)+'…';
          
          doc.text(tv,cx+2,curY+6); cx+=rW[ci];
        });
        
        doc.setDrawColor(40,45,65); doc.setLineWidth(0.3);
        doc.line(14,curY+rowH,W-14,curY+rowH);
        curY += rowH;
      });

      const totalPages = doc.getNumberOfPages();
      for (let pg=1; pg<=totalPages; pg++) {
        doc.setPage(pg);
        doc.setFillColor(13,15,18); doc.rect(0,H-10,W,10,'F');
        doc.setTextColor(150,155,175); doc.setFontSize(8); doc.setFont('helvetica','normal');
        doc.text('UNCLASSIFIED // FOR OFFICIAL USE ONLY',W/2,H-4,{align:'center'});
        doc.text(`Page ${pg} of ${totalPages}`,W-14,H-4,{align:'right'});
        if (pg===1 && currentUnitName) doc.text(currentUnitName, 14, H-4);
      }

      doc.save(`${sanitizedUnitName}_manning_board_${now.toISOString().slice(0,10)}.pdf`);
      if (window.showToast) window.showToast('PDF exported successfully');
    } catch(e) {
      console.error(e); 
      if (window.showToast) window.showToast('Export failed — check console', 'error');
    }
    
    if (btn) {
      btn.querySelector('span').textContent = 'Export PDF';
      btn.disabled = false;
    }
  }, 100);
}

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}