import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Clock,
  Globe2,
  Landmark,
  Lock,
  Newspaper,
  Radio,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/direita-news")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "DIREITA NEWS — Jornal digital independente" },
      {
        name: "description",
        content:
          "Política, economia, Brasil e mundo em uma experiência desenvolvida para quem prefere uma linha editorial conservadora.",
      },
      { property: "og:title", content: "DIREITA NEWS — Jornal digital independente" },
      {
        property: "og:description",
        content: "Informação organizada, rápida e sem depender apenas do algoritmo.",
      },
    ],
  }),
  component: DireitaNewsPage,
});

// ---------------- Analytics helpers ----------------

type EventName =
  | "quiz_started"
  | "question_answered"
  | "quiz_25_percent"
  | "quiz_50_percent"
  | "quiz_75_percent"
  | "quiz_completed"
  | "newspaper_preview_viewed"
  | "offer_viewed"
  | "checkout_clicked";

function track(event: EventName, payload: Record<string, unknown> = {}) {
  try {
    const w = window as unknown as {
      dataLayer?: Array<Record<string, unknown>>;
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...payload });
    if (typeof w.fbq === "function") w.fbq("trackCustom", event, payload);
    if (typeof w.gtag === "function") w.gtag("event", event, payload);
  } catch {
    // noop
  }
}

function getUtms(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = url.searchParams.get(k);
    if (v) out[k] = v;
  }
  return out;
}

// ---------------- Quiz data ----------------

type QuestionType = "single" | "multi";
type Question = {
  id: string;
  title: string;
  hint?: string;
  type: QuestionType;
  options: string[];
};

const QUESTIONS: Question[] = [
  {
    id: "frequencia",
    title: "Com que frequência você acompanha notícias sobre política brasileira?",
    type: "single",
    options: [
      "Todos os dias",
      "Algumas vezes por semana",
      "Somente quando acontece algo importante",
      "Quero começar a acompanhar mais",
    ],
  },
  {
    id: "canais",
    title: "Onde você normalmente acompanha as notícias?",
    type: "single",
    options: ["Instagram", "TikTok", "YouTube", "Portais de notícias", "WhatsApp / Telegram"],
  },
  {
    id: "incomodo",
    title: "O que mais incomoda você ao consumir notícias atualmente?",
    type: "single",
    options: [
      "Manchetes sensacionalistas",
      "Falta de contexto",
      "Excesso de opinião misturada com notícia",
      "Notícias importantes que quase não aparecem",
      "Ter que acompanhar vários lugares diferentes",
    ],
  },
  {
    id: "tempo",
    title: "Quanto tempo você gostaria de gastar para entender as principais notícias do dia?",
    type: "single",
    options: [
      "Menos de 5 minutos",
      "5 a 10 minutos",
      "10 a 20 minutos",
      "Gosto de acompanhar tudo detalhadamente",
    ],
  },
  {
    id: "assuntos",
    title: "Quais assuntos mais interessam você?",
    hint: "Selecione todos que se aplicam",
    type: "multi",
    options: [
      "Política",
      "Economia",
      "Congresso",
      "Segurança pública",
      "Mundo",
      "Eleições",
      "Liberdade de expressão",
      "Negócios",
      "Bastidores de Brasília",
    ],
  },
  {
    id: "fontes",
    title: "Você sente que precisa consultar várias fontes para entender uma mesma notícia?",
    type: "single",
    options: ["Frequentemente", "Às vezes", "Raramente", "Nunca"],
  },
  {
    id: "selecao",
    title: "Você gostaria de receber uma seleção das notícias mais importantes em um único lugar?",
    type: "single",
    options: ["Sim", "Talvez", "Depende da qualidade"],
  },
  {
    id: "formato",
    title: "O que seria mais útil para você?",
    type: "single",
    options: [
      "Resumo das notícias do dia",
      "Notícias completas",
      "Contexto sobre cada acontecimento",
      "Bastidores políticos",
      "Uma combinação de tudo isso",
    ],
  },
  {
    id: "grande_noticia",
    title: "Quando ocorre uma grande notícia política, você prefere:",
    type: "single",
    options: [
      "Receber a informação rapidamente",
      "Esperar uma análise mais completa",
      "Ter acesso às duas coisas",
    ],
  },
  {
    id: "editorial",
    title: "Você teria interesse em um jornal digital com uma linha editorial claramente conservadora?",
    type: "single",
    options: ["Sim", "Provavelmente", "Quero conhecer primeiro"],
  },
];

const STORAGE_KEY = "direita-news-quiz-v3";

type Screen = "urna" | "intro" | "quiz" | "analyzing" | "reveal";

type QuizState = {
  screen: Screen;
  step: number; // question index 1..N when screen === "quiz"
  answers: Record<string, string | string[]>;
  startedAt?: number;
};

