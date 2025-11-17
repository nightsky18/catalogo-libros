// src/utils/formatters.js
export const formatIsbn = (v = '') => {
  const raw = String(v).replace(/[-\s]/g, '').toUpperCase();
  if (!raw) return 'N/A';

  // ISBN-13
  if (/^\d{13}$/.test(raw)) {
    // Heurística España/Latam (grupo 84)
    if ((raw.startsWith('978') || raw.startsWith('979')) && raw.slice(3,5) === '84') {
      return `${raw.slice(0,3)}-${raw.slice(3,5)}-${raw.slice(5,8)}-${raw.slice(8,12)}-${raw.slice(12)}`;
    }
    // Fallback genérico 3-1-4-4-1
    return `${raw.slice(0,3)}-${raw.slice(3,4)}-${raw.slice(4,8)}-${raw.slice(8,12)}-${raw.slice(12)}`;
  }

  // ISBN-10 (X permitida)
  if (/^\d{9}[\dX]$/.test(raw)) {
    // Patrón 1-3-5-1
    return `${raw.slice(0,1)}-${raw.slice(1,4)}-${raw.slice(4,9)}-${raw.slice(9)}`;
  }

  return v; // si no matchea, devuelve como viene
};
