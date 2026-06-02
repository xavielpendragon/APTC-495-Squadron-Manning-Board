import { branchPeople, currentBranch, branch, people, nextId, setNextId, saveState, takeSnapshot } from './state.js';
import { BRANCHES } from './config.js';

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
  let result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '"') {
      inQuotes = !inQuotes;
    } else if (str[i] === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += str[i];
    }
  }
  result.push(cur.trim());
  return result;
}

export function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) {
    if (window.showToast) window.showToast('CSV is empty or invalid format', 'error');
    return;
  }

  const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase().trim());
  const importedPeople = [];
  let currentId = nextId; 
  
  const secs = BRANCHES[currentBranch].sections;
  const currentBoardPeople = branchPeople[currentBranch] || [];

  for (let i = 1; i < lines.length; i++) {
    let fields = parseCSVRow(lines[i]);
    let person = { id: 'p' + currentId++ };
    let sectionName = '';

    // Map CSV columns to person data
    headers.forEach((h, idx) => {
      let val = fields[idx] || '';
      if (h === 'name') person.name = val;
      else if (h === 'rank') person.rank = val;
      else if (h === 'role') person.role = val;
      else if (h === 'status') person.status = val.toLowerCase();
      else if (h === 'quals') person.quals = val ? val.split('|').map(q => q.trim()) : [];
      else if (h === 'notes') person.notes = val;
      else if (h === 'dutystart') person.dutyStart = val;
      else if (h === 'arrived') person.arrived = val;
      else if (h === 'deros') person.deros = val;
      else if (h === 'section') sectionName = val.trim(); // 🟢 Capture section column
    });
    
    // ═════════════════════════════════════════════════════════════════
    // 🟢 DYNAMIC SECTION ASSIGNMENT & CREATION
    // ═════════════════════════════════════════════════════════════════
    if (sectionName) {
       if (sectionName.toLowerCase() === 'deployed') {
          person.section = 'deployed';
          person.status = 'deployed';
       } else if (sectionName.toLowerCase() === 'pool' || sectionName.toLowerCase() === 'unassigned') {
          person.section = '';
       } else {
          // Look for an existing section with this name
          let existingSec = secs.find(s => s.name.toLowerCase() === sectionName.toLowerCase());
          
          // If it doesn't exist, create it dynamically!
          if (!existingSec) {
             const newSecId = 'sec_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
             existingSec = {
                id: newSecId,
                name: sectionName,
                required: 1,
                positions: ['Open Slot']
             };
             secs.push(existingSec); // Add to the board's configuration
          }
          
          person.section = existingSec.id;
          
          // Figure out which slot number to put them in
          const existingOccupants = currentBoardPeople.filter(p => p.section === existingSec.id).length;
          const importedOccupants = importedPeople.filter(p => p.section === existingSec.id).length;
          const totalOccupants = existingOccupants + importedOccupants;
          
          // If the section is full, automatically generate a new slot so they have a place to sit
          if (existingSec.positions.length <= totalOccupants) {
              existingSec.positions.push('Open Slot');
              existingSec.required = existingSec.positions.length; // Scale auth strength automatically
          }
          
          person.slot = totalOccupants;
       }
    } else {
       person.section = ''; // Send to Unassigned Pool if blank
    }

    if (!person.status) person.status = 'available';
    importedPeople.push(person);
  }

  // ═════════════════════════════════════════════════════════════════
  // 🟢 SAVE & RENDER
  // ═════════════════════════════════════════════════════════════════
  takeSnapshot();
  if (!branchPeople[currentBranch]) branchPeople[currentBranch] = [];
  branchPeople[currentBranch].push(...importedPeople);
  
  setNextId(currentId);
  saveState();

  if (window.render) window.render();
  if (window.showToast) window.showToast(`Imported ${importedPeople.length} personnel`, 'success');
}

export function executeExport(format) {
  if (format === 'csv') {
    const ps = branchPeople[currentBranch] || [];
    
    // 🟢 1. Add 'section' to the header row
    let csvContent = "name,rank,role,status,quals,notes,dutyStart,arrived,deros,section\n";
    
    ps.forEach(p => {
      // 🟢 2. Translate internal section ID to the readable Section Name
      let secName = '';
      if (p.section && p.section !== 'pool' && p.section !== 'deployed') {
        const secObj = BRANCHES[currentBranch].sections.find(s => s.id === p.section);
        if (secObj) secName = secObj.name;
      } else if (p.section === 'deployed') {
        secName = 'Deployed';
      }

      const row = [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        p.rank || '',
        `"${(p.role || '').replace(/"/g, '""')}"`,
        p.status || 'available',
        `"${(p.quals || []).join('|')}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
        p.dutyStart || '',
        p.arrived || '',
        p.deros || '',
        `"${secName}"` // 🟢 3. Append to the row
      ];
      csvContent += row.join(',') + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `manning_board_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.showToast) window.showToast('CSV Exported Successfully', 'info');
    return;
  }
  
  // ... [Leave your existing PDF export logic alone down here] ...
}

export function downloadCSVTemplate() {
  const header = "name,rank,role,status,quals,notes,dutyStart,arrived,deros,section\n";
  const sample = '"Doe, John",SSgt,2W051 Muns Systems,available,Crew Chief|Task Certified,None,2024-01-01,2024-01-01,2027-01-01,Command & Staff\n';
  const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "manning_board_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
      const sanitizedUnitName = currentUnitName.trim().replace(/[^a-z0-9_-]/gi, '_');

      const totalReq = b.sections.reduce((a, s) => a + s.required, 0);
      const m = {
        total: ps.length, 
        deployed: ps.filter(p=>p.status==='deployed').length,
        tdy: ps.filter(p=>p.status==='tdy').length, 
        leave: ps.filter(p=>p.status==='leave').length,
        medical: ps.filter(p=>p.status==='medical').length, 
        filled: ps.filter(p=>p.section).length,
        readiness: totalReq > 0 ? Math.round((ps.filter(p=>p.section).length / totalReq) * 100) : 0,
        totalReq: totalReq
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