const initialState: QuizState = { screen: "intro", step: 0, answers: {} };

// ---------------- Page ----------------

function DireitaNewsPage() {
  const [state, setState] = useState<QuizState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const utms = useRef<Record<string, string>>({});

  useEffect(() => {
    utms.current = getUtms();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuizState;
        if (parsed && typeof parsed.step === "number" && parsed.screen) setState(parsed);
      }
    } catch {
      // noop
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // noop
    }
  }, [state, hydrated]);

  const totalQ = QUESTIONS.length;
  const isUrna = state.screen === "urna";
  const isIntro = state.screen === "intro";
  const isQuiz = state.screen === "quiz";
  const isAnalyzing = state.screen === "analyzing";
  const isReveal = state.screen === "reveal";

  const onUrnaConfirmed = () => {
    track("quiz_started", { ...utms.current });
    setState((s) => ({ ...s, screen: "quiz", step: 1, startedAt: Date.now() }));
  };

  const startQuiz = () => {
    setState((s) => ({ ...s, screen: "urna" }));
  };

  const answerQuestion = (q: Question, value: string | string[]) => {
    const nextStep = state.step + 1;
    const nextAnswers = { ...state.answers, [q.id]: value };
    track("question_answered", { question_id: q.id, value, index: state.step });
    const answered = state.step;
    const pct = Math.round((answered / totalQ) * 100);
    if (pct >= 25 && Math.round(((answered - 1) / totalQ) * 100) < 25)
      track("quiz_25_percent");
    if (pct >= 50 && Math.round(((answered - 1) / totalQ) * 100) < 50)
      track("quiz_50_percent");
    if (pct >= 75 && Math.round(((answered - 1) / totalQ) * 100) < 75)
      track("quiz_75_percent");

    if (nextStep === totalQ + 1) {
      track("quiz_completed");
    }
    const nextScreen: Screen = nextStep > totalQ ? "analyzing" : "quiz";
    setState((s) => ({ ...s, screen: nextScreen, step: nextStep, answers: nextAnswers }));
  };

  const goReveal = () => {
    track("newspaper_preview_viewed");
    setState((s) => ({ ...s, screen: "reveal" }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <TopBar />
      <main>
        {isIntro && <Intro onStart={startQuiz} />}
        {isUrna && <UrnaScreen onConfirmed={onUrnaConfirmed} />}
        {isQuiz && (
          <QuizStep
            key={state.step}
            question={QUESTIONS[state.step - 1]}
            index={state.step}
            total={totalQ}
            selected={state.answers[QUESTIONS[state.step - 1].id]}
            onAnswer={(v) => answerQuestion(QUESTIONS[state.step - 1], v)}
            onBack={() =>
              setState((s) => ({ ...s, step: Math.max(1, s.step - 1) }))
            }
          />
        )}
        {isAnalyzing && <Analyzing onDone={goReveal} />}
        {isReveal && <Reveal />}
      </main>
      <Footer />
    </div>
  );
}

// ---------------- Urna eletrônica ----------------

function UrnaScreen({ onConfirmed }: { onConfirmed: () => void }) {
  const [digits, setDigits] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const canConfirm = digits.length === 2;
  const isFlavio = digits === "22";

  const press = (n: string) => {
    if (confirmed) return;
    setDigits((d) => (d.length >= 2 ? d : d + n));
  };
  const corrige = () => {
    if (confirmed) return;
    setDigits("");
  };
  const branco = () => {
    if (confirmed) return;
    setDigits("BR");
  };
  const confirma = () => {
    if (!canConfirm || confirmed) return;
    setConfirmed(true);
    window.setTimeout(() => onConfirmed(), 1800);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Enter") confirma();
      else if (e.key === "Backspace" || e.key === "Delete") corrige();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, confirmed]);

  return (
    <section className="relative overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(0,156,59,0.10),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_35%_at_50%_100%,rgba(0,39,118,0.06),transparent_70%)]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center justify-center px-5 py-12">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#002776]/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#002776] shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#009c3b]" />
            Simulação
          </div>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-slate-900 md:text-4xl">
            Confirme seu voto para continuar
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Digite o número do seu candidato à Presidência.
          </p>
        </div>

        {/* Urna body */}
        <div className="w-full max-w-2xl rounded-[28px] border border-[#2a2418] bg-gradient-to-b from-[#f3ecd8] to-[#dcd2b4] p-4 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] md:p-6">
          <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
            {/* Screen */}
            <div className="rounded-2xl border border-[#7a8a5a] bg-gradient-to-b from-[#d7e5b7] to-[#c5d69a] p-4 font-mono text-[#1a2a10]">
              {confirmed ? (
                <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em]">
                    {isFlavio ? "Presidente" : "Voto"}
                  </div>
                  {isFlavio ? (
                    <>
                      <CandidateAvatar />
                      <div className="mt-2 text-[15px] font-black uppercase tracking-wide">
                        Flávio Bolsonaro
                      </div>
                      <div className="text-[10px] uppercase tracking-widest opacity-70">
                        Número 22
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 text-[15px] font-black uppercase tracking-wide">
                      {digits === "BR" ? "Voto em branco" : `Voto: ${digits}`}
                    </div>
                  )}
                  <div className="mt-4 rounded-md bg-emerald-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
                    ✓ Voto confirmado
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] opacity-70">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-700" />
                    FIM
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em]">
                    Seu voto para
                  </div>
                  <div className="text-[18px] font-black uppercase leading-tight">
                    Presidente
                  </div>
                  <div className="mt-3 text-[11px] uppercase tracking-widest">
                    Número
                  </div>
                  <div className="mt-1 flex gap-2">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className={`grid h-12 w-10 place-items-center rounded border-2 text-2xl font-black ${
                          digits[i]
                            ? "border-[#1a2a10] bg-white/40"
                            : "border-[#1a2a10]/40 bg-transparent"
                        }`}
                      >
                        {digits[i] ?? ""}
                      </div>
                    ))}
                  </div>

                  {isFlavio && (
                    <div className="mt-3 flex items-center gap-3 rounded-md border border-[#1a2a10]/30 bg-white/40 p-2">
                      <CandidateAvatar small />
                      <div className="leading-tight">
                        <div className="text-[11px] font-bold uppercase tracking-wide">
                          Flávio Bolsonaro
                        </div>
                        <div className="text-[9px] uppercase tracking-widest opacity-70">
                          Presidente • 22
                        </div>
                      </div>
                    </div>
                  )}

                  {digits === "BR" && (
                    <div className="mt-3 text-[13px] font-bold uppercase">
                      Voto em branco
                    </div>
                  )}

                  <div className="mt-4 text-[10px] uppercase tracking-widest">
                    Aperte a tecla:
                    <br />
                    <span className="font-black">CONFIRMA</span> para confirmar
                    <br />
                    <span className="font-black">CORRIGE</span> para reiniciar
                  </div>
                </>
              )}
            </div>

            {/* Keypad */}
            <div className="rounded-2xl bg-[#1a1a1a] p-3">
              <div className="mb-2 flex items-center justify-end gap-2 pr-1">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-yellow-400" fill="currentColor" aria-hidden>
                  <path d="M12 2l3 6h6l-5 4 2 7-6-4-6 4 2-7-5-4h6z" />
                </svg>
                <div className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">
                  Justiça Eleitoral
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                  <UrnaKey key={n} onClick={() => press(n)}>
                    {n}
                  </UrnaKey>
                ))}
                <div />
                <UrnaKey onClick={() => press("0")}>0</UrnaKey>
                <div />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={branco}
                  className="rounded-md bg-[#e5e5e5] py-2.5 text-[11px] font-black uppercase tracking-widest text-[#1a1a1a] transition active:scale-95"
                >
                  Branco
                </button>
                <button
                  onClick={corrige}
                  className="rounded-md bg-orange-500 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition active:scale-95"
                >
                  Corrige
                </button>
                <button
                  onClick={confirma}
                  disabled={!canConfirm}
                  className="rounded-md bg-emerald-600 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition active:scale-95 disabled:opacity-40"
                >
                  Confirma
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Dica: digite <span className="text-[#002776]">22</span> e pressione CONFIRMA
        </div>
      </div>
    </section>
  );
}

