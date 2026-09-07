import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Headphones,
  MessageCircle,
  Mic2,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FlagAR, FlagCL, FlagCO, FlagMX, FlagPE, FlagVE } from "@/components/flags";

export const Route = createFileRoute("/mapa-ingles")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mapa Mental de Inglés — Aprende inglés rápido" },
      {
        name: "description",
        content:
          "El Mapa Mental de Inglés: la forma más simple de organizar tu aprendizaje y empezar a hablar inglés con confianza, pensado para Latinoamérica.",
      },
      { property: "og:title", content: "Mapa Mental de Inglés — Aprende inglés rápido" },
      {
        property: "og:description",
        content:
          "Un solo mapa, todo el camino: vocabulario, gramática, pronunciación y conversación en un mismo lugar.",
      },
    ],
  }),
  component: MapaIngles,
});

/** Estrela usada nas avaliações. */
function Star({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.7 5.5 6 .9-4.35 4.24 1.03 6-5.38-2.83L6.6 19.13l1.03-6L3.28 8.9l6-.9L12 2.5z" />
    </svg>
  );
}

// Ramas del mapa mental — cada una es un pilar del método.
const RAMAS = [
  { icon: Sparkles, label: "Vocabulario esencial", color: "#2563EB" },
  { icon: MessageCircle, label: "Gramática simple", color: "#7C3AED" },
  { icon: Mic2, label: "Pronunciación", color: "#DB2777" },
  { icon: Headphones, label: "Listening real", color: "#EA580C" },
  { icon: Plane, label: "Inglés para viajar", color: "#059669" },
  { icon: ShieldCheck, label: "Conversación diaria", color: "#0891B2" },
] as const;

const STEPS = [
  "Elige tu nivel de inglés actual",
  "Recibe tu Mapa Mental personalizado",
  "Sigue las ramas todos los días, 15 minutos",
];

const PAISES = [
  { Flag: FlagAR, nombre: "Argentina" },
  { Flag: FlagCO, nombre: "Colombia" },
  { Flag: FlagMX, nombre: "México" },
  { Flag: FlagVE, nombre: "Venezuela" },
  { Flag: FlagPE, nombre: "Perú" },
  { Flag: FlagCL, nombre: "Chile" },
] as const;

const TESTIMONIALS = [
  {
    iniciales: "MJ",
    name: "María José",
    lugar: "Bogotá, Colombia",
    quote:
      "Siempre me perdía entre tantos cursos. El Mapa Mental me mostró exactamente qué estudiar cada semana. En un mes ya entendía videos sin subtítulos.",
  },
  {
    iniciales: "FR",
    name: "Franco Ríos",
    lugar: "Buenos Aires, Argentina",
    quote:
      "Lo uso 15 minutos por día antes de trabajar. Es tan simple que por fin no abandoné un método de inglés.",
  },
  {
    iniciales: "CA",
    name: "Carla Andrade",
    lugar: "Ciudad de México, México",
    quote:
      "Me ayudó muchísimo para mi entrevista de trabajo en inglés. El mapa deja clarísimo qué aprender primero.",
  },
  {
    iniciales: "YP",
    name: "Yohana Pérez",
    lugar: "Caracas, Venezuela",
    quote:
      "Es el primer método que realmente pude seguir de principio a fin. Ahora entiendo canciones y series sin traducir todo.",
  },
];

const SEGURIDAD = [
  "Acceso inmediato después de la compra",
  "Pago único, sin suscripción",
  "Garantía de 7 días: si no te sirve, te devolvemos tu dinero",
  "Contenido en español, pensado para hispanohablantes",
  "Tus datos están protegidos de principio a fin",
];

