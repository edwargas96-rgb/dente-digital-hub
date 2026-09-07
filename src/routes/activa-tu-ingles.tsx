import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  Flame,
  GraduationCap,
  Lock,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { FlagUS } from "@/components/flags";

export const Route = createFileRoute("/activa-tu-ingles")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Activa tu Inglés — ¿Qué nivel tienes?" },
      {
        name: "description",
        content:
          "Responde el quiz y descubre tu nivel real de inglés. Desbloquea 300 mapas mentales, frases, jergas y tu plan de estudio.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  component: QuizIngles,
});

// TODO: reemplaza por el link real de checkout (Cakto, Hotmart, etc.) cuando lo tengas.
const CHECKOUT_URL = "https://pay.cakto.com.br/REEMPLAZAR-LINK-CHECKOUT";

type Nivel = "medio" | "dificil";

type Pregunta = {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
};

const PREGUNTAS: Record<Nivel, Pregunta[]> = {
  medio: [
    {
      pregunta: "¿Cómo pides algo de forma cortés en inglés?",
      opciones: [
        "I want a coffee",
        "I would like a coffee",
        "I like a coffee",
        "I wanted a coffee",
      ],
      correcta: 1,
      explicacion:
        '"I would like" es la forma cortés de pedir algo. Se usa muchísimo en tiendas y restaurantes.',
    },
    {
      pregunta: 'Elige la traducción correcta de: "Ella trabaja todos los días."',
      opciones: [
        "She work every day",
        "She working every day",
        "She works every day",
        "She worked every day",
      ],
      correcta: 2,
      explicacion: 'Con "she/he/it" el verbo en presente simple lleva una "s": she works.',
    },
    {
      pregunta: '¿Qué significa la palabra "however"?',
      opciones: ["También", "Sin embargo", "Porque", "Entonces"],
      correcta: 1,
      explicacion: '"However" se usa para contrastar ideas, igual que "sin embargo" en español.',
    },
  ],
  dificil: [
    {
      pregunta: '¿Qué significa el phrasal verb "give up"?',
      opciones: ["Dar un regalo", "Rendirse", "Subir", "Apurarse"],
      correcta: 1,
      explicacion:
        '"Give up" significa rendirse o dejar de intentar algo. Muy común en el inglés hablado.',
    },
    {
      pregunta: 'Completa: "I ____ living in Miami for 5 years."',
      opciones: ["am", "have been", "was", "will"],
      correcta: 1,
      explicacion:
        'Para una acción que empezó en el pasado y continúa, se usa el presente perfecto: "have been".',
    },
    {
      pregunta: 'En una entrevista de trabajo dices: "I am very ____ about this opportunity."',
      opciones: ["excited", "exciting", "excite", "excitement"],
      correcta: 0,
      explicacion:
        'Para describir cómo te sientes tú se usa el adjetivo terminado en "-ed": excited. "Exciting" describe a la cosa, no a la persona.',
    },
  ],
};

const NOMBRES = [
  "Camila",
  "Andrés",
  "Valentina",
  "Mateo",
  "Sofía",
  "Diego",
  "Fernanda",
  "Javier",
  "Daniela",
  "Luis",
  "Paola",
  "Carlos",
  "Ximena",
  "Sebastián",
  "Renata",
  "Julián",
];

const CIUDADES = [
  "Bogotá",
  "Ciudad de México",
  "Lima",
  "Buenos Aires",
  "Santiago",
  "Quito",
  "Guayaquil",
  "Medellín",
  "Monterrey",
  "San Salvador",
  "Montevideo",
  "La Paz",
  "San José",
];

const MENSAJES_FOMO = [
  "acaba de desbloquear su Mapa Mental 🔥",
  "empezó su Plan de Estudio de 30 días 📘",
  "está resolviendo el Nivel Difícil ahora mismo 💪",
  "activó su inglés con la oferta de $9 🎉",
  "descargó las 300 frases más usadas ✅",
  "acaba de terminar el quiz con nivel Intermedio ⭐",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function useFomoToast() {
  const [visible, setVisible] = useState(false);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    const showOne = () => {
      setTexto(`${pick(NOMBRES)}, de ${pick(CIUDADES)}, ${pick(MENSAJES_FOMO)}`);
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 4600);
    };

    const first = setTimeout(showOne, 3500);
    const interval = setInterval(showOne, 8500);
    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  return { visible, texto };
}

