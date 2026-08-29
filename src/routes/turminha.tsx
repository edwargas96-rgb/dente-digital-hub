import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlarmClock, ArrowRight, Check, Flame, Shield, ShieldCheck, X } from "lucide-react";

const CHECKOUT_BASE = "https://pay.cakto.com.br/ju6qpyv_1071213";
const CUPOM = "RESPEITO";
const PRECO_CHEIO = "R$ 51,60";
const PRECO_OFERTA = "R$ 12,90";

const CAPA = "/offer/turminha-capa.png";
const PERSONAGEM = "/offer/turminha-personagens.png";

const URGENCIA_SEGUNDOS = 15 * 60;
const ESTOQUE_INICIAL = 47;

export const Route = createFileRoute("/turminha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Turminha do Bem — Ninguem mais liga em ensinar boas maneiras. Voce liga." },
      {
        name: "description",
        content:
          "Livro digital em quadrinhos que ensina respeito, gentileza e empatia para o seu filho. Porque a escola nao ensina mais.",
      },
      { property: "og:title", content: "Turminha do Bem" },
      {
        property: "og:description",
        content: "Livro digital que ensina os valores que ninguem mais quer ensinar.",
      },
      { property: "og:image", content: CAPA },
    ],
  }),
  component: Turminha,
});

type EventName =
  | "livro_escolhido"
  | "pergunta_respondida"
  | "desconto_liberado"
  | "offer_viewed"
  | "checkout_clicked"
  | "exit_popup_shown"
  | "exit_popup_clicked";

function track(event: EventName, payload: Record<string, unknown> = {}) {
  try {
    const w = window as unknown as {
      dataLayer?: Array<Record<string, unknown>>;
      fbq?: (...a: unknown[]) => void;
      gtag?: (...a: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...payload });
    if (typeof w.fbq === "function") w.fbq("trackCustom", event, payload);
    if (typeof w.gtag === "function") w.gtag("event", event, payload);
  } catch {
    /* noop */
  }
}

