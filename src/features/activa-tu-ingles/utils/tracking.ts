/**
 * Tracking mínimo. Registra eventos en consola (dev) y deja listo el punto
 * de integración para un backend / analytics real.
 *
 * Eventos esperados:
 * landing_viewed, quiz_continued, question_answered, quiz_completed,
 * result_processing, result_viewed, offer_viewed, checkout_clicked
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("source") || undefined,
    campaign: params.get("campaign") || undefined,
    utm_source: params.get("utm_source") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
  };
}

export function trackEvent(eventName: string, data: Record<string, unknown> = {}) {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...getUtmParams(),
    ...data,
  };

  // Punto de integración: enviar a un endpoint de analytics / backend propio.
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(payload);
  }

  if (import.meta.env?.DEV) {
    console.log("[track]", payload);
  }
}

/**
 * Funciones preparadas para Meta Pixel. No se instala ningún ID ficticio:
 * solo se ejecutan si window.fbq ya fue inicializado por el sitio.
 */
function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

export const metaPixel = {
  viewContent: (data?: Record<string, unknown>) => fbq("track", "ViewContent", data),
  lead: (data?: Record<string, unknown>) => fbq("track", "Lead", data),
  initiateCheckout: (data?: Record<string, unknown>) => fbq("track", "InitiateCheckout", data),
  purchase: (data?: Record<string, unknown>) => fbq("track", "Purchase", data),
  quizStarted: (data?: Record<string, unknown>) => fbq("trackCustom", "QuizStarted", data),
  quizCompleted: (data?: Record<string, unknown>) => fbq("trackCustom", "QuizCompleted", data),
};
