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
  }),
  component: ActivaTuIngles,
});
