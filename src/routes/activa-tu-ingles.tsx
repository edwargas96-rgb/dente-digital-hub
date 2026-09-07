import { createFileRoute } from "@tanstack/react-router";
import { ActivaTuIngles } from "@/features/activa-tu-ingles/ActivaTuIngles";

export const Route = createFileRoute("/activa-tu-ingles")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Activa tu Inglés" },
      {
        name: "description",
        content: "Continúa tu test de inglés y descubre tu nivel.",
      },
      { property: "og:title", content: "Activa tu Inglés" },
      {
        property: "og:description",
        content: "Continúa tu test de inglés y descubre tu nivel.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap",
      },
    ],
  }),
  component: ActivaTuIngles,
});