/** Diagrama del mapa mental: nodo central + ramas alrededor. */
function MindMapVisual() {
  return (
    <div className="relative mx-auto mt-6 w-full max-w-[380px] select-none">
      <svg viewBox="0 0 360 320" className="w-full" role="img" aria-label="Mapa mental del inglés">
        {RAMAS.map((r, i) => {
          const angle = (Math.PI * 2 * i) / RAMAS.length - Math.PI / 2;
          const x = 180 + Math.cos(angle) * 128;
          const y = 160 + Math.sin(angle) * 108;
          return (
            <line
              key={r.label}
              x1="180"
              y1="160"
              x2={x}
              y2={y}
              stroke={r.color}
              strokeWidth="2"
              strokeDasharray="1 7"
              strokeLinecap="round"
              opacity="0.55"
            />
          );
        })}
      </svg>

      {/* Nó central */}
      <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-primary text-center shadow-[0_14px_34px_rgba(37,99,235,.35)]">
          <span className="font-heading text-[11px] font-extrabold leading-tight text-primary-foreground">
            MAPA
          </span>
          <span className="font-heading text-[11px] font-extrabold leading-tight text-primary-foreground">
            MENTAL
          </span>
        </div>
      </div>

      {/* Ramas */}
      {RAMAS.map((r, i) => {
        const angle = (Math.PI * 2 * i) / RAMAS.length - Math.PI / 2;
        const xPct = 50 + Math.cos(angle) * 35.5;
        const yPct = 50 + Math.sin(angle) * 33.7;
        const Icon = r.icon;
        return (
          <div
            key={r.label}
            className="absolute flex w-[92px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full shadow-[0_6px_16px_rgba(0,0,0,.12)]"
              style={{ backgroundColor: `${r.color}1a` }}
            >
              <Icon size={17} style={{ color: r.color }} strokeWidth={2.2} />
            </span>
            <span className="text-[10.5px] font-semibold leading-tight text-[#20302A]">
              {r.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MapaIngles() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".mi-reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const [flagIdx, setFlagIdx] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setFlagIdx((v) => (v + 1) % PAISES.length), 1800);
    return () => window.clearInterval(t);
  }, []);

  return (
    <main
      className="mi-scope flex min-h-screen justify-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(130% 70% at 50% -8%, rgba(37,99,235,.12), transparent 55%), radial-gradient(90% 55% at 108% 4%, rgba(124,58,237,.12), transparent 55%), radial-gradient(80% 55% at -8% 8%, rgba(219,39,119,.08), transparent 55%), #f3f4f8",
      }}
    >
      <style>{`
        .mi-reveal { opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s ease; }
        .mi-reveal.is-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      <div className="relative w-full max-w-[468px] bg-card shadow-[0_0_70px_rgba(20,20,40,.1)]">
        <div className="sticky top-0 z-30 h-1 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#DB2777]" />

        <div className="pb-2">
          {/* HERO */}
          <section className="px-5 pb-[26px] pt-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PAISES.map(({ Flag, nombre }, i) => (
                <span
                  key={nombre}
                  className={
                    "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] font-semibold transition-all " +
                    (i === flagIdx
                      ? "border-primary/30 bg-primary/10 text-primary scale-105"
                      : "border-[#E4E8DD] bg-[#F2F5EE] text-[#6b6b78]")
                  }
                >
                  <Flag /> {nombre}
                </span>
              ))}
            </div>

            <h1 className="mt-4 text-center font-heading text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground">
              El Mapa Mental que te lleva de cero a hablar inglés con confianza
            </h1>
            <p className="mt-3 text-center text-[14.5px] leading-[1.5] text-[#53645A]">
              Un solo mapa con todo lo que necesitas: vocabulario, gramática, pronunciación y
              conversación — pensado para hispanohablantes de toda Latinoamérica.
            </p>

            <MindMapVisual />

            <a
              href="#comprar"
              className="mt-[18px] flex min-h-[56px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-primary font-heading text-[17px] font-bold tracking-[0.01em] text-primary-foreground shadow-[0_12px_26px_rgba(37,99,235,.3)] transition-colors hover:opacity-90"
            >
              Quiero mi Mapa Mental de Inglés
              <ArrowRight className="size-[19px]" strokeWidth={2.4} />
            </a>

            <p className="mt-3 text-center text-[13.5px] text-[#53645A]">
              <span className="text-[#A0A99C] line-through">$29 USD</span>{" "}
              <strong className="font-heading text-[17px] font-extrabold text-primary">
                $9 USD
              </strong>{" "}
              pago único
            </p>

            <div className="mt-[14px] flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
                <ShieldCheck className="size-[14px] text-primary" strokeWidth={2} /> Datos
                protegidos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
                <Check className="size-[14px] text-primary" strokeWidth={2.2} /> Garantía de 7 días
              </span>
            </div>

            <div className="mt-3 flex items-center justify-center gap-[7px] text-[12.5px] text-[#7A897F]">
              <Star size={15} className="text-[#E8B713]" />
              <span>
                <strong className="text-foreground">+8.300</strong> mapas mentales ya descargados en
                Latinoamérica
              </span>
            </div>
          </section>

          {/* EJEMPLOS (imágenes pendientes) */}
          <section className="mi-reveal w-full border-y border-[#ECEFE6] bg-muted pb-6 pt-[22px]">
            <div className="px-5 pb-[14px]">
              <span className="mb-1.5 block h-[3px] w-9 rounded-full bg-primary" />
              <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">
                Así se ve tu Mapa Mental
              </h2>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#7A897F]">
                Vista previa disponible muy pronto.
              </p>
            </div>
            <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 pt-0.5 [-webkit-overflow-scrolling:touch]">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-[180px] shrink-0 snap-start">
                  <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#D8DEE9] bg-[#EEF1F7]">
                    <span className="px-3 text-center text-[12px] font-medium text-[#9099A8]">
                      Imagen próximamente
                    </span>
                  </div>
                  <p className="mx-0.5 mt-2 text-[12.5px] font-semibold text-[#0F1E16]">
                    Ejemplo {n}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* COMO FUNCIONA */}
          <section className="mi-reveal px-5 pb-2 pt-6">
            <span className="mb-1.5 block h-[3px] w-9 rounded-full bg-primary" />
            <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">
              Cómo funciona
            </h2>
            <p className="mb-4 mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              Un proceso corto y directo para empezar a estudiar inglés hoy mismo.
            </p>
            <div className="flex flex-col gap-2.5">
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-[15px] py-[14px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
                >
                  <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-primary/10 font-heading text-[16px] font-extrabold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-medium text-[#20302A]">{step}</span>
                </div>
              ))}
            </div>
          </section>

          {/* DEPOIMENTOS */}
          <section className="mi-reveal px-5 pb-1 pt-6">
            <span className="mb-1.5 block h-[3px] w-9 rounded-full bg-primary" />
            <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">
              Estudiantes que ya lo están usando
            </h2>
            <p className="mb-3.5 mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              Historias reales de personas en toda Latinoamérica aprendiendo inglés con el mapa
              mental.
            </p>
            <div className="flex flex-col gap-3">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.name}
                  className="rounded-2xl border border-border bg-card p-[15px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
                >
                  <div className="flex items-center gap-[11px]">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 font-heading text-[13px] font-bold text-primary">
                      {t.iniciales}
                    </span>
                    <figcaption className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-heading text-[14px] font-bold text-foreground">
                        <span className="truncate">{t.name}</span>
                      </div>
                      <span className="block text-[11.5px] text-[#8A978D]">{t.lugar}</span>
                    </figcaption>
                    <div className="flex flex-none gap-px text-[#E8B713]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} />
                      ))}
                    </div>
                  </div>
                  <blockquote className="mt-[11px] text-[13.5px] leading-[1.55] text-[#3A4A40]">
                    {t.quote}
                  </blockquote>
                </figure>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section id="comprar" className="mi-reveal px-5 pt-2">
            <a
              href="#comprar"
              className="flex min-h-[56px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-primary font-heading text-[17px] font-bold tracking-[0.01em] text-primary-foreground shadow-[0_12px_26px_rgba(37,99,235,.3)] transition-colors hover:opacity-90"
            >
              Quiero mi Mapa Mental de Inglés
              <ArrowRight className="size-[19px]" strokeWidth={2.4} />
            </a>
          </section>

          {/* SEGURANÇA */}
          <section className="mi-reveal px-5 pb-1.5 pt-3.5">
            <div className="overflow-hidden rounded-2xl border border-border shadow-[0_6px_18px_rgba(9,26,18,.05)]">
              <div className="bg-card px-4 pb-1 pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck
                    className="h-[17px] w-[17px] flex-none text-primary"
                    strokeWidth={2}
                  />
                  <h3 className="font-heading text-[15px] font-bold text-foreground">
                    Seguridad y transparencia
                  </h3>
                </div>
                <ul className="flex flex-col gap-[9px] pb-3.5">
                  {SEGURIDAD.map((item) => (
                    <li key={item} className="flex items-start gap-[9px]">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-primary" strokeWidth={2.4} />
                      <span className="text-[13px] leading-[1.45] text-[#4B5B50]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3 pb-4 text-center text-[11px] text-[#A0A99C]">
              Producto digital de estudio de inglés. Los resultados varían según la dedicación de
              cada estudiante.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
