// ══════════════════════════════════════════════════════════════════════════
// Centralized manning/readiness calculations used by dashboard, sections, alerts,
// and exports so percentages stay consistent across the app.
// ══════════════════════════════════════════════════════════════════════════

export function normalizeStatus(person) {
  return String(person?.status || 'available').trim().toLowerCase();
}

export function isRealSectionAssignment(person) {
  return Boolean(
    person &&
    person.section &&
    person.section !== 'pool' &&
    person.section !== 'deployed'
  );
}

export function isAvailable(person) {
  return normalizeStatus(person) === 'available';
}

export function isDeployed(person) {
  return normalizeStatus(person) === 'deployed' || person?.section === 'deployed';
}

export function calculateBoardMetrics(branch, people) {
  const sections = branch?.sections || [];
  const ps = people || [];

  const totalAuthorized = sections.reduce(
    (sum, sec) => sum + (Number(sec.required) || 0),
    0
  );

  const assigned = ps.filter(isRealSectionAssignment);
  const availableAssigned = assigned.filter(isAvailable);

  return {
    totalPersonnel: ps.length,
    totalAuthorized,
    assignedCount: assigned.length,
    availableCount: availableAssigned.length,
    deployed: ps.filter(isDeployed).length,
    tdy: ps.filter(p => normalizeStatus(p) === 'tdy').length,
    leave: ps.filter(p => normalizeStatus(p) === 'leave').length,
    medical: ps.filter(p => normalizeStatus(p) === 'medical').length,
    mannedPct: totalAuthorized > 0
      ? Math.round((assigned.length / totalAuthorized) * 100)
      : 0,
    readinessPct: totalAuthorized > 0
      ? Math.round((availableAssigned.length / totalAuthorized) * 100)
      : 0
  };
}

export function calculateSectionMetrics(section, people) {
  const ps = people || [];
  const assigned = ps.filter(p => p.section === section.id);
  const available = assigned.filter(isAvailable);
  const authorized = Number(section.required) || 0;
  const slotCount = Array.isArray(section.positions) ? section.positions.length : 0;

  return {
    assignedCount: assigned.length,
    availableCount: available.length,
    authorized,
    slotCount,
    mannedPct: authorized > 0
      ? Math.round((assigned.length / authorized) * 100)
      : 0,
    readinessPct: authorized > 0
      ? Math.round((available.length / authorized) * 100)
      : 0
  };
}