import type { ActivityNotification } from "../types";

/**
 * Notificaciones tipo "toast" que aparecen ocasionalmente durante el quiz
 * para dar sensación de actividad.
 *
 * DEVELOPMENT_MODE: puede mostrar ejemplos claramente marcados como DEMO,
 * solo para verificación visual. Nunca deben usarse en producción como
 * prueba social real.
 *
 * LIVE_MODE: solo se muestran notificaciones basadas en eventos reales
 * (cuando exista un backend de eventos). Mientras no exista, se usan
 * mensajes motivacionales genéricos, sin números ni nombres inventados.
 */
export const APP_MODE = {
  DEVELOPMENT: "DEVELOPMENT_MODE",
  LIVE: "LIVE_MODE",
} as const;

export type AppMode = (typeof APP_MODE)[keyof typeof APP_MODE];

// Cambiar a APP_MODE.LIVE cuando exista un backend de eventos reales.
export const CURRENT_MODE: AppMode = APP_MODE.DEVELOPMENT;

/**
 * Ejemplos SOLO para pruebas visuales en desarrollo.
 * NUNCA usar en producción como prueba social real.
 */
export const DEMO_ACTIVITY_NOTIFICATIONS: ActivityNotification[] = [
  { id: "demo-1", text: "Antonio obtuvo 10/10", demo: true },
  { id: "demo-2", text: "Camila completó el test", demo: true },
  { id: "demo-3", text: "Lucas llegó al nivel funcional", demo: true },
];

/**
 * Mensajes motivacionales genéricos, seguros para producción mientras no
 * haya eventos reales registrados. No contienen números ni nombres
 * inventados.
 */
export const MOTIVATIONAL_NOTIFICATIONS: ActivityNotification[] = [
  { id: "motiv-1", text: "¿Podrás superar 8/10?" },
  { id: "motiv-2", text: "Cada pregunta cuenta." },
  { id: "motiv-3", text: "Tu resultado está cada vez más cerca." },
  { id: "motiv-4", text: "Ya casi terminas tu test." },
];

/**
 * Devuelve la lista de notificaciones a usar según el modo actual y los
 * eventos reales disponibles (cuando existan).
 */
export function getActivityNotifications(
  realEvents: ActivityNotification[] = [],
): ActivityNotification[] {
  if (CURRENT_MODE === APP_MODE.DEVELOPMENT) {
    return [...DEMO_ACTIVITY_NOTIFICATIONS, ...MOTIVATIONAL_NOTIFICATIONS];
  }

  // LIVE_MODE: solo eventos reales; si no hay, mensajes motivacionales genéricos.
  if (realEvents.length > 0) {
    return realEvents;
  }
  return MOTIVATIONAL_NOTIFICATIONS;
}