function buildCheckoutUrl(): string {
  const url = new URL(CHECKOUT_BASE);
  url.searchParams.set("coupon", CUPOM);
  if (typeof window !== "undefined") {
    const src = new URL(window.location.href);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
      const v = src.searchParams.get(k);
      if (v) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

/* ------------------------ Enfeites visuais ------------------------ */

function MarkerHL({ children, cor = "#ffe600" }: { children: React.ReactNode; cor?: string }) {
  return (
    <span
      className="relative inline"
      style={{
        backgroundImage: `linear-gradient(180deg, transparent 55%, ${cor} 55%, ${cor} 92%, transparent 92%)`,
        padding: "0 2px",
      }}
    >
      {children}
    </span>
  );
}

function StickerBurst({
  children,
  cor = "#c60c0c",
  corTexto = "#ffffff",
  rot = -8,
  className = "",
}: {
  children: React.ReactNode;
  cor?: string;
  corTexto?: string;
  rot?: number;
  className?: string;
}) {
  return (
    <div
      className={"relative inline-flex items-center justify-center " + className}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full absolute inset-0" aria-hidden="true">
        <polygon
          points="100,4 118,32 152,18 152,54 190,60 168,90 200,110 168,124 190,158 152,150 152,190 118,176 100,200 82,176 48,190 48,150 10,158 32,124 0,110 32,90 10,60 48,54 48,18 82,32"
          fill={cor}
          stroke="#0a1a54"
          strokeWidth="4"
        />
      </svg>
      <span
        className="relative z-10 px-2 py-3 text-center font-heading font-black leading-[0.95] uppercase"
        style={{ color: corTexto }}
      >
        {children}
      </span>
    </div>
  );
}

function TapeStrip({ className = "", cor = "#ffe600" }: { className?: string; cor?: string }) {
  return (
    <div
      className={"absolute left-1/2 top-[-14px] h-6 w-24 -translate-x-1/2 opacity-90 " + className}
      style={{
        background: cor,
        transform: "translateX(-50%) rotate(-3deg)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
      }}
    />
  );
}

function WavyDivider({ cor = "#0a1a54" }: { cor?: string }) {
  return (
    <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="block h-4 w-full" aria-hidden="true">
      <path d="M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 T 250 10 T 300 10 T 350 10 T 400 10" fill="none" stroke={cor} strokeWidth="3" />
    </svg>
  );
}

function DoodleStar({ size = 22, className = "", cor = "#0a1a54" }: { size?: number; className?: string; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21 L12 17 L6 21 L8 14 L2 9.5 L9.5 9 Z" fill={cor} stroke="#0a1a54" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------ Countdown + Estoque + Sales ------------------------ */

function useCountdown() {
  const [secs, setSecs] = useState(URGENCIA_SEGUNDOS);
  useEffect(() => {
    const key = "turminha_urgencia_start";
    let start = Number(localStorage.getItem(key));
    if (!start || Number.isNaN(start)) {
      start = Date.now();
      localStorage.setItem(key, String(start));
    }
    const tick = () => {
      const passado = Math.floor((Date.now() - start) / 1000);
      setSecs(Math.max(0, URGENCIA_SEGUNDOS - passado));
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return { mm, ss, terminou: secs === 0 };
}

function UrgencyBar() {
  const { mm, ss, terminou } = useCountdown();
  return (
    <div
      className={
        "sticky top-1 z-20 flex items-center justify-center gap-2 border-y-2 border-[#0a1a54] py-2 text-center font-heading text-[13px] font-black uppercase tracking-[0.06em] text-white " +
        (terminou ? "bg-[#5a5a5a]" : "bg-[#c60c0c]")
      }
    >
      <AlarmClock className="size-4" strokeWidth={2.6} />
      {terminou ? (
        <span>Oferta encerrada, atualize a pagina se ainda tiver interesse</span>
      ) : (
        <span>
          Seu desconto expira em <span className="ml-1 rounded bg-white px-1.5 font-mono text-[#c60c0c]">{mm}:{ss}</span>
        </span>
      )}
    </div>
  );
}

function useEstoque() {
  const [n, setN] = useState(ESTOQUE_INICIAL);
  useEffect(() => {
    const ref = { current: 0 as number };
    const agendar = () => {
      const delay = 20_000 + Math.random() * 25_000;
      return window.setTimeout(() => {
        setN((v) => (v > 5 ? v - 1 : v));
        ref.current = agendar();
      }, delay);
    };
    ref.current = agendar();
    return () => window.clearTimeout(ref.current);
  }, []);
  return n;
}

const COMPRAS = [
  { nome: "Carlos Eduardo", cidade: "Belo Horizonte, MG" },
  { nome: "Fernanda Lima", cidade: "Curitiba, PR" },
  { nome: "Marcos Antonio", cidade: "Salvador, BA" },
  { nome: "Patricia Gomes", cidade: "Fortaleza, CE" },
  { nome: "Rafael Souza", cidade: "Porto Alegre, RS" },
  { nome: "Juliana Alves", cidade: "Recife, PE" },
  { nome: "Anderson Silva", cidade: "Goiania, GO" },
  { nome: "Camila Ribeiro", cidade: "Manaus, AM" },
  { nome: "Roberto Dias", cidade: "Brasilia, DF" },
  { nome: "Aline Costa", cidade: "Campinas, SP" },
];

function SalesNotification() {
  const [idx, setIdx] = useState(0);
  const [mins, setMins] = useState(2);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let i = 0;
    let hide: number | undefined;
    let next: number | undefined;
    const show = () => {
      setIdx(i % COMPRAS.length);
      setMins(1 + Math.floor(Math.random() * 8));
      setVisible(true);
      hide = window.setTimeout(() => setVisible(false), 4500);
      i++;
      next = window.setTimeout(show, 22_000 + Math.random() * 15_000);
    };
    const first = window.setTimeout(show, 8000);
    return () => {
      window.clearTimeout(first);
      if (hide) window.clearTimeout(hide);
      if (next) window.clearTimeout(next);
    };
  }, []);

  const c = COMPRAS[idx];
  return (
    <div
      className={
        "fixed bottom-4 left-4 z-40 max-w-[290px] transition-all duration-500 " +
        (visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0")
      }
    >
      <div className="flex items-center gap-3 rounded-[18px] border-[3px] border-[#0a1a54] bg-white px-3.5 py-2.5 shadow-[4px_4px_0_#0a1a54]">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#0a7d3c] text-white">
          <Check className="h-5 w-5" strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight text-foreground">{c.nome}</p>
          <p className="text-[11.5px] leading-tight text-[#7A897F]">acabou de comprar em {c.cidade}</p>
          <p className="text-[10.5px] text-[#A0A99C]">ha {mins} min</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ Exit popup ------------------------ */

function ExitPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    track("exit_popup_shown");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  const checkout = useMemo(() => buildCheckoutUrl(), []);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(6,18,42,0.72)] px-4 py-6">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[22px] border-[6px] border-[#0f2b8a] bg-[#123fbe] text-white shadow-[8px_8px_0_#0a1a54]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
        >
          <X className="size-5" strokeWidth={2.4} />
        </button>
        <div
          className="px-5 pt-6 pb-5 text-center"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.14), transparent 45%), radial-gradient(circle at 80% 90%, rgba(11,26,84,0.6), transparent 55%)",
          }}
        >
          <p className="font-heading text-[68px] font-black leading-none tracking-[-0.02em] text-[#ff3b30] drop-shadow-[4px_4px_0_#0a1a54]">
            PARE
          </p>
          <p className="mt-1 font-heading text-[22px] font-extrabold tracking-tight text-white drop-shadow-[2px_2px_0_#0a1a54]">
            NAO SAIA AGORA
          </p>

          <div className="mx-auto mt-4 max-w-[320px] rounded-[14px] border-[3px] border-[#0a1a54] bg-white px-4 py-3 text-[#0a1a54] shadow-[3px_3px_0_#0a1a54]">
            <p className="text-[14px] font-semibold leading-tight">Seu filho merece aprender</p>
            <p className="mt-1 font-heading text-[20px] font-black leading-tight">
              <MarkerHL cor="#ffe600">RESPEITO</MarkerHL>,{" "}
              <MarkerHL cor="#c8f7d1">GENTILEZA</MarkerHL> e{" "}
              <MarkerHL cor="#f7c8e1">EMPATIA</MarkerHL>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <img
              src={CAPA}
              alt="Capa do livro"
              className="h-[130px] w-auto rounded-md border-[3px] border-white shadow-[3px_3px_0_#0a1a54] [transform:rotate(-3deg)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="text-left">
              <p className="rounded-md bg-[#ff3b30] px-2 py-1 font-heading text-[15px] font-black tracking-tight text-white shadow-[2px_2px_0_#0a1a54]">
                75% OFF
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                De <span className="line-through">{PRECO_CHEIO}</span> por
              </p>
              <p className="font-heading text-[36px] font-black leading-none text-[#ffe600] drop-shadow-[2px_2px_0_#0a1a54]">
                {PRECO_OFERTA}
              </p>
            </div>
          </div>

          <a
            href={checkout}
            onClick={() => track("exit_popup_clicked")}
            className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[12px] border-[3px] border-[#0a1a54] bg-[#0a7d3c] font-heading text-[17px] font-black uppercase tracking-wide text-white shadow-[4px_4px_0_#0a1a54] transition hover:brightness-110 active:translate-y-[2px]"
          >
            Quero garantir agora
            <ArrowRight className="size-5" strokeWidth={2.6} />
          </a>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-white/80">
            Aproveite antes que acabe
          </p>
        </div>
      </div>
    </div>
  );
}

function useExitIntent(enabled: boolean, onTrigger: () => void) {
  useEffect(() => {
    if (!enabled) return;
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      onTrigger();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) fire();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") fire();
    };
    const onPop = () => fire();
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("popstate", onPop);
    const t = window.setTimeout(fire, 60_000);
    return () => {
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("popstate", onPop);
      window.clearTimeout(t);
    };
  }, [enabled, onTrigger]);
}

