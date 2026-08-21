import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Clock, Newspaper } from "lucide-react";

export const Route = createFileRoute("/direita-news")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "GAZETA DIREITA — Jornal digital independente" },
      {
        name: "description",
        content:
          "Política, economia, Brasil e mundo em uma experiência desenvolvida para quem prefere uma linha editorial conservadora.",
      },
      { property: "og:title", content: "GAZETA DIREITA — Jornal digital independente" },
      {
        property: "og:description",
        content: "Informação organizada, rápida e sem depender apenas do algoritmo.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@600;700&display=swap",
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

type Candidate = { number: string; name: string; party: string; img: string };

const CANDIDATES: Record<string, Candidate> = {
  "13": { number: "13", name: "Luiz Inácio Lula da Silva", party: "PT", img: "https://i.imgur.com/rjbER6h.jpeg" },
  "14": { number: "14", name: "Renan Santos", party: "Missão", img: "https://i.imgur.com/7OoSOF0.jpeg" },
  "22": { number: "22", name: "Flávio Bolsonaro", party: "PL", img: "https://i.imgur.com/t0BjptQ.jpeg" },
  "28": { number: "28", name: "Pablo Marçal", party: "PRTB", img: "https://i.imgur.com/IkA04gQ.jpeg" },
};

function playBeep(freq = 900, duration = 90) {
  try {
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = w.AudioContext || w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000 + 0.02);
    osc.onended = () => ctx.close();
  } catch {
    // noop
  }
}