function UrnaKey({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid h-12 place-items-center rounded-md bg-gradient-to-b from-[#3a3a3a] to-[#232323] text-lg font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_0_#000] transition active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
    >
      {children}
    </button>
  );
}

function CandidateAvatar({ small = false }: { small?: boolean }) {
  const size = small ? 36 : 64;
  return (
    <div
      className="relative mt-2 overflow-hidden rounded-md border border-[#1a2a10]/40 bg-gradient-to-b from-slate-200 to-slate-400"
      style={{ width: size, height: size + 6 }}
    >
      <svg viewBox="0 0 64 72" className="h-full w-full" aria-hidden>
        <rect width="64" height="72" fill="#c8d5b0" />
        <circle cx="32" cy="26" r="12" fill="#3a3a3a" />
        <circle cx="32" cy="24" r="10" fill="#e6b892" />
        <rect x="24" y="18" width="16" height="6" rx="1" fill="#2a2a2a" />
        <path d="M14 72 Q32 44 50 72 Z" fill="#1e3a8a" />
        <rect x="30" y="52" width="4" height="10" fill="#dc2626" />
      </svg>
    </div>
  );
}

function FlagStripe() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 flex">
      <div className="flex-1 bg-[#009c3b]" />
      <div className="flex-1 bg-[#ffdf00]" />
      <div className="flex-1 bg-[#002776]" />
    </div>
  );
}

