import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Shield, ShieldCheck, X } from "lucide-react";

const CHECKOUT_BASE = "https://pay.cakto.com.br/ju6qpyv_1071213";
const CUPOM = "RESPEITO";
const PRECO_CHEIO = "R$ 51,60";
const PRECO_OFERTA = "R$ 12,90";

const CAPA = "/offer/turminha-capa.png";
const PERSONAGEM = "/offer/turminha-personagens.png";

export const Route = createFileRoute("/turminha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Turminha do Bem — Valores que a escola parou de ensinar" },
      {
        name: "description",
        content:
          "Livro digital que ensina respeito, gentileza e empatia para o seu filho. Histórias em quadrinhos com lições para a vida toda.",
      },
      { property: "og:title", content: "Turminha do Bem — Valores que a escola parou de ensinar" },
      {
        property: "og:description",
        content:
          "Livro digital que ensina respeito, gentileza e empatia para o seu filho. Histórias em quadrinhos com lições para a vida toda.",
      },
      { property: "og:image", content: CAPA },
    ],
  }),
  component: Turminha,
});

type EventName =
  | "quiz_started"
  | "quiz_answered"
  | "quiz_completed"
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

type QuizAnswer = { question: string; answer: string };
type Question = {
  id: string;
  titulo: string;
  subtitulo?: string;
  opcoes: string[];
};

const PERGUNTAS: Question[] = [
  {
    id: "tempo_tela",
    titulo: "Quanto tempo por dia seu filho passa no celular ou tablet?",
    subtitulo: "Sem julgamento, seja sincero com você mesmo.",
    opcoes: ["Menos de 1 hora", "Entre 1 e 3 horas", "Entre 3 e 5 horas", "Mais de 5 horas"],
  },
  {
    id: "valores_escola",
    titulo: "Você confia nos valores que a escola do seu filho ensina?",
    opcoes: [
      "Confio plenamente",
      "Confio em parte",
      "Não confio muito",
      "Não confio de jeito nenhum",
    ],
  },
  {
    id: "conversa_valores",
    titulo: "Com que frequência você conversa com seu filho sobre respeito, honestidade e gentileza?",
    opcoes: ["Todos os dias", "Algumas vezes por semana", "Raramente", "Quase nunca, falta tempo"],
  },
];

const BENEFICIOS = [
  "Histórias em quadrinhos que a criança lê sozinha e pede pra ler de novo",
  "Personagens fortes que servem de exemplo, não de mau exemplo",
  "Lições diretas sobre respeito, gentileza, honestidade e amor à família",
  "Sem violência gratuita, sem doutrinação, sem enrolação",
];

const GARANTIAS = [
  "Entrega imediata no seu e-mail depois do pagamento",
  "PDF de alta qualidade para ler no celular, tablet ou imprimir em casa",
  "Pagamento único, sem assinatura, sem mensalidade",
  "Garantia incondicional de 7 dias, seu dinheiro de volta se não gostar",
  "Compra 100% segura pela Cakto, seus dados protegidos",
];

const DEPOIMENTOS = [
  {
    nome: "Marcia Ribeiro",
    lugar: "Curitiba, PR",
    quote:
      "Meu filho de 7 anos leu de uma vez só e ficou pedindo pra ler de novo. As conversas depois foram naturais, coisa que eu nunca conseguia puxar sozinha.",
  },
  {
    nome: "Roberto Almeida",
    lugar: "Fortaleza, CE",
    quote:
      "Finalmente um livro infantil que fala de valores sem enrolar. Comprei um pra minha filha e mandei o link pros meus dois irmãos comprarem também.",
  },
  {
    nome: "Juliana Prado",
    lugar: "Belo Horizonte, MG",
    quote:
      "Uso na sala de aula depois do intervalo. As crianças pedem pra continuar a história. Vale muito mais que qualquer material didático caro.",
  },
];

