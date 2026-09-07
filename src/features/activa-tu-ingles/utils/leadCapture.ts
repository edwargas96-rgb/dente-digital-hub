const STORAGE_KEY = "activa_tu_ingles_leads";

export interface CapturedLead {
  name: string;
  email: string;
  capturedAt: string;
}

/**
 * Guarda el lead solo en localStorage (por ahora no hay backend/CRM
 * definido). Ver README/PR para el punto de integración futuro.
 */
export function saveLeadLocally(lead: { name: string; email: string }): void {
  try {
    const existingRaw = window.localStorage.getItem(STORAGE_KEY);
    const existing: CapturedLead[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push({ ...lead, capturedAt: new Date().toISOString() });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // localStorage puede no estar disponible (modo privado, etc.); no es crítico.
  }
}
