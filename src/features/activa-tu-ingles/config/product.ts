/**
 * Configuración del producto ofrecido al final del quiz.
 * El precio y la URL de checkout se definen fuera del componente para
 * poder actualizarlos sin tocar la UI.
 */
export const PRODUCT_CONFIG = {
  name: "50 Mapas Mentales de Inglés",
  price: "$9 USD",
  originalPrice: "$30 USD",
  priceNote: "Precio de lanzamiento — vuelve a $30 USD pronto.",
  // TODO: reemplazar por la URL real de checkout antes de lanzar la campaña.
  checkoutUrl: "https://checkout.example.com/activa-tu-ingles-mapas-mentales",
  guarantee: "Garantía de 7 días — si no te sirve, te devolvemos tu dinero.",
  benefits: [
    "Vocabulario esencial",
    "Verbos y estructuras",
    "Frases cotidianas",
    "Organización visual",
    "Material de repaso",
    "Acceso inmediato",
  ],
  bonuses: ["Guía de frases esenciales", "Plan visual de 30 días", "Material de repaso"],
};

/**
 * ⚠️ PLACEHOLDER — prueba social genérica para no dejar la oferta vacía
 * mientras no hay feedback real de alumnos. Reemplazar por testimonios y
 * cifras reales (con autorización de uso) antes de escalar la campaña.
 */
export const SOCIAL_PROOF = {
  rating: "4.8/5",
  studentsLabel: "+850 estudiantes ya lo usan",
  testimonials: [
    {
      name: "Camila R.",
      country: "México",
      quote: "Por fin entendí cómo conectar las frases, no solo memorizar palabras sueltas.",
    },
    {
      name: "Diego M.",
      country: "Colombia",
      quote:
        "Lo repaso en el bus, 5 minutos al día. Se me quedan las estructuras mucho más rápido.",
    },
  ],
};