function FomoToast() {
  const { visible, texto } = useFomoToast();
  return (
    <div
      className={
        "fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 transition-all duration-500 " +
        (visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0")
      }
      aria-live="polite"
    >
      <div className="flex max-w-[420px] items-center gap-2.5 rounded-full border border-[#E7E1D2] bg-white/95 px-4 py-2.5 shadow-[0_10px_30px_rgba(16,32,79,.18)] backdrop-blur">
        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#1E8E3E]/10 text-[#1E8E3E]">
          <Flame className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <p className="text-[12.5px] leading-[1.3] text-[#2A2F3D]">{texto}</p>
      </div>
    </div>
  );
}

// Usa el logo real quando /logo-activa-ingles.png existir em public/; até lá,
// cai no badge desenhado em CSS abaixo (mesma paleta da marca).
function Logo() {
  const [imagemFalhou, setImagemFalhou] = useState(false);

  if (!imagemFalhou) {
    return (
      <img
        src="/logo-activa-ingles.png"
        alt="Activa tu Inglés"
        className="h-10 w-auto flex-none object-contain"
        onError={() => setImagemFalhou(true)}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="relative grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-[#10204F] text-white shadow-[0_4px_10px_rgba(16,32,79,.35)]">
        <span className="font-ai-heading text-[17px] font-extrabold leading-none">A</span>
        <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-[#D8202F] text-white ring-2 ring-white">
          <Star className="h-2.5 w-2.5" strokeWidth={0} fill="currentColor" />
        </span>
      </span>
      <span className="font-ai-heading text-[15px] font-bold leading-[1.05] text-[#10204F]">
        Activa <span className="text-[#D8202F]">tu Inglés</span>
      </span>
    </div>
  );
}

function LevelPill({ label, state }: { label: string; state: "hecho" | "actual" | "pendiente" }) {
  return (
    <span
      className={
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ai-heading text-[10.5px] font-bold tracking-[0.02em] " +
        (state === "hecho"
          ? "bg-[#E4F4E8] text-[#1E8E3E]"
          : state === "actual"
            ? "bg-[#10204F] text-white"
            : "bg-[#EFEDE3] text-[#9A937D]")
      }
    >
      {state === "hecho" && <Check className="h-3 w-3" strokeWidth={3} />}
      {label}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-[22px] border border-[#EEE7D3] bg-white p-5 shadow-[0_12px_34px_rgba(16,32,79,.10)] [animation:aiUp_.35s_cubic-bezier(.22,1,.36,1)_both]">
      {children}
    </div>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-ai-heading text-[21px] font-extrabold leading-[1.2] text-[#10204F]">
      {children}
    </h1>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[#6B7280]">{children}</p>;
}

function Boton({
  onClick,
  children,
  disabled,
  variant = "primary",
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "cta";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "ai-btn mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[15px] font-ai-heading text-[16px] font-bold text-white " +
        (disabled
          ? "cursor-not-allowed bg-[#B9C0D6]"
          : variant === "cta"
            ? "ai-cta bg-[#D8202F] shadow-[0_14px_30px_rgba(216,32,47,.35)] hover:bg-[#B91626]"
            : "bg-[#10204F] shadow-[0_12px_26px_rgba(16,32,79,.30)] hover:bg-[#0B1A40]")
      }
    >
      {children}
      <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
    </button>
  );
}

function useCountdown(segundosIniciales: number) {
  const [segundos, setSegundos] = useState(segundosIniciales);
  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
  const ss = String(segundos % 60).padStart(2, "0");
  return { mm, ss };
}

type Fase = "intro" | "quiz" | "cargando" | "nivel-feedback" | "oferta";

const MENSAJES_CARGA = [
  "Analizando tus respuestas...",
  "Comparando con miles de estudiantes de LATAM...",
  "Calculando tu nivel de inglés...",
  "Preparando tu diagnóstico...",
];

function Cargando({ nivel, onCompleto }: { nivel: Nivel; onCompleto: () => void }) {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const inicio = Date.now();
    const duracion = 2200;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - inicio) / duracion);
      setProgreso(Math.round(t * 100));
      if (t >= 1) {
        clearInterval(id);
        setTimeout(onCompleto, 350);
      }
    }, 45);
    return () => clearInterval(id);
    // Solo corre una vez al montar: recalcular con cada render reiniciaría la barra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mensaje = MENSAJES_CARGA[Math.min(MENSAJES_CARGA.length - 1, Math.floor(progreso / 25))];

  return (
    <Card>
      <div className="flex flex-col items-center py-4 text-center">
        <span className="relative grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-[#EFEBDD] border-t-[#10204F]" />
          <span className="font-ai-heading text-[17px] font-extrabold text-[#10204F]">
            {progreso}%
          </span>
        </span>
        <p className="mt-4 font-ai-heading text-[16px] font-bold text-[#10204F]">
          {nivel === "medio"
            ? "Calculando tu resultado del Nivel Medio..."
            : "Generando tu diagnóstico final..."}
        </p>
        <p className="mt-1.5 text-[13px] text-[#6B7280]">{mensaje}</p>
        <div className="mt-4 h-[7px] w-full overflow-hidden rounded-full bg-[#EFEBDD]">
          <div
            className="h-full rounded-full bg-[#10204F] transition-[width] duration-150 ease-linear"
            style={{ width: `${progreso}%` }}
          />
        </div>
        <p className="mt-4 text-[11.5px] text-[#9A937D]">No cierres esta pantalla...</p>
      </div>
    </Card>
  );
}

function QuizIngles() {
  const [fase, setFase] = useState<Fase>("intro");
  const [nivel, setNivel] = useState<Nivel>("medio");
  const [indice, setIndice] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<Record<Nivel, boolean[]>>({
    medio: [],
    dificil: [],
  });
  const [videoConfirmado, setVideoConfirmado] = useState(false);

  const preguntaActual = PREGUNTAS[nivel][indice];
  const totalPreguntasNivel = PREGUNTAS[nivel].length;

  const puntajeTotal = useMemo(
    () => respuestas.medio.filter(Boolean).length + respuestas.dificil.filter(Boolean).length,
    [respuestas],
  );

  function elegirOpcion(i: number) {
    if (seleccion !== null) return;
    setSeleccion(i);
    const acierto = i === preguntaActual.correcta;
    setRespuestas((r) => ({ ...r, [nivel]: [...r[nivel], acierto] }));
  }

  function continuar() {
    if (indice < totalPreguntasNivel - 1) {
      setIndice((i) => i + 1);
      setSeleccion(null);
      return;
    }
    setFase("cargando");
  }

  function siguienteNivel() {
    if (nivel === "medio") {
      setNivel("dificil");
      setIndice(0);
      setSeleccion(null);
      setFase("quiz");
      return;
    }
    setFase("oferta");
  }

  const aciertosNivel = respuestas[nivel].filter(Boolean).length;

  return (
    <main
      className="ai-scope flex min-h-screen justify-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(120% 65% at 50% -10%, rgba(16,32,79,.10), transparent 55%), radial-gradient(90% 55% at 108% 0%, rgba(216,32,47,.08), transparent 55%), #FBF8EF",
      }}
    >
      <div className="relative flex w-full max-w-[468px] flex-col">
        <div className="sticky top-0 z-30 h-1 ai-tricolor" />

        <div className="px-5 pb-24 pt-4">
          <div className="flex items-center justify-between">
            <Logo />
            {fase !== "intro" && (
              <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-ai-heading text-[12px] font-extrabold text-[#10204F] shadow-[0_4px_10px_rgba(16,32,79,.12)]">
                <Star className="h-3.5 w-3.5 text-[#F4B400]" fill="currentColor" strokeWidth={0} />
                {puntajeTotal}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <LevelPill label="FÁCIL" state="hecho" />
            <span className="h-px w-4 bg-[#E4DFCC]" />
            <LevelPill
              label="MEDIO"
              state={nivel === "medio" && fase !== "oferta" ? "actual" : "hecho"}
            />
            <span className="h-px w-4 bg-[#E4DFCC]" />
            <LevelPill
              label="DIFÍCIL"
              state={fase === "oferta" ? "hecho" : nivel === "dificil" ? "actual" : "pendiente"}
            />
          </div>

          {fase === "quiz" && (
            <div className="mt-3 h-[7px] w-full overflow-hidden rounded-full bg-[#EFEBDD]">
              <div
                className="h-full rounded-full bg-[#10204F] transition-[width] duration-300 ease-out"
                style={{ width: `${((indice + 1) / totalPreguntasNivel) * 100}%` }}
              />
            </div>
          )}

          {/* INTRO — recapitula el nivel fácil (video) y presenta el nivel medio */}
          {fase === "intro" && (
            <Card>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#E4F4E8] text-[#1E8E3E]">
                  <Trophy className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <p className="font-ai-heading text-[12px] font-bold uppercase tracking-[0.06em] text-[#1E8E3E]">
                  Nivel Fácil superado
                </p>
              </div>
              <Titulo>¡Bien hecho! Ya diste el primer paso 🎉</Titulo>
              <Sub>
                Respondiste las 3 preguntas básicas del video. Ahora vamos a subir la dificultad
                para saber tu nivel real de inglés.
              </Sub>

              <div className="mt-4 rounded-2xl border border-[#EEE7D3] bg-[#FBF8EF] p-4">
                <p className="font-ai-heading text-[14px] font-bold text-[#10204F]">
                  Lo que sigue:
                </p>
                <ul className="mt-2 space-y-2 text-[13px] text-[#4B5261]">
                  <li className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 flex-none text-[#10204F]" strokeWidth={2.2} />
                    Nivel Medio — 3 preguntas de vocabulario y gramática
                  </li>
                  <li className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 flex-none text-[#D8202F]" strokeWidth={2.2} />
                    Nivel Difícil — 3 preguntas de expresiones reales <FlagUS />
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 flex-none text-[#F4B400]" strokeWidth={2.2} />
                    Tu diagnóstico final + regalo sorpresa
                  </li>
                </ul>
              </div>

              <Boton
                onClick={() => {
                  setVideoConfirmado(true);
                  setFase("quiz");
                }}
              >
                Empezar Nivel Medio
              </Boton>
              {videoConfirmado === false && (
                <p className="mt-3 text-center text-[11.5px] text-[#9A937D]">
                  Te toma menos de 2 minutos.
                </p>
              )}
            </Card>
          )}

          {/* PREGUNTAS */}
          {fase === "quiz" && (
            <Card>
              <p className="font-ai-heading text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#9A937D]">
                Nivel {nivel === "medio" ? "Medio" : "Difícil"} · Pregunta {indice + 1} de{" "}
                {totalPreguntasNivel}
              </p>
              <h2 className="mt-1.5 font-ai-heading text-[19px] font-extrabold leading-[1.3] text-[#10204F]">
                {preguntaActual.pregunta}
              </h2>

              <div className="mt-4 flex flex-col gap-2.5">
                {preguntaActual.opciones.map((opcion, i) => {
                  const elegida = seleccion === i;
                  const esCorrecta = i === preguntaActual.correcta;
                  const mostrarEstado = seleccion !== null;

                  let estilo =
                    "border-[#E7E1D2] bg-white shadow-[0_4px_14px_rgba(16,32,79,.05)] hover:border-[#C7CBE0]";
                  if (mostrarEstado && esCorrecta) {
                    estilo = "border-[#1E8E3E] bg-[#E4F4E8]";
                  } else if (mostrarEstado && elegida && !esCorrecta) {
                    estilo = "border-[#D8202F] bg-[#FBE7E7]";
                  } else if (mostrarEstado) {
                    estilo = "border-[#E7E1D2] bg-white opacity-60";
                  }

                  return (
                    <button
                      key={opcion}
                      type="button"
                      onClick={() => elegirOpcion(i)}
                      disabled={seleccion !== null}
                      className={
                        "flex w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-left text-[14.5px] font-semibold text-[#20263A] transition-colors " +
                        estilo
                      }
                    >
                      {opcion}
                      {mostrarEstado && esCorrecta && (
                        <Check
                          className="h-[18px] w-[18px] flex-none text-[#1E8E3E]"
                          strokeWidth={3}
                        />
                      )}
                      {mostrarEstado && elegida && !esCorrecta && (
                        <X className="h-[18px] w-[18px] flex-none text-[#D8202F]" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>

              {seleccion !== null && (
                <div
                  className={
                    "mt-3.5 rounded-2xl border p-[13px] text-[12.5px] leading-[1.5] " +
                    (seleccion === preguntaActual.correcta
                      ? "border-[#CDEAD6] bg-[#F1FAF3] text-[#1E6B33]"
                      : "border-[#F3D2D2] bg-[#FDF1F1] text-[#8A2A2A]")
                  }
                >
                  <strong className="font-ai-heading">
                    {seleccion === preguntaActual.correcta ? "¡Correcto! " : "Casi. "}
                  </strong>
                  {preguntaActual.explicacion}
                </div>
              )}

              <Boton onClick={continuar} disabled={seleccion === null}>
                {indice < totalPreguntasNivel - 1 ? "Siguiente pregunta" : "Ver mi resultado"}
              </Boton>
            </Card>
          )}

          {/* LOADING — genera expectativa antes de revelar el resultado */}
          {fase === "cargando" && (
            <Cargando nivel={nivel} onCompleto={() => setFase("nivel-feedback")} />
          )}

          {/* FEEDBACK DE FIN DE NIVEL */}
          {fase === "nivel-feedback" && (
            <Card>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#FFF4CE]">
                <Trophy className="h-8 w-8 text-[#B98A00]" strokeWidth={2} />
              </div>
              <p className="mt-3 text-center font-ai-heading text-[12px] font-bold uppercase tracking-[0.08em] text-[#9A937D]">
                Nivel {nivel === "medio" ? "Medio" : "Difícil"} completado
              </p>
              <h2 className="mt-1 text-center font-ai-heading text-[24px] font-extrabold leading-[1.15] text-[#10204F]">
                {aciertosNivel}/{totalPreguntasNivel} correctas
              </h2>
              <Sub>
                {nivel === "medio"
                  ? aciertosNivel >= 2
                    ? "¡Vas muy bien! Tu vocabulario básico está sólido. Ahora vamos a ver si sobrevives al Nivel Difícil."
                    : "No pasa nada, es normal fallar algunas al inicio. El Mapa Mental está pensado justo para esto."
                  : aciertosNivel >= 2
                    ? "Impresionante. Ya entiendes expresiones que la mayoría de hispanohablantes no conoce."
                    : "Aquí es donde casi todos se traban — por eso existe el Mapa Mental de 300 frases."}
              </Sub>

              <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#E7E1D2] bg-[#FBF8EF] p-[13px]">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white text-[#10204F] shadow-[0_2px_6px_rgba(16,32,79,.12)]">
                  <Sparkles className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <p className="text-[12.5px] leading-[1.5] text-[#4B5261]">
                  {nivel === "medio"
                    ? "Consejo: repasar 5 minutos al día con mapas mentales fija el vocabulario 3 veces más rápido que estudiar reglas sueltas."
                    : "Con el Plan de Estudio de 30 días puedes pasar de este nivel a mantener una conversación básica sin traducir mentalmente."}
                </p>
              </div>

              <Boton onClick={siguienteNivel}>
                {nivel === "medio" ? "Ir al Nivel Difícil" : "Ver mi diagnóstico final"}
              </Boton>
            </Card>
          )}

          {/* OFERTA FINAL */}
          {fase === "oferta" && <Oferta puntajeTotal={puntajeTotal} />}
        </div>
      </div>

      <FomoToast />
    </main>
  );
}

function diagnostico(puntaje: number): { titulo: string; texto: string } {
  if (puntaje >= 5) {
    return {
      titulo: "Nivel Básico-Alto 🚀",
      texto:
        "Ya tienes una base real. Te falta poco para sonar natural — el Mapa Mental te lleva ahí en 30 días.",
    };
  }
  if (puntaje >= 3) {
    return {
      titulo: "Nivel Básico-Intermedio 📈",
      texto:
        "Entiendes lo esencial, pero te trabas con frases cotidianas. Justo lo que resuelve el Mapa Mental.",
    };
  }
  return {
    titulo: "Nivel Básico (punto de partida) 🌱",
    texto:
      "Perfecto momento para empezar con el método correcto — sin gramática aburrida, solo lo que se usa de verdad.",
  };
}

function Oferta({ puntajeTotal }: { puntajeTotal: number }) {
  const { mm, ss } = useCountdown(15 * 60);
  const diag = diagnostico(puntajeTotal);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#EAF0FF] text-[#10204F]">
          <GraduationCap className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </span>
        <p className="font-ai-heading text-[12px] font-bold uppercase tracking-[0.06em] text-[#10204F]">
          Tu resultado: {puntajeTotal}/6
        </p>
      </div>
      <Titulo>{diag.titulo}</Titulo>
      <Sub>{diag.texto}</Sub>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#F3D2D2] bg-[#FDF1F1] px-4 py-2.5">
        <Clock className="h-4 w-4 flex-none text-[#D8202F]" strokeWidth={2.4} />
        <p className="font-ai-heading text-[13px] font-bold text-[#8A2A2A]">
          Oferta de desbloqueo expira en {mm}:{ss}
        </p>
      </div>

      <div
        className="mt-4 overflow-hidden rounded-2xl border-2 border-[#10204F] p-[18px]"
        style={{ background: "linear-gradient(180deg, #FFFFFF, #F3F5FC)" }}
      >
        <p className="font-ai-heading text-[15px] font-extrabold leading-[1.25] text-[#10204F]">
          Desbloquea el Kit completo para subir de nivel:
        </p>
        <ul className="mt-3 space-y-2 text-[13px] leading-[1.4] text-[#374056]">
          {[
            "300 Mapas Mentales de inglés (vocabulario visual, fácil de recordar)",
            "Las frases más usadas en conversaciones reales",
            "Jergas y modismos (slang) para sonar natural, no de libro",
            "Plan de estudio de 30 días, paso a paso",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-none text-[#1E8E3E]" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-end gap-2.5 border-t border-[#E1E4EF] pt-3.5">
          <span className="text-[15px] text-[#9AA0B4] line-through">$27</span>
          <span className="font-ai-heading text-[34px] font-extrabold leading-none text-[#10204F]">
            $9
          </span>
          <span className="mb-1 text-[12.5px] font-semibold text-[#6B7280]">USD, pago único</span>
        </div>
        <span className="mt-2 inline-block rounded-md bg-[#D8202F] px-2.5 py-1 font-ai-heading text-[11px] font-extrabold text-white">
          −66% SOLO POR HOY
        </span>
      </div>

      <a
        href={CHECKOUT_URL}
        className="ai-btn ai-cta mt-5 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[15px] bg-[#D8202F] px-4 text-center font-ai-heading text-[16.5px] font-bold text-white shadow-[0_14px_30px_rgba(216,32,47,.35)] hover:bg-[#B91626]"
      >
        <Lock className="h-[17px] w-[17px]" strokeWidth={2.4} />
        Activar mi inglés por $9
      </a>
      <p className="mt-3 text-center text-[11.5px] leading-[1.5] text-[#9A937D]">
        Acceso inmediato después del pago. Miles de personas en Latinoamérica ya lo están usando.
      </p>
    </Card>
  );
}