/* ------------------------ Escolha de 3 livros ------------------------ */

type Livro = {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  cor: string;
  corTexto: string;
  fita: string;
  rot: number;
};

const LIVROS: Livro[] = [
  {
    id: "fila_enorme",
    titulo: "Jairzinho e a Fila Enorme",
    subtitulo: "Sobre respeito e esperar a vez",
    descricao: "Quando o novo restaurante da cidade abre, todo mundo empurra pra chegar na frente. Jairzinho descobre que ser primeiro nem sempre e ser o certo.",
    cor: "#123fbe",
    corTexto: "#ffe600",
    fita: "#c60c0c",
    rot: -3,
  },
  {
    id: "colega_novo",
    titulo: "Jairzinho e o Colega Novo",
    subtitulo: "Sobre empatia e acolher quem chega",
    descricao: "Chegou aluno novo na escola. Ninguem quer sentar do lado. Jairzinho tem uma ideia que muda o recreio inteiro e ensina o valor de olhar pro outro.",
    cor: "#0a7d3c",
    corTexto: "#fffdf5",
    fita: "#ffe600",
    rot: 2,
  },
  {
    id: "a_verdade",
    titulo: "Jairzinho e a Verdade",
    subtitulo: "Sobre honestidade e assumir erros",
    descricao: "Uma mentira pequena vai crescendo e crescendo. Ate que Jairzinho aprende que falar a verdade doi menos que carregar mentira nas costas.",
    cor: "#c60c0c",
    corTexto: "#ffe600",
    fita: "#123fbe",
    rot: -2,
  },
];