function UrnaScreen({ onConfirmed }: { onConfirmed: () => void }) {
  const [digits, setDigits] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const canConfirm = digits.length === 2;
  const candidate = CANDIDATES[digits];
  const isPT = digits === "13";

  const press = (n: string) => {
    if (confirmed) return;
    playBeep(900, 80);
    setDigits((d) => (d.length >= 2 ? d : d + n));
  };
  const corrige = () => {
    if (confirmed) return;
    playBeep(600, 120);
    setDigits("");
  };
  const branco = () => {
    if (confirmed) return;
    playBeep(700, 100);
    setDigits("BR");
  };
  const confirma = () => {
    if (!canConfirm || confirmed) return;
    if (isPT) {
      // buzz de erro
      playBeep(250, 300);
      return;
    }
    // "FIM" tune: two ascending beeps
    playBeep(1000, 120);
    window.setTimeout(() => playBeep(1400, 260), 130);
    setConfirmed(true);
    window.setTimeout(() => onConfirmed(), 2000);
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

  const screenBg = isPT
    ? "from-red-500 to-red-700 text-white border-red-900"
    : "from-[#d7e5b7] to-[#c5d69a] text-[#1a2a10] border-[#7a8a5a]";

  return (
    <section className="relative bg-slate-50">
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

        {/* Urna body — bege com base preta como a urna real */}
        <div className="w-full max-w-2xl overflow-hidden rounded-t-[24px] rounded-b-[8px] border-2 border-[#3a2f1c] bg-gradient-to-b from-[#e8dfc4] via-[#dcd2b4] to-[#c9bf9e] p-1 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="rounded-[20px] bg-gradient-to-b from-[#e8dfc4] to-[#d8ceac] p-3 md:p-5">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-600 shadow-[0_0_6px_rgba(220,38,38,0.8)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#3a2f1c]">
                  Ligada
                </span>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#3a2f1c]">
                Tribunal Superior Eleitoral
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
              {/* Screen bezel */}
              <div className="rounded-lg bg-[#3a2f1c] p-2">
                <div className={`min-h-[280px] rounded-md border ${screenBg} bg-gradient-to-b p-3 font-mono`}>
                  {isPT && !confirmed ? (
                    <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                      <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.32em] text-white/90">
                        ⚠ Alerta ⚠
                      </div>
                      <div className="mt-3 font-serif text-3xl font-black uppercase leading-none tracking-wider text-white drop-shadow md:text-4xl">
                        Sai fora
                      </div>
                      <div className="mt-1 font-serif text-3xl font-black uppercase leading-none tracking-wider text-white drop-shadow md:text-4xl">
                        petista!
                      </div>
                      <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/90">
                        Pressione CORRIGE
                      </div>
                    </div>
                  ) : confirmed ? (
                    <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.28em]">
                        {candidate ? "Presidente" : "Voto"}
                      </div>
                      {candidate ? (
                        <>
                          <img
                            src={candidate.img}
                            alt={candidate.name}
                            className="mt-2 h-20 w-16 rounded border border-[#1a2a10]/40 object-cover"
                          />
                          <div className="mt-2 text-[13px] font-black uppercase tracking-wide">
                            {candidate.name}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest opacity-80">
                            Nº {candidate.number} • {candidate.party}
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
                      <div className="text-[20px] font-black uppercase leading-tight">
                        Presidente
                      </div>
                      <div className="mt-3 text-[11px] uppercase tracking-widest">
                        Número do candidato:
                      </div>
                      <div className="mt-1 flex gap-2">
                        {[0, 1].map((i) => (
                          <div
                            key={i}
                            className={`grid h-14 w-11 place-items-center rounded border-2 text-3xl font-black ${
                              digits[i]
                                ? "border-[#1a2a10] bg-white/60"
                                : "border-[#1a2a10]/40 bg-white/20"
                            }`}
                          >
                            {digits[i] ?? ""}
                          </div>
                        ))}
                      </div>

                      {candidate && (
                        <div className="mt-3 flex items-center gap-3 rounded-md border border-[#1a2a10]/30 bg-white/50 p-2">
                          <img
                            src={candidate.img}
                            alt={candidate.name}
                            className="h-14 w-11 rounded border border-[#1a2a10]/40 object-cover"
                          />
                          <div className="leading-tight">
                            <div className="text-[12px] font-black uppercase tracking-wide">
                              {candidate.name}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest opacity-80">
                              Partido: {candidate.party}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest opacity-70">
                              Presidente • Nº {candidate.number}
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
              </div>

              {/* Keypad */}
              <div className="rounded-lg border border-[#3a2f1c] bg-[#111] p-3">
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
                    className="rounded-md bg-[#f0f0f0] py-2.5 text-[11px] font-black uppercase tracking-widest text-[#111] shadow-[0_2px_0_#000] transition active:translate-y-0.5"
                  >
                    Branco
                  </button>
                  <button
                    onClick={corrige}
                    className="rounded-md bg-[#e07800] py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_2px_0_#000] transition active:translate-y-0.5"
                  >
                    Corrige
                  </button>
                  <button
                    onClick={confirma}
                    disabled={!canConfirm}
                    className="rounded-md bg-[#0a8f2a] py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0_2px_0_#000] transition active:translate-y-0.5 disabled:opacity-40"
                  >
                    Confirma
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Base preta como a urna real */}
          <div className="mt-1 h-3 rounded-b-[6px] bg-[#111]" />
        </div>

        <div className="mt-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Candidatos: 13 · 14 · 22 · 28
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
      className="grid h-12 place-items-center rounded-md bg-gradient-to-b from-[#4a4a4a] to-[#1a1a1a] text-lg font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_0_#000] transition active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
    >
      {children}
    </button>
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
          GAZETA <span className="text-[#009c3b]">DIREITA</span>
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
      <section className="relative bg-white">
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-14 text-center md:pt-20">
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
      name: "Flávio Bolsonaro",
      role: "Senador — Rio de Janeiro",
      img: "https://i.imgur.com/t0BjptQ.jpeg",
      bio: "Flávio Bolsonaro é advogado, empresário e político brasileiro. Filho do ex-presidente Jair Bolsonaro, foi deputado estadual no Rio de Janeiro por quatro mandatos e atualmente é senador pelo Rio de Janeiro, filiado ao PL. Sua atuação política é fortemente ligada a pautas da direita, especialmente segurança pública e temas conservadores.",
    },
    {
      name: "Flávio Bolsonaro",
      role: "Presidente da Comissão de Segurança Pública",
      img: "https://i.imgur.com/DM6vnGP.jpeg",
      bio: "Flávio Bolsonaro é senador pelo Rio de Janeiro, filiado ao PL, e filho do ex-presidente Jair Bolsonaro. Está no Senado desde 2019 e tem atuação ligada principalmente à segurança pública e às pautas da direita e do conservadorismo brasileiro. Atualmente, também preside a Comissão de Segurança Pública do Senado.",
    },
    {
      name: "Nikolas Ferreira",
      role: "Deputado Federal — Minas Gerais",
      img: "https://i.imgur.com/dS56vM5.jpeg",
      bio: "Nikolas Ferreira é deputado federal por Minas Gerais, conhecido pela forte presença nas redes sociais e por seu discurso conservador. Filiado ao PL, ganhou projeção nacional defendendo pautas da direita, críticas ao governo Lula e posições alinhadas ao bolsonarismo.",
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
            SEJA PATRIOTA ASSIM COMO ELES
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Referências da direita brasileira. Passe o cursor para conhecer.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => (
            <article
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-200">
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                {/* Hover bio overlay */}
                <div className="absolute inset-0 flex items-end bg-black/70 p-5 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
                  <p className="text-[13px] leading-relaxed text-white">
                    {c.bio}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 flex">
                  <div className="flex-1 bg-[#009c3b]" />
                  <div className="flex-1 bg-[#ffdf00]" />
                  <div className="flex-1 bg-[#002776]" />
                </div>
              </div>
              <div className="p-5">
                <div
                  className="text-lg font-black leading-tight text-slate-900"
                  style={{ fontFamily: "'Bebas Neue', 'Oswald', 'Impact', system-ui, sans-serif", letterSpacing: "0.04em" }}
                >
                  {c.name.toUpperCase()}
                </div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#002776]">
                  {c.role}
                </div>
              </div>
            </article>
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
            Sua experiência Gazeta Direita está pronta.
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

// ---------------- Reveal (simplified result + checkout) ----------------

function Reveal() {
  useEffect(() => {
    track("newspaper_preview_viewed");
    track("offer_viewed");
  }, []);

  const handleCheckout = () => {
    track("checkout_clicked", { ...getUtms(), placement: "reveal" });
    // Integração futura com checkout
  };

  return (
    <section className="relative bg-white">
      <div className="relative mx-auto max-w-3xl px-5 py-16 md:py-24">
        {/* Resultado do quiz */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#009c3b]/10 text-[#009c3b]">
              <Check className="h-5 w-5" strokeWidth={3} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#009c3b]">
                Resultado do quiz
              </div>
              <div className="font-serif text-lg font-bold text-slate-900">
                Seu perfil de leitor
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: "Perfil", value: "Patriota" },
              { label: "Interesse", value: "Alto" },
              { label: "Linha", value: "Conservadora" },
            ].map((it) => (
              <div
                key={it.label}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center"
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {it.label}
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">{it.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagem principal */}
        <h2 className="mt-10 font-serif text-3xl leading-tight text-slate-900 md:text-4xl">
          Você acompanha o Brasil, valoriza a informação e demonstra interesse
          pelo rumo do nosso país.
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-slate-700 md:text-xl">
          Por isso chegou o <strong className="text-slate-900">Gazeta Direita</strong>{" "}
          — notícias e análises organizadas em um único lugar.
        </p>

        {/* CTA de checkout */}
        <div className="mt-10">
          <button
            onClick={handleCheckout}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#009c3b] px-8 py-5 text-base font-bold uppercase tracking-wider text-white shadow-[0_20px_60px_-20px_rgba(0,156,59,0.55)] transition hover:bg-[#007a2e] md:w-auto"
          >
            Quero acessar o Gazeta Direita
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </button>
          <div className="mt-3 text-xs text-slate-500">
            Acesso rápido • Leia pelo celular • Ambiente digital
          </div>
        </div>
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
          © {new Date().getFullYear()} Gazeta Direita — Jornal digital independente
        </div>
      </div>
    </footer>
  );
}