function Star({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.7 5.5 6 .9-4.35 4.24 1.03 6-5.38-2.83L6.6 19.13l1.03-6L3.28 8.9l6-.9L12 2.5z" />
    </svg>
  );
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

/* ------------------------ Exit intent popup ------------------------ */

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
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[22px] border-[6px] border-[#0f2b8a] bg-[#123fbe] text-white shadow-[0_30px_60px_rgba(6,18,42,0.5)]">
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
          <p className="font-heading text-[64px] font-black leading-none tracking-[-0.02em] text-[#ff3b30] drop-shadow-[3px_3px_0_#0a1a54]">
            PARE
          </p>
          <p className="mt-1 font-heading text-[22px] font-extrabold tracking-tight text-white drop-shadow-[2px_2px_0_#0a1a54]">
            NÃO SAIA AGORA
          </p>

          <div className="mx-auto mt-4 max-w-[320px] rounded-[14px] bg-white px-4 py-3 text-[#0a1a54]">
            <p className="text-[14px] font-semibold leading-tight">Seu filho merece aprender</p>
            <p className="mt-1 font-heading text-[18px] font-black leading-tight">
              <span className="text-[#0a2f8a]">RESPEITO</span>,{" "}
              <span className="text-[#0a7d3c]">GENTILEZA</span> e{" "}
              <span className="text-[#6b2fb5]">EMPATIA</span>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <img
              src={CAPA}
              alt="Capa do livro Turminha do Bem"
              className="h-[130px] w-auto rounded-md border-[3px] border-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] [transform:rotate(-3deg)]"
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
              <p className="font-heading text-[34px] font-black leading-none text-[#ffe600] drop-shadow-[2px_2px_0_#0a1a54]">
                {PRECO_OFERTA}
              </p>
            </div>
          </div>

          <a
            href={checkout}
            onClick={() => track("exit_popup_clicked")}
            className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[12px] border-b-[4px] border-[#065a26] bg-[#0a7d3c] font-heading text-[17px] font-black uppercase tracking-wide text-white shadow-[0_10px_22px_rgba(10,125,60,0.5)] transition hover:brightness-110"
          >
            Quero garantir agora
            <ArrowRight className="size-5" strokeWidth={2.6} />
          </a>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-white/80">
            Oferta por tempo limitado
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

    const t = window.setTimeout(fire, 45_000);

    return () => {
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("popstate", onPop);
      window.clearTimeout(t);
    };
  }, [enabled, onTrigger]);
}

/* ------------------------ Página ------------------------ */

type Stage = "landing" | "quiz" | "oferta";

function Turminha() {
  const [stage, setStage] = useState<Stage>("landing");
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [qIndex, setQIndex] = useState(0);
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
    if (stage === "quiz") track("quiz_started");
    if (stage === "oferta") track("offer_viewed", { answers });
  }, [stage, answers]);

  const iniciarQuiz = () => {
    setAnswers([]);
    setQIndex(0);
    setStage("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const responder = (opcao: string) => {
    const q = PERGUNTAS[qIndex];
    const proxima = [...answers, { question: q.id, answer: opcao }];
    setAnswers(proxima);
    track("quiz_answered", { question: q.id, answer: opcao, step: qIndex + 1 });
    if (qIndex + 1 >= PERGUNTAS.length) {
      track("quiz_completed");
      setStage("oferta");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setQIndex(qIndex + 1);
    }
  };

  return (
    <main
      className="fp-scope flex min-h-screen justify-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(130% 70% at 50% -8%, rgba(10,125,60,.12), transparent 55%), radial-gradient(90% 55% at 108% 4%, rgba(232,183,19,.16), transparent 55%), radial-gradient(80% 55% at -8% 8%, rgba(18,43,107,.09), transparent 55%), #eef1e6",
      }}
    >
      <div className="relative w-full max-w-[468px] bg-card shadow-[0_0_70px_rgba(9,26,18,.13)]">
        <div className="sticky top-0 z-30 h-1 fp-tricolor" />

        {stage === "landing" && (
          <LandingContent onCta={iniciarQuiz} />
        )}
        {stage === "quiz" && (
          <QuizContent
            index={qIndex}
            total={PERGUNTAS.length}
            question={PERGUNTAS[qIndex]}
            onAnswer={responder}
          />
        )}
        {stage === "oferta" && <OfertaContent />}
      </div>

      {showExit && <ExitPopup onClose={() => setShowExit(false)} />}
    </main>
  );
}

/* ------------------------ Landing ------------------------ */