// ---------------- Top bar ----------------

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <CensuraAlert />
      <FlagStripe />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
      </div>
    </header>
  );
}

function CensuraAlert() {
  return (
    <div className="w-full bg-red-600 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] md:text-xs">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        <span className="animate-pulse">
          Este portal pode ser derrubado a qualquer momento pela censura — garanta seu acesso
        </span>
      </div>
    </div>
  );
}

function Logo({ compact = false, invert = false }: { compact?: boolean; invert?: boolean }) {
  const titleClr = invert ? "text-white" : "text-slate-900";
  const subClr = invert ? "text-slate-400" : "text-slate-500";
  const badgeBg = invert ? "bg-white text-[#050810]" : "bg-[#050810] text-white";
  return (
    <div className="flex items-center gap-2">
      <div className={`grid h-8 w-8 place-items-center rounded-md ${badgeBg}`}>
        <Newspaper className="h-4.5 w-4.5" strokeWidth={2.4} />
      </div>
      <div className="leading-tight">
        <div className={`font-serif text-[17px] font-black tracking-tight ${titleClr}`}>
          DIREITA <span className="text-[#009c3b]">NEWS</span>
        </div>
        {!compact && (
          <div className={`text-[9px] uppercase tracking-[0.28em] ${subClr}`}>
            Jornal digital independente
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Intro ----------------

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <BackgroundGlow />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-14 text-center md:pt-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm">
            <span className="inline-flex h-2.5 overflow-hidden rounded-sm">
              <span className="w-1 bg-[#009c3b]" />
              <span className="w-1 bg-[#ffdf00]" />
              <span className="w-1 bg-[#002776]" />
            </span>
            Brasil acima de tudo
          </div>
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
            Você está acompanhando tudo o que{" "}
            <span className="italic text-[#009c3b]">realmente importa</span> no
            Brasil?
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-slate-600 md:text-lg">
            Responda algumas perguntas rápidas e descubra uma nova forma de
            acompanhar política, economia, Brasil e os principais acontecimentos
            do dia.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-2 rounded-xl bg-[#002776] px-7 py-4 text-[15px] font-bold uppercase tracking-wider text-white shadow-[0_18px_50px_-15px_rgba(0,39,118,0.55)] transition hover:bg-[#001a55]"
            >
              Começar o quiz
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Leva aproximadamente 2 minutos.
            </div>
          </div>
        </div>
      </section>

      <SejaPatriota />
      <Feedback />
    </>
  );
}

function SejaPatriota() {
  const cards = [
    {
      name: "Carlos, 54",
      role: "Empresário — São Paulo",
      quote:
        "Cansei de depender do Instagram. Agora acompanho tudo em um só lugar.",
      initials: "CS",
    },
    {
      name: "Marcelo, 42",
      role: "Militar — Brasília",
      quote:
        "Notícia direta, sem enrolação. Isso faz falta no Brasil.",
      initials: "MB",
    },
    {
      name: "Roberto, 61",
      role: "Aposentado — Curitiba",
      quote:
        "Finalmente um jornal digital que respeita o leitor conservador.",
      initials: "RA",
    },
  ];
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-5 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#009c3b]/30 bg-[#009c3b]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#009c3b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#009c3b]" />
            Comunidade
          </div>
          <h2 className="mt-3 font-serif text-3xl font-black leading-tight text-slate-900 md:text-4xl">
            SEJA PATRIOTA <span className="text-slate-400 line-through">ASSIM COMO ELE</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Milhares de brasileiros já acompanham as notícias pelo Direita News.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.name}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-[#002776] via-[#0a3a9e] to-[#009c3b]">
                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,223,0,0.25),transparent_70%)]" />
                <div className="relative grid h-24 w-24 place-items-center rounded-full border-2 border-white/40 bg-white/10 font-serif text-3xl font-black text-white backdrop-blur">
                  {c.initials}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 flex">
                  <div className="flex-1 bg-[#009c3b]" />
                  <div className="flex-1 bg-[#ffdf00]" />
                  <div className="flex-1 bg-[#002776]" />
                </div>
              </div>
              <div className="p-5">
                <div className="font-serif text-base font-bold text-slate-900">{c.name}</div>
                <div className="text-[11px] uppercase tracking-widest text-slate-500">
                  {c.role}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  "{c.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Feedback() {
  const items = [
    { name: "Ana Paula", city: "Rio de Janeiro", stars: 5, text: "Simples, rápido e direto ao ponto. Finalmente uma alternativa." },
    { name: "João Vitor", city: "Belo Horizonte", stars: 5, text: "Recomendei para toda a família. Melhor do que ficar caçando notícia em rede social." },
    { name: "Sandra L.", city: "Porto Alegre", stars: 5, text: "As manchetes são claras e a linha editorial é honesta." },
    { name: "Eduardo M.", city: "Goiânia", stars: 5, text: "Vale cada centavo. Uso todos os dias." },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-700">
            Feedback dos leitores
          </div>
          <h3 className="mt-3 font-serif text-3xl font-black leading-tight text-slate-900 md:text-4xl">
            O que estão dizendo
          </h3>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-600">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled />
              ))}
            </div>
            <span className="font-semibold text-slate-900">4,9</span>
            <span className="text-slate-500">· milhares de leitores</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((f) => (
            <div
              key={f.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{f.name}</div>
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">
                    {f.city}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: f.stars }).map((_, i) => (
                    <StarIcon key={i} filled />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">"{f.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill={filled ? "#ffdf00" : "none"}
      stroke="#ffdf00"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M12 2.5l2.7 5.5 6 .9-4.35 4.24 1.03 6-5.38-2.83L6.6 19.13l1.03-6L3.28 8.9l6-.9L12 2.5z" />
    </svg>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(0,39,118,0.10),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(30%_25%_at_50%_0%,rgba(0,156,59,0.08),transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.6) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
    </>
  );
}

// ---------------- Quiz Step ----------------

function QuizStep({
  question,
  index,
  total,
  selected,
  onAnswer,
  onBack,
}: {
  question: Question;
  index: number;
  total: number;
  selected?: string | string[];
  onAnswer: (v: string | string[]) => void;
  onBack: () => void;
}) {
  const pct = Math.round((index / total) * 100);
  const [multi, setMulti] = useState<string[]>(
    Array.isArray(selected) ? selected : [],
  );
  const [picked, setPicked] = useState<string | null>(null);

  const toggleMulti = (opt: string) => {
    setMulti((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt],
    );
  };

  const handleSingle = useCallback(
    (opt: string) => {
      if (picked) return;
      setPicked(opt);
      window.setTimeout(() => onAnswer(opt), 260);
    },
    [picked, onAnswer],
  );

  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-8 md:pt-14">
      <ProgressBar percent={pct} step={index} total={total} />
      <div className="mt-8">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#002776]">
          Pergunta {index} de {total}
        </div>
        <h2 className="font-serif text-[26px] leading-tight text-slate-900 md:text-[34px]">
          {question.title}
        </h2>
        {question.hint && (
          <div className="mt-2 text-xs text-slate-500">{question.hint}</div>
        )}

        <div className="mt-7 grid gap-3">
          {question.options.map((opt) => {
            const isSelected =
              question.type === "multi" ? multi.includes(opt) : picked === opt;
            return (
              <button
                key={opt}
                onClick={() =>
                  question.type === "multi" ? toggleMulti(opt) : handleSingle(opt)
                }
                className={`group relative flex items-center justify-between rounded-xl border px-5 py-4 text-left transition ${
                  isSelected
                    ? "border-[#002776] bg-[#002776]/5"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-[15px] font-medium text-slate-900">{opt}</span>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-md border transition ${
                    isSelected
                      ? "border-[#002776] bg-[#002776] text-white"
                      : "border-slate-300 text-transparent group-hover:border-slate-400"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>

        {question.type === "multi" && (
          <button
            disabled={multi.length === 0}
            onClick={() => onAnswer(multi)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#002776] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#001a55] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={onBack}
            className="rounded px-2 py-1 hover:text-slate-700"
            disabled={index === 1}
          >
            ← Voltar
          </button>
          <span>Suas respostas são anônimas.</span>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({
  percent,
  step,
  total,
}: {
  percent: number;
  step: number;
  total: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        <span>Progresso</span>
        <span className="text-[#002776]">{percent}%</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#009c3b] via-[#ffdf00] to-[#002776] transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
        Etapa {step} / {total}
      </div>
    </div>
  );
}

// ---------------- Analyzing ----------------

function Analyzing({ onDone }: { onDone: () => void }) {
  const items = useMemo(
    () => [
      "Preferências identificadas",
      "Assuntos selecionados",
      "Formato de leitura definido",
      "Personalizando sua experiência",
    ],
    [],
  );
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    items.forEach((_, i) => {
      timers.push(window.setTimeout(() => setShown(i + 1), 700 * (i + 1)));
    });
    timers.push(window.setTimeout(() => setDone(true), 700 * items.length + 500));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [items]);

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="relative mb-8 h-20 w-20">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#002776]" />
        <div className="absolute inset-3 rounded-full bg-slate-50" />
        <Newspaper className="absolute inset-0 m-auto h-7 w-7 text-[#002776]" />
      </div>
      {!done ? (
        <>
          <h2 className="font-serif text-3xl text-slate-900">Analisando suas respostas…</h2>
          <p className="mt-2 text-sm text-slate-600">
            Cruzando preferências para montar sua experiência editorial.
          </p>
          <ul className="mt-8 grid w-full gap-2 text-left">
            {items.slice(0, shown).map((it) => (
              <li
                key={it}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 animate-in fade-in slide-in-from-bottom-1 duration-500 shadow-sm"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#009c3b]/15 text-[#009c3b]">
                  <Check className="h-3 w-3" strokeWidth={4} />
                </span>
                {it}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2 className="font-serif text-3xl text-slate-900">
            Sua experiência Direita News está pronta.
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Editorial ajustado ao seu perfil de leitura.
          </p>
          <button
            onClick={onDone}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#002776] px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#001a55]"
          >
            Ver minha experiência
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </section>
  );
}

// ---------------- Reveal (product + preview + offer) ----------------

function Reveal() {
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("oferta");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        track("offer_viewed");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <ProductIntro />
      <Preview />
      <Benefits />
      <InteractiveSim />
      <Problem />
      <Independence />
      <Urgency />
      <Offer />
      <FinalCTA />
    </>
  );
}

function ProductIntro() {
  return (
    <section className="relative overflow-hidden border-t border-white/5">
      <BackgroundGlow />
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-300">
          Resultado personalizado
        </div>
        <h2 className="font-serif text-4xl leading-tight text-white md:text-5xl">
          Informação sem precisar caçar notícia pela internet inteira.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300">
          O <strong className="text-white">Direita News</strong> reúne política,
          economia, Brasil, mundo e os principais acontecimentos do dia em uma
          experiência desenvolvida para quem prefere uma linha editorial
          conservadora e quer acompanhar as notícias de maneira rápida e
          organizada.
        </p>
      </div>
    </section>
  );
}

// ------ Phone preview ------

type NewsCard = {
  tag: string;
  title: string;
  meta?: string;
};

const NEWS_BY_CATEGORY: Record<string, NewsCard[]> = {
  Início: [
    { tag: "BRASIL", title: "Entenda o principal assunto político desta manhã", meta: "há 8 min" },
    { tag: "CONGRESSO", title: "As principais movimentações que você precisa acompanhar", meta: "há 22 min" },
    { tag: "ECONOMIA", title: "Os números e decisões que podem afetar o seu dia", meta: "há 41 min" },
    { tag: "MUNDO", title: "O que está acontecendo fora do Brasil", meta: "há 1 h" },
  ],
  Política: [
    { tag: "BRASÍLIA", title: "Bastidores da articulação da semana no Planalto", meta: "há 5 min" },
    { tag: "CONGRESSO", title: "Pauta prioritária avança em comissão importante", meta: "há 18 min" },
    { tag: "STF", title: "Decisão repercute entre parlamentares", meta: "há 34 min" },
    { tag: "ELEIÇÕES", title: "Movimentações partidárias começam a se desenhar", meta: "há 1 h" },
  ],
  Brasil: [
    { tag: "SEGURANÇA", title: "Operação de grande porte mobiliza autoridades", meta: "há 12 min" },
    { tag: "ESTADOS", title: "Governadores debatem medida que impacta o país", meta: "há 25 min" },
    { tag: "SAÚDE", title: "Novo dado nacional divulgado nesta manhã", meta: "há 44 min" },
    { tag: "INFRAESTRUTURA", title: "Projeto estratégico entra em fase decisiva", meta: "há 1 h" },
  ],
  Economia: [
    { tag: "MERCADO", title: "Fechamento repercute cenário político da véspera", meta: "há 4 min" },
    { tag: "JUROS", title: "Expectativa cresce em relação à próxima decisão", meta: "há 19 min" },
    { tag: "EMPRESAS", title: "Movimento no setor produtivo chama atenção", meta: "há 37 min" },
    { tag: "DÓLAR", title: "Câmbio reage ao ambiente doméstico e externo", meta: "há 58 min" },
  ],
  Mundo: [
    { tag: "EUA", title: "Cenário político norte-americano ganha novo capítulo", meta: "há 10 min" },
    { tag: "EUROPA", title: "Movimento diplomático chama atenção", meta: "há 26 min" },
    { tag: "GEOPOLÍTICA", title: "Tensão regional entra em novo estágio", meta: "há 45 min" },
    { tag: "AMÉRICA LATINA", title: "Eleições no continente movimentam análises", meta: "há 1 h" },
  ],
};

function PhoneMockup({ category = "Início" as string }: { category?: string }) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const t = () =>
      setNow(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    t();
    const id = window.setInterval(t, 30000);
    return () => window.clearInterval(id);
  }, []);
  const cards = NEWS_BY_CATEGORY[category] ?? NEWS_BY_CATEGORY.Início;

  return (
    <div className="relative mx-auto w-[300px] md:w-[340px]">
      <div className="absolute -inset-6 -z-10 rounded-[48px] bg-[radial-gradient(60%_50%_at_50%_50%,rgba(250,204,21,0.15),transparent_70%)]" />
      <div className="relative rounded-[42px] border border-white/10 bg-gradient-to-b from-[#0b1220] to-[#050810] p-2.5 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="relative overflow-hidden rounded-[34px] bg-[#0b1120]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-medium text-slate-300">
            <span>{now || "09:41"}</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-3 rounded-sm bg-white/70" />
              <span className="h-2 w-4 rounded-sm border border-white/40" />
            </div>
          </div>
          {/* Notch pill */}
          <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />

          {/* Header */}
          <div className="px-5 pt-3">
            <div className="flex items-center justify-between">
              <div className="font-serif text-[15px] font-black tracking-tight text-white">
                DIREITA <span className="text-amber-400">NEWS</span>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-300">
                Ao vivo
              </span>
            </div>
            <div className="mt-3 text-[11px] uppercase tracking-widest text-slate-400">
              Bom dia.
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-slate-200">
              Principais notícias
            </div>
          </div>

          {/* Featured */}
          <div className="mx-5 mt-3 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#122043] to-[#0b1424] p-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-red-300">
                DESTAQUE
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                {category}
              </span>
            </div>
            <div className="mt-2 font-serif text-[15px] leading-snug text-white">
              {cards[0].title}
            </div>
            <div className="mt-2 text-[10px] text-slate-400">{cards[0].meta}</div>
          </div>

          {/* List */}
          <div className="mx-5 mt-3 space-y-2 pb-24">
            {cards.slice(1).map((c) => (
              <div
                key={c.title}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="text-[9px] font-bold uppercase tracking-widest text-amber-300">
                  {c.tag}
                </div>
                <div className="mt-1 text-[12px] leading-snug text-slate-100">
                  {c.title}
                </div>
                <div className="mt-1 text-[9px] text-slate-500">{c.meta}</div>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="absolute inset-x-0 bottom-0 border-t border-white/5 bg-[#050810]/90 px-3 py-2 backdrop-blur">
            <div className="grid grid-cols-5 text-[9px] uppercase tracking-widest text-slate-400">
              {[
                { l: "Início", active: true },
                { l: "Política" },
                { l: "Brasil" },
                { l: "Salvos" },
                { l: "Perfil" },
              ].map((n) => (
                <div
                  key={n.l}
                  className={`flex flex-col items-center gap-1 py-1 ${
                    n.active ? "text-amber-300" : ""
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full ${
                      n.active ? "bg-amber-400" : "bg-transparent"
                    }`}
                  />
                  {n.l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Preview() {
  return (
    <section className="border-t border-white/5 bg-gradient-to-b from-[#050810] to-[#070c1a]">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
            Prévia do jornal
          </div>
          <h3 className="font-serif text-3xl leading-tight text-white md:text-4xl">
            Uma redação inteira no seu celular.
          </h3>
          <p className="mt-4 max-w-md text-slate-300">
            Uma interface mobile-first, organizada como um portal moderno.
            Manchetes, contexto e navegação clara — sem ruído de rede social.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Sem barulho", "Editorial claro", "Rápido de ler"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: Newspaper, title: "Notícias selecionadas", text: "Os principais acontecimentos reunidos em um único lugar." },
    { icon: Zap, title: "Resumo rápido", text: "Entenda o essencial sem passar horas procurando informação." },
    { icon: Landmark, title: "Política", text: "Cobertura de Brasília, Congresso, eleições e decisões políticas." },
    { icon: Globe2, title: "Brasil e Mundo", text: "Os acontecimentos nacionais e internacionais que merecem atenção." },
    { icon: Bookmark, title: "Salvar para depois", text: "Guarde matérias importantes para ler quando quiser." },
    { icon: Smartphone, title: "Experiência mobile", text: "Leia diretamente pelo celular com interface rápida e organizada." },
    { icon: Radio, title: "Destaques", text: "Tenha acesso aos assuntos mais relevantes sem precisar acompanhar dezenas de perfis diferentes." },
  ];
  return (
    <section className="border-t border-white/5 bg-[#050810]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
            Funcionalidades
          </div>
          <h3 className="font-serif text-3xl leading-tight text-white md:text-4xl">
            Feito para quem quer acompanhar e entender.
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition hover:border-amber-400/40 hover:bg-white/[0.05]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-semibold text-white">{title}</div>
              <div className="mt-1 text-sm text-slate-400">{text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InteractiveSim() {
  const cats = ["Política", "Brasil", "Economia", "Mundo"];
  const [cat, setCat] = useState(cats[0]);
  return (
    <section className="border-t border-white/5 bg-gradient-to-b from-[#070c1a] to-[#050810]">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1 flex justify-center">
          <PhoneMockup category={cat} />
        </div>
        <div className="order-1 md:order-2">
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
            Simulação interativa
          </div>
          <h3 className="font-serif text-3xl leading-tight text-white md:text-4xl">
            Veja como é por dentro.
          </h3>
          <p className="mt-4 max-w-md text-slate-300">
            Selecione uma editoria e veja o feed se atualizar — como no
            aplicativo real.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  cat === c
                    ? "border-amber-400 bg-amber-400 text-[#050810]"
                    : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const chips = ["Instagram", "TikTok", "YouTube", "X", "WhatsApp", "Portais"];
  return (
    <section className="border-t border-white/5 bg-[#050810]">
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h3 className="font-serif text-3xl leading-tight text-white md:text-4xl">
          As notícias estão espalhadas por toda parte.
        </h3>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-slate-300"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-slate-300">
          Todos os dias surge uma enxurrada de informações. O{" "}
          <strong className="text-white">Direita News</strong> foi criado para
          transformar esse caos em uma leitura organizada.
        </p>
      </div>
    </section>
  );
}

function Independence() {
  return (
    <section className="border-t border-white/5 bg-gradient-to-b from-[#050810] via-[#0a1024] to-[#050810]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.4fr] md:items-center">
        <div className="flex justify-center">
          <div className="relative grid h-40 w-40 place-items-center rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-transparent md:h-52 md:w-52">
            <Lock className="h-16 w-16 text-amber-300 md:h-20 md:w-20" />
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-amber-400/10 blur-2xl" />
          </div>
        </div>
        <div>
          <div className="mb-3 inline-flex rounded-full border border-amber-400/30 bg-amber-400/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-300">
            Independência editorial
          </div>
          <h3 className="font-serif text-3xl leading-tight text-white md:text-4xl">
            Não dependa apenas do algoritmo.
          </h3>
          <p className="mt-4 max-w-xl text-slate-300">
            Redes sociais podem alterar alcance, regras e disponibilidade de
            conteúdo a qualquer momento. Ter acesso direto a uma publicação
            digital significa não depender exclusivamente do feed de uma
            plataforma para acompanhar as notícias que interessam a você.
          </p>
        </div>
      </div>
    </section>
  );
}

function Urgency() {
  return (
    <section className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-red-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          Acesso disponível
        </div>
        <h3 className="mt-5 font-serif text-3xl leading-tight text-white md:text-4xl">
          Entre agora para acompanhar as próximas edições do Direita News.
        </h3>
        <p className="mt-3 text-sm text-slate-400">
          As próximas edições já estão sendo preparadas pela redação.
        </p>
      </div>
    </section>
  );
}

function Offer() {
  const items = [
    "Jornal digital",
    "Notícias selecionadas",
    "Política",
    "Brasil",
    "Economia",
    "Mundo",
    "Resumos",
    "Experiência mobile",
    "Atualizações frequentes",
    "Acesso às próximas edições",
  ];

  const handleCheckout = () => {
    track("checkout_clicked", { ...getUtms() });
    // Placeholder: integração futura com checkout
    // window.location.href = "/checkout?product=direita-news";
  };

  return (
    <section id="oferta" className="border-t border-white/5 bg-[#050810]">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#0c1428] to-[#050810] p-8 shadow-[0_40px_120px_-30px_rgba(250,204,21,0.25)] md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(250,204,21,0.12),transparent_70%)]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <Logo />
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
                Acesso premium
              </span>
            </div>

            <h3 className="mt-6 font-serif text-3xl leading-tight text-white md:text-4xl">
              Tudo o que você precisa acompanhar, em um só lugar.
            </h3>

            <ul className="mt-6 grid gap-2 md:grid-cols-2">
              {items.map((it) => (
                <li
                  key={it}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-400/15 text-amber-300">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </span>
                  {it}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                Investimento único
              </div>
              <div
                className="mt-2 font-serif text-5xl font-black tracking-tight text-white"
                data-price-placeholder
              >
                R$ XX,XX
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Valor configurável no sistema
              </div>

              <button
                onClick={handleCheckout}
                className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#050810] transition hover:bg-amber-300"
              >
                Quero acessar o Direita News
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>

              <div className="mt-4 text-[11px] uppercase tracking-widest text-slate-500">
                Acesso rápido • Ambiente digital • Leia pelo celular
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const handleCheckout = () => {
    track("checkout_clicked", { ...getUtms(), placement: "final_cta" });
  };
  return (
    <section className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <div className="mx-auto mb-8 inline-block">
          <Logo />
        </div>
        <h3 className="font-serif text-4xl leading-tight text-white md:text-5xl">
          Informação é vantagem.
        </h3>
        <p className="mx-auto mt-4 max-w-lg text-slate-400">
          Tenha um lugar único para acompanhar os assuntos que movimentam o
          Brasil.
        </p>
        <button
          onClick={handleCheckout}
          className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#050810] transition hover:bg-amber-300"
        >
          Acessar Direita News
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <FlagStripe />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row">
        <Logo compact />
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
          © {new Date().getFullYear()} Direita News — Jornal digital independente
        </div>
      </div>
    </footer>
  );
}