function EscolhaLivro({ onEscolher }: { onEscolher: (l: Livro) => void }) {
  return (
    <section className="px-5 pt-6 pb-8">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0a1a54] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#ffe600]">
          <DoodleStar size={14} cor="#ffe600" /> Passo 1 de 2
        </div>
        <h2 className="mt-3 font-heading text-[28px] font-black leading-[1.02] tracking-[-0.02em] text-foreground">
          Qual dessas historias fala mais com seu filho?
        </h2>
        <p className="mt-2 text-[14px] leading-[1.5] text-[#3a4a40]">
          Escolha uma. Voce vai comecar a leitura por ela. As outras vem no mesmo pacote.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {LIVROS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onEscolher(l)}
            className="group relative text-left"
            style={{ transform: `rotate(${l.rot}deg)` }}
          >
            <TapeStrip cor={l.fita} />
            <div
              className="overflow-hidden rounded-[18px] border-[4px] border-[#0a1a54] p-4 shadow-[6px_6px_0_#0a1a54] transition group-hover:-translate-y-1 group-hover:shadow-[8px_10px_0_#0a1a54] group-active:translate-y-[2px]"
              style={{ background: l.cor, color: l.corTexto }}
            >
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 font-heading text-[10.5px] font-black uppercase tracking-[0.06em] text-[#0a1a54]">
                <DoodleStar size={12} cor="#c60c0c" /> Livro {LIVROS.indexOf(l) + 1}
              </div>
              <h3 className="font-heading text-[22px] font-black leading-[1.05] tracking-[-0.01em]">
                {l.titulo}
              </h3>
              <p className="mt-1 font-heading text-[12.5px] font-bold uppercase tracking-[0.08em] opacity-95">
                {l.subtitulo}
              </p>
              <p className="mt-3 rounded-[10px] bg-black/25 px-3 py-2 text-[13.5px] leading-[1.45]">
                {l.descricao}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-[10px] border-[3px] border-white bg-white px-3 py-2 font-heading text-[14px] font-black uppercase text-[#0a1a54] shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
                Quero comecar por esse
                <ArrowRight className="size-4" strokeWidth={2.6} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-[12px] text-[#7A897F]">
        Sua escolha vira o volume que abre primeiro. O pacote completo continua sendo o mesmo pra todos.
      </p>
    </section>
  );
}

/* ------------------------ Pergunta unica ------------------------ */

const PERGUNTA = {
  titulo: "Antes de liberar seu desconto, uma pergunta sincera.",
  subtitulo: "Sua resposta so libera o desconto, ninguem ve.",
  opcoes: [
    "Tempo demais no celular, pouco tempo com a familia",
    "A escola nao reforca o que ensino em casa",
    "Amigos e influencers falam mais alto que eu",
    "Ele responde, nao obedece, nao respeita",
  ],
};

function Pergunta({ livro, onResponder }: { livro: Livro; onResponder: (opcao: string) => void }) {
  return (
    <section className="px-5 pt-6 pb-8">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0a7d3c] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-white">
          <Check className="size-3.5" strokeWidth={3} /> Livro escolhido
        </div>
        <p className="mt-2 font-heading text-[14.5px] font-bold text-[#0a1a54]">
          Voce escolheu: {livro.titulo}
        </p>
      </div>

      <div className="mb-6 rounded-[18px] border-[4px] border-[#0a1a54] bg-[#fff4ce] px-4 py-4 shadow-[4px_4px_0_#0a1a54]">
        <h2 className="font-heading text-[22px] font-black leading-[1.1] tracking-[-0.01em] text-[#0a1a54]">
          {PERGUNTA.titulo}
        </h2>
        <p className="mt-2 text-[13.5px] font-semibold leading-[1.45] text-[#3a4a40]">
          Qual e a maior dificuldade que voce enfrenta em educar seu filho hoje?
        </p>
        <p className="mt-1 text-[12px] text-[#6b5a1e]">{PERGUNTA.subtitulo}</p>
      </div>

      <div className="flex flex-col gap-3">
        {PERGUNTA.opcoes.map((opcao, i) => (
          <button
            key={opcao}
            type="button"
            onClick={() => onResponder(opcao)}
            className="group flex items-center justify-between gap-3 rounded-[16px] border-[3px] border-[#0a1a54] bg-white px-4 py-4 text-left shadow-[4px_4px_0_#0a1a54] transition hover:-translate-y-1 hover:shadow-[5px_6px_0_#0a1a54] hover:bg-[#eefaf1] active:translate-y-[2px]"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] border-[3px] border-[#0a1a54] bg-[#ffe600] font-heading text-[14px] font-black text-[#0a1a54]">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-[14.5px] font-bold leading-[1.35] text-[#20302A]">{opcao}</span>
            </span>
            <ArrowRight className="size-5 flex-none text-[#0a7d3c]" strokeWidth={2.8} />
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-[11.5px] text-[#8A978D]">
        Qualquer resposta libera seu desconto. E so pra gente saber por onde comecar a ajudar.
      </p>
    </section>
  );
}

/* ------------------------ Página ------------------------ */

type Stage = "landing" | "escolha" | "pergunta" | "oferta";

function Turminha() {
  const [stage, setStage] = useState<Stage>("landing");
  const [livroEscolhido, setLivroEscolhido] = useState<Livro | null>(null);
  const [showExit, setShowExit] = useState(false);
  const exitShownRef = useRef(false);

  const triggerExit = useCallback(() => {
    if (exitShownRef.current) return;
    if (stage === "oferta") return;
    exitShownRef.current = true;
    setShowExit(true);
  }, [stage]);

  useExitIntent(stage !== "oferta", triggerExit);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".fp-reveal"));
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
  }, [stage]);

  useEffect(() => {
    if (stage === "oferta") track("offer_viewed", { livro: livroEscolhido?.id });
  }, [stage, livroEscolhido]);

  const abrirEscolha = () => {
    setStage("escolha");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const escolherLivro = (l: Livro) => {
    setLivroEscolhido(l);
    track("livro_escolhido", { livro: l.id });
    setStage("pergunta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const responder = (opcao: string) => {
    track("pergunta_respondida", { resposta: opcao });
    track("desconto_liberado");
    setStage("oferta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      className="fp-scope flex min-h-screen justify-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(130% 70% at 50% -8%, rgba(10,125,60,.12), transparent 55%), radial-gradient(90% 55% at 108% 4%, rgba(232,183,19,.16), transparent 55%), radial-gradient(80% 55% at -8% 8%, rgba(18,43,107,.09), transparent 55%), #eef1e6",
      }}
    >
      <SalesNotification />
      <div className="relative w-full max-w-[468px] bg-card shadow-[0_0_70px_rgba(9,26,18,.13)]">
        <div className="sticky top-0 z-30 h-1 fp-tricolor" />
        <UrgencyBar />

        {stage === "landing" && <LandingContent onCta={abrirEscolha} />}
        {stage === "escolha" && <EscolhaLivro onEscolher={escolherLivro} />}
        {stage === "pergunta" && livroEscolhido && <Pergunta livro={livroEscolhido} onResponder={responder} />}
        {stage === "oferta" && <OfertaContent livro={livroEscolhido} />}
      </div>

      {showExit && <ExitPopup onClose={() => setShowExit(false)} />}
    </main>
  );
}

/* ------------------------ Landing ------------------------ */

function LandingContent({ onCta }: { onCta: () => void }) {
  const estoque = useEstoque();
  return (
    <>
      {/* HERO */}
      <section className="relative px-5 pt-6 pb-8">
        {/* Adesivo canto */}
        <div className="pointer-events-none absolute right-2 top-3 h-16 w-16">
          <StickerBurst cor="#ffe600" corTexto="#0a1a54" rot={12} className="h-16 w-16 text-[11px] leading-[0.9]">
            NOVO
            <br />
            2026
          </StickerBurst>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#0a1a54] bg-[#0a1a54] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#ffe600]">
          <Flame className="size-3.5" strokeWidth={2.6} /> Alerta pra pais atentos
        </div>

        <h1 className="mt-3 font-heading text-[32px] font-black leading-[1] tracking-[-0.02em] text-foreground">
          <MarkerHL cor="#ffe600">Ninguem</MarkerHL> mais liga em ensinar{" "}
          <MarkerHL cor="#c8f7d1">boas maneiras</MarkerHL> pro seu filho.
        </h1>
        <p className="mt-3 text-[16px] leading-[1.45] font-semibold text-[#0a1a54]">
          A escola nao ensina. Os outros pais nao ensinam. A internet ensina o contrario. Sobrou pra voce.
        </p>

        <div className="relative mt-6 flex justify-center">
          {/* Estrelinhas decorativas */}
          <DoodleStar size={30} cor="#ffe600" className="absolute -left-2 top-4 [transform:rotate(-15deg)]" />
          <DoodleStar size={22} cor="#c60c0c" className="absolute right-0 top-24 [transform:rotate(12deg)]" />
          <img
            src={CAPA}
            alt="Capa do livro Turminha do Bem, Jairzinho e a Fila Enorme"
            className="w-[260px] rounded-[14px] border-[6px] border-white shadow-[8px_8px_0_#0a1a54] [transform:rotate(-3deg)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-[14px] border-[3px] border-[#0a1a54] bg-[#fff4ce] px-3 py-3 text-[13.5px] font-bold leading-[1.35] text-[#0a1a54] shadow-[3px_3px_0_#0a1a54]">
          <Flame className="size-5 flex-none text-[#c60c0c]" strokeWidth={2.6} />
          <span>
            Restam <span className="font-heading text-[18px] text-[#c60c0c]">{estoque}</span> desconto
            {estoque === 1 ? "" : "s"} de 75% liberado{estoque === 1 ? "" : "s"} pra hoje
          </span>
        </div>

        <button
          type="button"
          onClick={onCta}
          className="mt-4 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-[#0a1a54] bg-[#c60c0c] font-heading text-[18px] font-black uppercase tracking-wide text-white shadow-[6px_6px_0_#0a1a54] transition hover:brightness-110 active:translate-y-[3px] active:shadow-[3px_3px_0_#0a1a54] fp-btn fp-cta"
        >
          Escolher meu livro
          <ArrowRight className="size-5" strokeWidth={2.8} />
        </button>
        <p className="mt-2 text-center text-[12.5px] text-[#53645A]">
          Escolha 1 dos 3 livros. Responda 1 pergunta. Ganhe 75% de desconto.
        </p>
      </section>

      <WavyDivider cor="#0a1a54" />

      {/* SEÇÃO NINGUÉM LIGA - AGRESSIVA */}
      <section className="fp-reveal relative w-full bg-[#0a1a54] px-5 py-8 text-white">
        <div className="pointer-events-none absolute right-4 top-4 h-20 w-20">
          <StickerBurst cor="#c60c0c" corTexto="#ffe600" rot={14} className="h-20 w-20 text-[12px] leading-[0.9]">
            VERDADE
            <br />
            NUA
          </StickerBurst>
        </div>

        <span className="inline-block h-[3px] w-12 rounded-full bg-[#ffe600]" />
        <h2 className="mt-3 font-heading text-[28px] font-black leading-[1.02] tracking-[-0.02em]">
          Vamos falar a <MarkerHL cor="#ffe600"><span className="text-[#0a1a54]">verdade</span></MarkerHL> que ninguem quer falar.
        </h2>

        <ul className="mt-5 flex flex-col gap-4">
          {[
            {
              t: "A escola desistiu.",
              d: "Professor cansado, salario baixo, reforma atras de reforma. Ensinar boas maneiras virou coisa de familia, e a familia esta ocupada demais.",
            },
            {
              t: "Os outros pais desistiram.",
              d: "Ninguem mais corrige criancinha na festa. Ninguem manda esperar a vez. Todo mundo tem medo de parecer chato.",
            },
            {
              t: "A internet nao desistiu.",
              d: "TikTok, YouTube e algoritmo trabalham 24 horas por dia formando o carater do seu filho. E eles nao ligam pra respeito, ligam pra engajamento.",
            },
            {
              t: "Sobrou pra voce.",
              d: "Ou voce ensina, ou seu filho vai crescer sendo o adulto mal-educado que voce nao suporta encontrar hoje.",
            },
          ].map((item) => (
            <li key={item.t} className="rounded-[14px] border-[3px] border-[#ffe600] bg-white/5 p-4">
              <p className="font-heading text-[17px] font-black leading-tight text-[#ffe600]">{item.t}</p>
              <p className="mt-1.5 text-[13.5px] leading-[1.45] text-white/95">{item.d}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-[14px] border-[3px] border-[#0a1a54] bg-[#ffe600] px-4 py-4 font-heading text-[16px] font-black leading-[1.2] text-[#0a1a54] shadow-[4px_4px_0_#000]">
          Se voce nao ensinar, alguem ensina no seu lugar. E raramente e alguem que voce aprovaria.
        </div>
      </section>

      <WavyDivider cor="#0a1a54" />

      {/* PERSONAGENS */}
      <section className="fp-reveal relative px-5 pt-7 pb-2">
        <div className="pointer-events-none absolute left-4 top-4">
          <DoodleStar size={26} cor="#ffe600" className="[transform:rotate(-20deg)]" />
        </div>
        <span className="fp-accent" />
        <h2 className="font-heading text-[24px] font-black leading-[1.05] tracking-[-0.02em] text-foreground">
          Conheca a{" "}
          <MarkerHL cor="#c8f7d1">Turma do Bem</MarkerHL>.
        </h2>
        <p className="mt-2 text-[14.5px] leading-[1.5] text-[#3a4a40]">
          Cinco personagens que enfrentam as mesmas situacoes que seu filho enfrenta todo dia. A fila do recreio. A
          mentira que parecia inofensiva. O colega novo. O tal do fazer o certo mesmo quando ninguem esta olhando.
        </p>

        <div className="mt-5 flex justify-center">
          <img
            src={PERSONAGEM}
            alt="Personagens da Turma do Bem"
            className="w-full max-w-[380px] rounded-[16px] border-[4px] border-[#0a1a54] shadow-[6px_6px_0_#0a1a54] [transform:rotate(-1deg)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {[
            "Historias em quadrinhos que a crianca le sozinha e pede pra ler de novo",
            "Personagens fortes que servem de exemplo, nao de mau exemplo",
            "Licoes diretas sobre respeito, gentileza, honestidade e amor a familia",
            "Sem violencia gratuita, sem doutrinacao, sem enrolacao",
          ].map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 rounded-[14px] border-[3px] border-[#0a1a54] bg-white px-4 py-3 shadow-[3px_3px_0_#0a1a54]"
            >
              <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-[8px] border-[2px] border-[#0a1a54] bg-[#0a7d3c] text-white">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <span className="text-[14.5px] font-semibold leading-[1.42] text-[#20302A]">{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="fp-reveal px-5 pt-8">
        <button
          type="button"
          onClick={onCta}
          className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-[#0a1a54] bg-[#c60c0c] font-heading text-[18px] font-black uppercase tracking-wide text-white shadow-[6px_6px_0_#0a1a54] transition hover:brightness-110 active:translate-y-[3px] active:shadow-[3px_3px_0_#0a1a54] fp-btn fp-cta"
        >
          Escolher meu livro
          <ArrowRight className="size-5" strokeWidth={2.8} />
        </button>
        <p className="mt-2 text-center text-[12.5px] text-[#53645A]">
          Escolha 1 dos 3. Responda 1 pergunta. Desconto liberado.
        </p>
      </section>

      <WavyDivider cor="#0a1a54" />

      {/* DEPOIMENTOS */}
      <section className="fp-reveal px-5 pt-7 pb-2">
        <span className="fp-accent" />
        <h2 className="font-heading text-[24px] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
          O que outros pais estao dizendo.
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {[
            {
              nome: "Marcia Ribeiro",
              lugar: "Curitiba, PR",
              rot: -1,
              quote:
                "Meu filho de 7 anos leu de uma vez so e ficou pedindo pra ler de novo. As conversas depois foram naturais, coisa que eu nunca conseguia puxar sozinha.",
            },
            {
              nome: "Roberto Almeida",
              lugar: "Fortaleza, CE",
              rot: 1,
              quote:
                "Finalmente um livro infantil que fala de valores sem enrolar. Comprei um pra minha filha e mandei o link pros meus dois irmaos comprarem tambem.",
            },
            {
              nome: "Juliana Prado",
              lugar: "Belo Horizonte, MG",
              rot: -0.5,
              quote:
                "Uso na sala de aula depois do intervalo. As criancas pedem pra continuar a historia. Vale muito mais que qualquer material didatico caro.",
            },
          ].map((t) => (
            <figure
              key={t.nome}
              className="relative rounded-[16px] border-[3px] border-[#0a1a54] bg-white p-4 shadow-[4px_4px_0_#0a1a54]"
              style={{ transform: `rotate(${t.rot}deg)` }}
            >
              <TapeStrip cor="#ffe600" />
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full border-[3px] border-[#0a1a54] bg-[#ffe600] font-heading text-[15px] font-black text-[#0a1a54]">
                  {t.nome
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <figcaption className="min-w-0 flex-1">
                  <div className="font-heading text-[14.5px] font-black text-foreground">{t.nome}</div>
                  <span className="block text-[12px] text-[#7A897F]">{t.lugar}</span>
                </figcaption>
                <div className="flex flex-none gap-px text-[#E8B713]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <DoodleStar key={i} size={16} cor="#E8B713" />
                  ))}
                </div>
              </div>
              <blockquote className="mt-3 text-[14px] leading-[1.55] text-[#3A4A40]">{t.quote}</blockquote>
            </figure>
          ))}
        </div>
      </section>

      {/* GARANTIA */}
      <section className="fp-reveal px-5 pt-6 pb-2">
        <div className="rounded-[16px] border-[3px] border-[#0a1a54] bg-white p-4 shadow-[4px_4px_0_#0a1a54]">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-[18px] w-[18px] flex-none text-[#0a7d3c]" strokeWidth={2.4} />
            <h3 className="font-heading text-[16px] font-black text-foreground">Compra 100% segura</h3>
          </div>
          <ul className="flex flex-col gap-[9px] pb-1">
            {[
              "Entrega imediata no seu e-mail depois do pagamento",
              "PDF alta qualidade pra ler no celular, tablet ou imprimir em casa",
              "Pagamento unico, sem assinatura, sem mensalidade",
              "Garantia incondicional de 7 dias, seu dinheiro de volta",
              "Compra segura pela Cakto, seus dados protegidos",
            ].map((item) => (
              <li key={item} className="flex items-start gap-[9px]">
                <Check className="mt-0.5 h-4 w-4 flex-none text-[#0a7d3c]" strokeWidth={3} />
                <span className="text-[13.5px] leading-[1.45] text-[#4B5B50]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="px-5 pt-6 pb-8 text-center">
        <p className="text-[11.5px] text-[#8A978D]">
          Copyright {new Date().getFullYear()} Nobilex. Todos os direitos reservados.
        </p>
        <p className="mt-1 text-[11px] text-[#A0A99C]">
          Suporte:{" "}
          <a href="mailto:suporte@nobilex.com.br" className="underline">
            suporte@nobilex.com.br
          </a>
        </p>
      </footer>
    </>
  );
}

/* ------------------------ Oferta ------------------------ */

function OfertaContent({ livro }: { livro: Livro | null }) {
  const checkout = useMemo(() => buildCheckoutUrl(), []);
  const [copied, setCopied] = useState(false);
  const estoque = useEstoque();

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(CUPOM);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <section className="relative px-5 pt-6 pb-6 text-center">
        <div className="pointer-events-none absolute right-3 top-3">
          <StickerBurst cor="#ffe600" corTexto="#0a1a54" rot={-14} className="h-20 w-20 text-[13px] leading-[0.9]">
            75%
            <br />
            OFF
          </StickerBurst>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border-[2px] border-[#0a1a54] bg-[#0a7d3c] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white">
          <Check className="size-3.5" strokeWidth={3} /> Desconto liberado
        </div>
        <h1 className="mt-3 font-heading text-[30px] font-black leading-[1.02] tracking-[-0.02em] text-foreground">
          Prontinho. Seu <MarkerHL cor="#ffe600">desconto de 75%</MarkerHL> ta ativo.
        </h1>
        {livro && (
          <p className="mt-2 text-[13.5px] font-semibold text-[#0a1a54]">
            Sua leitura vai comecar por <strong>{livro.titulo}</strong>.
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <img
            src={CAPA}
            alt="Capa"
            className="w-[240px] rounded-[14px] border-[6px] border-white shadow-[6px_6px_0_#0a1a54] [transform:rotate(-3deg)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-[14px] border-[3px] border-[#0a1a54] bg-[#fff4ce] px-3 py-3 text-[13.5px] font-bold leading-[1.35] text-[#0a1a54] shadow-[3px_3px_0_#0a1a54]">
          <Flame className="size-5 flex-none text-[#c60c0c]" strokeWidth={2.6} />
          <span>
            Restam <span className="font-heading text-[16px] text-[#c60c0c]">{estoque}</span> unidades neste preco
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[16px] border-[3px] border-dashed border-[#0a7d3c] bg-[#eefaf1] shadow-[4px_4px_0_#0a1a54]">
          <div className="bg-[#0a7d3c] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white">
            Seu cupom
          </div>
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="font-heading text-[28px] font-black tracking-[0.15em] text-[#0a7d3c]">{CUPOM}</span>
            <button
              type="button"
              onClick={copiar}
              className="rounded-[10px] border-[2px] border-[#0a1a54] bg-[#0a7d3c] px-3 py-1.5 text-[12px] font-black uppercase text-white transition hover:brightness-110"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[12.5px] font-black uppercase tracking-[0.1em] text-[#7A897F]">
            De <span className="line-through">{PRECO_CHEIO}</span> por apenas
          </p>
          <p className="mt-1 font-heading text-[52px] font-black leading-none text-[#0a7d3c] drop-shadow-[3px_3px_0_#0a1a54]">
            {PRECO_OFERTA}
          </p>
          <p className="mt-1 text-[12.5px] text-[#53645A]">Pagamento unico, sem assinatura</p>
        </div>

        <a
          href={checkout}
          onClick={() => track("checkout_clicked", { from: "oferta_hero" })}
          className="mt-6 flex min-h-[62px] w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-[#0a1a54] bg-[#c60c0c] font-heading text-[19px] font-black uppercase tracking-wide text-white shadow-[6px_6px_0_#0a1a54] transition hover:brightness-110 active:translate-y-[3px] active:shadow-[3px_3px_0_#0a1a54] fp-btn fp-cta"
        >
          Quero garantir agora
          <ArrowRight className="size-5" strokeWidth={2.8} />
        </a>
        <p className="mt-2 text-[12px] text-[#8A978D]">O cupom ja vai aplicado no seu checkout</p>
      </section>

      <WavyDivider cor="#0a1a54" />

      <section className="fp-reveal w-full bg-[#0a1a54] px-5 py-6 text-white">
        <h3 className="font-heading text-[19px] font-black leading-[1.15] tracking-[-0.01em]">
          O que vem junto com o livro
        </h3>
        <ul className="mt-4 flex flex-col gap-2.5">
          {[
            "Volume completo em PDF alta qualidade, pronto pra ler ou imprimir",
            "Guia rapido pra pais com temas pra conversar depois de cada historia",
            "Acesso vitalicio, sem prazo de expiracao",
            "Atualizacoes gratuitas de novas edicoes enviadas por e-mail",
          ].map((b) => (
            <li key={b} className="flex items-start gap-3 text-[14px] leading-[1.5] text-white/95">
              <DoodleStar size={16} cor="#ffe600" className="mt-0.5 flex-none" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="fp-reveal px-5 pt-6 pb-2">
        <div className="rounded-[16px] border-[3px] border-[#0a1a54] bg-white p-4 shadow-[4px_4px_0_#0a1a54]">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-[18px] w-[18px] flex-none text-[#0a7d3c]" strokeWidth={2.4} />
            <h3 className="font-heading text-[16px] font-black text-foreground">Garantia incondicional</h3>
          </div>
          <ul className="flex flex-col gap-[9px] pb-1">
            {[
              "Entrega imediata no seu e-mail depois do pagamento",
              "PDF alta qualidade pra ler no celular, tablet ou imprimir em casa",
              "Pagamento unico, sem assinatura, sem mensalidade",
              "Garantia incondicional de 7 dias, seu dinheiro de volta",
              "Compra segura pela Cakto, seus dados protegidos",
            ].map((item) => (
              <li key={item} className="flex items-start gap-[9px]">
                <Check className="mt-0.5 h-4 w-4 flex-none text-[#0a7d3c]" strokeWidth={3} />
                <span className="text-[13.5px] leading-[1.45] text-[#4B5B50]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fp-reveal px-5 pt-4 pb-8">
        <a
          href={checkout}
          onClick={() => track("checkout_clicked", { from: "oferta_footer" })}
          className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-[14px] border-[3px] border-[#0a1a54] bg-[#c60c0c] font-heading text-[18px] font-black uppercase tracking-wide text-white shadow-[6px_6px_0_#0a1a54] transition hover:brightness-110 active:translate-y-[3px] active:shadow-[3px_3px_0_#0a1a54] fp-btn fp-cta"
        >
          Comprar por {PRECO_OFERTA}
          <ArrowRight className="size-5" strokeWidth={2.8} />
        </a>
      </section>

      <footer className="px-5 pt-2 pb-8 text-center">
        <p className="text-[11.5px] text-[#8A978D]">
          Copyright {new Date().getFullYear()} Nobilex. Todos os direitos reservados.
        </p>
        <p className="mt-1 text-[11px] text-[#A0A99C]">
          Suporte:{" "}
          <a href="mailto:suporte@nobilex.com.br" className="underline">
            suporte@nobilex.com.br
          </a>
        </p>
      </footer>
    </>
  );
}