function LandingContent({ onCta }: { onCta: () => void }) {
  return (
    <>
      <section className="px-5 pt-6 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0a1a54] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#ffe600]">
          Alerta para pais
        </div>

        <h1 className="mt-3 font-heading text-[30px] font-black leading-[1.02] tracking-[-0.02em] text-foreground">
          A escola parou de ensinar valores. A internet ensina o contrário. Sobrou pra você.
        </h1>
        <p className="mt-3 text-[15px] leading-[1.5] text-[#3a4a40]">
          Enquanto você trabalha, seu filho aprende do jeito errado com influencer, algoritmo e escola que só cobra
          mensalidade. <strong>Turminha do Bem</strong> devolve pra sua família o que ninguém está mais ensinando.
        </p>

        <div className="mt-5 flex justify-center">
          <img
            src={CAPA}
            alt="As Aventuras da Turma do Bem, Volume 1, Jairzinho e a Fila Enorme"
            className="w-[260px] rounded-[14px] border-[6px] border-white shadow-[0_22px_46px_rgba(9,26,18,.24)] [transform:rotate(-2deg)]"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.background =
                "linear-gradient(180deg,#0a1a54,#123fbe)";
              img.style.aspectRatio = "3/4";
              img.style.display = "grid";
              img.alt = "Capa em breve";
            }}
          />
        </div>

        <button
          type="button"
          onClick={onCta}
          className="mt-6 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[14px] border-b-[5px] border-[#065a26] bg-[#0a7d3c] font-heading text-[17px] font-black uppercase tracking-wide text-white shadow-[0_14px_28px_rgba(10,125,60,.35)] transition hover:brightness-110 fp-btn fp-cta"
        >
          Fazer o teste em 30 segundos
          <ArrowRight className="size-[19px]" strokeWidth={2.6} />
        </button>
        <p className="mt-2 text-center text-[12.5px] text-[#53645A]">
          Responda 3 perguntas rápidas e libere seu cupom de desconto
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
            <ShieldCheck className="size-[14px] text-primary" strokeWidth={2} /> Garantia de 7 dias
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
            <Check className="size-[14px] text-primary" strokeWidth={2.2} /> Compra segura Cakto
          </span>
        </div>
      </section>

      <section className="fp-reveal w-full border-y border-[#ECEFE6] bg-[#0a1a54] px-5 py-7 text-white">
        <span className="inline-block h-[3px] w-10 rounded-full bg-[#ffe600]" />
        <h2 className="mt-3 font-heading text-[22px] font-black leading-[1.1] tracking-[-0.01em]">
          Enquanto você pensa, seu filho está sendo formado.
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {[
            "A maior parte do vocabulário que uma criança usa hoje vem de conteúdo que ela consome sozinha, sem filtro nenhum.",
            "A escola virou terreno de discussão política e esqueceu o básico: dizer bom dia, olhar no olho, esperar a vez.",
            "Nenhum livro didático fala mais em respeito, obediência aos pais, amor à pátria. Ninguém quer parecer careta.",
          ].map((t) => (
            <li key={t} className="flex gap-3 text-[14.5px] leading-[1.5] text-white/90">
              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#ffe600]" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-[12px] bg-[#ffe600] px-4 py-3 font-heading text-[15px] font-black leading-[1.25] text-[#0a1a54]">
          Se você não ensina, alguém ensina no seu lugar. E raramente é alguém que você aprovaria.
        </p>
      </section>

      <section className="fp-reveal px-5 pt-7 pb-2">
        <span className="fp-accent" />
        <h2 className="font-heading text-[22px] font-black leading-[1.1] tracking-[-0.01em] text-foreground">
          Conheça a Turminha do Bem.
        </h2>
        <p className="mt-2 text-[14.5px] leading-[1.5] text-[#3a4a40]">
          Cinco personagens, cada um com uma personalidade forte, vivendo situações que toda criança reconhece: a fila
          no recreio, a mentira que parecia inofensiva, o colega novo, o desafio de fazer o certo quando ninguém está
          olhando.
        </p>

        <div className="mt-5 flex justify-center">
          <img
            src={PERSONAGEM}
            alt="Personagens da Turma do Bem"
            className="w-full max-w-[380px] rounded-[14px]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {BENEFICIOS.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card px-[15px] py-[13px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
            >
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-[#0a7d3c] text-white">
                <Check className="size-4" strokeWidth={2.6} />
              </span>
              <span className="text-[14.5px] leading-[1.42] text-[#20302A]">{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="fp-reveal px-5 pt-7 pb-2">
        <span className="fp-accent" />
        <h2 className="font-heading text-[22px] font-black leading-[1.1] tracking-[-0.01em] text-foreground">
          O que outros pais estão dizendo.
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {DEPOIMENTOS.map((t) => (
            <figure
              key={t.nome}
              className="rounded-2xl border border-border bg-card p-[15px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#EAF4EC] font-heading text-[14px] font-black text-primary">
                  {t.nome
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <figcaption className="min-w-0 flex-1">
                  <div className="font-heading text-[14px] font-bold text-foreground">{t.nome}</div>
                  <span className="block text-[11.5px] text-[#8A978D]">{t.lugar}</span>
                </figcaption>
                <div className="flex flex-none gap-px text-[#E8B713]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} />
                  ))}
                </div>
              </div>
              <blockquote className="mt-3 text-[13.5px] leading-[1.55] text-[#3A4A40]">{t.quote}</blockquote>
            </figure>
          ))}
        </div>
      </section>

      <section className="fp-reveal px-5 pt-6">
        <button
          type="button"
          onClick={onCta}
          className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[14px] border-b-[5px] border-[#065a26] bg-[#0a7d3c] font-heading text-[17px] font-black uppercase tracking-wide text-white shadow-[0_14px_28px_rgba(10,125,60,.35)] transition hover:brightness-110 fp-btn fp-cta"
        >
          Liberar meu cupom agora
          <ArrowRight className="size-[19px]" strokeWidth={2.6} />
        </button>
        <p className="mt-2 text-center text-[12.5px] text-[#53645A]">
          Responda 3 perguntas rápidas para desbloquear 75 por cento de desconto
        </p>
      </section>

      <section className="fp-reveal px-5 pt-6 pb-2">
        <div className="overflow-hidden rounded-2xl border border-border shadow-[0_6px_18px_rgba(9,26,18,.05)]">
          <div className="bg-card px-4 pt-4 pb-1">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-[17px] w-[17px] flex-none text-primary" strokeWidth={2} />
              <h3 className="font-heading text-[15px] font-bold text-foreground">Segurança e transparência</h3>
            </div>
            <ul className="flex flex-col gap-[9px] pb-3.5">
              {GARANTIAS.map((item) => (
                <li key={item} className="flex items-start gap-[9px]">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-primary" strokeWidth={2.4} />
                  <span className="text-[13px] leading-[1.45] text-[#4B5B50]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="px-5 pt-6 pb-8 text-center">
        <p className="text-[11.5px] text-[#8A978D]">
          © {new Date().getFullYear()} Nobilex. Todos os direitos reservados.
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

/* ------------------------ Quiz ------------------------ */

function QuizContent({
  index,
  total,
  question,
  onAnswer,
}: {
  index: number;
  total: number;
  question: Question;
  onAnswer: (opcao: string) => void;
}) {
  const progresso = Math.round(((index + 1) / total) * 100);
  return (
    <section className="px-5 pt-8 pb-10">
      <div className="mb-6">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em] text-[#0a1a54]">
          <span>Pergunta {index + 1} de {total}</span>
          <span>{progresso}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#dfe4d5]">
          <div
            className="h-full rounded-full bg-[#0a7d3c] transition-[width] duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <h2 className="font-heading text-[24px] font-black leading-[1.1] tracking-[-0.01em] text-foreground">
        {question.titulo}
      </h2>
      {question.subtitulo && (
        <p className="mt-2 text-[13.5px] leading-[1.5] text-[#53645A]">{question.subtitulo}</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {question.opcoes.map((opcao, i) => (
          <button
            key={opcao}
            type="button"
            onClick={() => onAnswer(opcao)}
            className="group flex items-center justify-between gap-3 rounded-2xl border-2 border-[#E4E8DD] bg-card px-4 py-4 text-left shadow-[0_4px_12px_rgba(9,26,18,.05)] transition hover:border-[#0a7d3c] hover:bg-[#f2fbf5]"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[#EAF4EC] font-heading text-[13px] font-black text-primary group-hover:bg-[#0a7d3c] group-hover:text-white">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-[15px] font-semibold leading-[1.35] text-[#20302A]">{opcao}</span>
            </span>
            <ArrowRight className="size-5 flex-none text-[#0a7d3c]" strokeWidth={2.4} />
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-[11.5px] text-[#8A978D]">
        Este teste não julga ninguém. Serve só pra você desbloquear o cupom.
      </p>
    </section>
  );
}

/* ------------------------ Oferta (resultado do quiz) ------------------------ */

function OfertaContent() {
  const checkout = useMemo(() => buildCheckoutUrl(), []);
  const [copied, setCopied] = useState(false);

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
      <section className="px-5 pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0a7d3c] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white">
          <Check className="size-4" strokeWidth={3} /> Cupom liberado
        </div>
        <h1 className="mt-4 font-heading text-[30px] font-black leading-[1.05] tracking-[-0.02em] text-foreground">
          Seu filho merece aprender respeito, gentileza e empatia.
        </h1>
        <p className="mt-3 text-[15px] leading-[1.5] text-[#3a4a40]">
          Com base nas suas respostas, liberamos o desconto máximo. Aproveita agora, essa condição não fica no ar por
          muito tempo.
        </p>

        <div className="mt-6 flex justify-center">
          <img
            src={CAPA}
            alt="Capa do livro Turminha do Bem"
            className="w-[240px] rounded-[14px] border-[6px] border-white shadow-[0_22px_46px_rgba(9,26,18,.24)] [transform:rotate(-2deg)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-[16px] border-2 border-dashed border-[#0a7d3c] bg-[#eefaf1]">
          <div className="bg-[#0a7d3c] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white">
            Seu cupom
          </div>
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="font-heading text-[26px] font-black tracking-[0.15em] text-[#0a7d3c]">{CUPOM}</span>
            <button
              type="button"
              onClick={copiar}
              className="rounded-lg bg-[#0a7d3c] px-3 py-1.5 text-[12px] font-bold text-white transition hover:brightness-110"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#7A897F]">
            De <span className="line-through">{PRECO_CHEIO}</span> por apenas
          </p>
          <p className="mt-1 font-heading text-[46px] font-black leading-none text-[#0a7d3c]">{PRECO_OFERTA}</p>
          <p className="mt-1 text-[12.5px] text-[#53645A]">Pagamento único, sem assinatura</p>
        </div>

        <a
          href={checkout}
          onClick={() => track("checkout_clicked", { from: "oferta_hero" })}
          className="mt-6 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-[14px] border-b-[5px] border-[#065a26] bg-[#0a7d3c] font-heading text-[18px] font-black uppercase tracking-wide text-white shadow-[0_14px_28px_rgba(10,125,60,.4)] transition hover:brightness-110 fp-btn fp-cta"
        >
          Quero garantir agora
          <ArrowRight className="size-5" strokeWidth={2.6} />
        </a>
        <p className="mt-2 text-[11.5px] text-[#8A978D]">O cupom já vai aplicado no seu checkout</p>
      </section>

      <section className="fp-reveal w-full border-y border-[#ECEFE6] bg-[#0a1a54] px-5 py-6 text-white">
        <h3 className="font-heading text-[18px] font-black leading-[1.15] tracking-[-0.01em]">
          O que vem junto com o livro
        </h3>
        <ul className="mt-4 flex flex-col gap-2.5">
          {[
            "Volume 1 completo em PDF alta qualidade, pronto para ler ou imprimir",
            "Guia rápido para pais com temas para conversar depois de cada história",
            "Acesso vitalício, sem prazo de expiração",
            "Atualizações gratuitas de novas edições enviadas por e-mail",
          ].map((b) => (
            <li key={b} className="flex items-start gap-3 text-[14px] leading-[1.5] text-white/95">
              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#ffe600]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="fp-reveal px-5 pt-6 pb-2">
        <div className="overflow-hidden rounded-2xl border border-border shadow-[0_6px_18px_rgba(9,26,18,.05)]">
          <div className="bg-card px-4 pt-4 pb-1">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-[17px] w-[17px] flex-none text-primary" strokeWidth={2} />
              <h3 className="font-heading text-[15px] font-bold text-foreground">Garantia incondicional</h3>
            </div>
            <ul className="flex flex-col gap-[9px] pb-3.5">
              {GARANTIAS.map((item) => (
                <li key={item} className="flex items-start gap-[9px]">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-primary" strokeWidth={2.4} />
                  <span className="text-[13px] leading-[1.45] text-[#4B5B50]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="fp-reveal px-5 pt-4 pb-8">
        <a
          href={checkout}
          onClick={() => track("checkout_clicked", { from: "oferta_footer" })}
          className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[14px] border-b-[5px] border-[#065a26] bg-[#0a7d3c] font-heading text-[17px] font-black uppercase tracking-wide text-white shadow-[0_14px_28px_rgba(10,125,60,.4)] transition hover:brightness-110 fp-btn fp-cta"
        >
          Comprar por {PRECO_OFERTA}
          <ArrowRight className="size-5" strokeWidth={2.6} />
        </a>
      </section>

      <footer className="px-5 pt-2 pb-8 text-center">
        <p className="text-[11.5px] text-[#8A978D]">
          © {new Date().getFullYear()} Nobilex. Todos os direitos reservados.
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
