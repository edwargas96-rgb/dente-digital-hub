import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Flag,
  Heart,
  Landmark,
  Loader2,
  ShieldCheck,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/patriota/gerar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gerar minha foto — Foto Patriota IA" },
      { name: "description", content: "Monte sua foto patriota fictícia gerada por IA em poucos passos." },
    ],
  }),
  component: Funil,
});

const TOTAL_STEPS = 6;

type Opt = { title: string; desc?: string; icon?: "camera" | "landmark" | "flag" | "heart" };

const CENARIO: Opt[] = [
  { title: "Selfie com o Capitão", desc: "Uma foto casual, como se fosse um registro rápido para postar.", icon: "camera" },
  { title: "Encontro em Brasília", desc: "Um visual institucional, com clima de visita especial.", icon: "landmark" },
  { title: "Evento patriota", desc: "Clima de evento com bandeiras do Brasil ao fundo.", icon: "flag" },
  { title: "Encontro popular", desc: "Uma imagem calorosa, de fã encontrando seu grande ídolo.", icon: "heart" },
];

const ENQUADRAMENTO: Opt[] = [
  { title: "Peito para cima" },
  { title: "Meio corpo" },
  { title: "Selfie proxima" },
];

const CLIMA: Opt[] = [
  { title: "Patriota discreta" },
  { title: "Evento com bandeiras" },
  { title: "Encontro popular" },
];

type Testimonial = { img: string; name: string; quote: string };

const T_SEBASTIAO: Testimonial = {
  img: "/testimonials/sebastiao.svg",
  name: "Sebastiao Ramos",
  quote:
    "Nunca tive a chance de tirar uma foto com o Capitão pessoalmente, mas essa aqui ficou de arrepiar. Já virou minha foto de perfil!",
};

const T_GERALDO: Testimonial = {
  img: "/testimonials/geraldo.svg",
  name: "Geraldo Nunes",
  quote:
    "Paguei no PIX e recebi na hora. Compartilhei no grupo e todo mundo pediu o link. Simples até pra mim que não manjo de celular!",
};

const SUBTITULO = "Quanto mais claro o objetivo, melhor a IA ajusta pose, luz e formato da imagem.";

function OptionIcon({ icon }: { icon: NonNullable<Opt["icon"]> }) {
  const cls = "h-[19px] w-[19px]";
  if (icon === "camera") return <Camera className={cls} strokeWidth={2} />;
  if (icon === "landmark") return <Landmark className={cls} strokeWidth={2} />;
  if (icon === "flag") return <Flag className={cls} strokeWidth={2} />;
  return <Heart className="h-[19px] w-[19px] text-[#E8B713]" fill="currentColor" strokeWidth={0} />;
}

/** Linha de opção selecionável (verde quando ativa). */
function OptionRow({
  opt,
  selected,
  onSelect,
}: {
  opt: Opt;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "flex w-full items-center gap-3 rounded-2xl border px-[15px] py-[14px] text-left transition-colors " +
        (selected
          ? "border-primary bg-[#EAF4EC] shadow-[0_6px_18px_rgba(10,125,60,.10)]"
          : "border-border bg-card shadow-[0_4px_14px_rgba(9,26,18,.04)]")
      }
    >
      {opt.icon && (
        <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[12px] bg-[#EEF2EA] text-primary">
          <OptionIcon icon={opt.icon} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[15.5px] font-bold text-foreground">{opt.title}</span>
        {opt.desc && <span className="mt-0.5 block text-[12.5px] leading-[1.4] text-[#7A897F]">{opt.desc}</span>}
      </span>
      <span
        className={
          "grid h-[24px] w-[24px] flex-none place-items-center rounded-full border transition-colors " +
          (selected ? "border-primary bg-primary text-white" : "border-[#CFD8CC] bg-transparent")
        }
        aria-hidden="true"
      >
        {selected && <Check className="h-[14px] w-[14px]" strokeWidth={3} />}
      </span>
    </button>
  );
}

function TestimonialInline({ t }: { t: Testimonial }) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-[#E8ECE2] bg-[#F5F7F1] p-[13px]">
      <span className="relative flex h-9 w-9 flex-none overflow-hidden rounded-full bg-[#EAF4EC]">
        <img alt="" src={t.img} className="h-full w-full object-cover" />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] leading-[1.5] text-[#3A4A40]">“{t.quote}”</p>
        <p className="mt-1.5 text-[11.5px] text-[#7A897F]">
          <strong className="font-bold text-foreground">— {t.name}</strong> · patriota{" "}
          <span className="text-[9px] align-middle" aria-hidden="true">
            🇧🇷
          </span>
        </p>
      </div>
    </div>
  );
}

function Funil() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cenario, setCenario] = useState(0);
  const [enquadramento, setEnquadramento] = useState(0);
  const [clima, setClima] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function voltar() {
    if (step === 1) {
      navigate({ to: "/patriota" });
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  function avancar() {
    if (step >= TOTAL_STEPS) return;
    const next = step + 1;
    setStep(next);
    // Passo 5 é a geração (loading) e avança sozinho para o resultado.
    if (next === 5) {
      window.setTimeout(() => setStep(6), 3200);
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <main
      className="fp-scope flex min-h-screen justify-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(130% 70% at 50% -8%, rgba(10,125,60,.12), transparent 55%), radial-gradient(90% 55% at 108% 4%, rgba(232,183,19,.14), transparent 55%), radial-gradient(80% 55% at -8% 8%, rgba(18,43,107,.08), transparent 55%), #e7ebe1",
      }}
    >
      <div className="relative flex w-full max-w-[468px] flex-col">
        <div className="sticky top-0 z-30 h-1 fp-tricolor" />

        <div className="px-5 pb-10 pt-4">
          {/* Cabeçalho: voltar + passo */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={voltar}
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#3A4A40] transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-[17px] w-[17px]" strokeWidth={2.2} />
              Voltar
            </button>
            <span className="rounded-full bg-[#E7F1E8] px-[13px] py-[6px] font-heading text-[11px] font-bold tracking-[0.06em] text-primary">
              PASSO {Math.min(step, TOTAL_STEPS)} DE {TOTAL_STEPS}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="mt-3 h-[7px] w-full overflow-hidden rounded-full bg-[#DCE3D6]">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* PASSO 1 — Cenário */}
          {step === 1 && (
            <Card>
              <Titulo>Primeiro, escolha o cenário da sua foto</Titulo>
              <Sub>{SUBTITULO}</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {CENARIO.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={cenario === i} onSelect={() => setCenario(i)} />
                ))}
              </div>
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 2 — Enquadramento */}
          {step === 2 && (
            <Card>
              <Titulo>Defina o enquadramento</Titulo>
              <Sub>{SUBTITULO}</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {ENQUADRAMENTO.map((opt, i) => (
                  <OptionRow
                    key={opt.title}
                    opt={opt}
                    selected={enquadramento === i}
                    onSelect={() => setEnquadramento(i)}
                  />
                ))}
              </div>
              <TestimonialInline t={T_SEBASTIAO} />
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 3 — Clima */}
          {step === 3 && (
            <Card>
              <Titulo>Escolha o clima da imagem</Titulo>
              <Sub>{SUBTITULO}</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {CLIMA.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={clima === i} onSelect={() => setClima(i)} />
                ))}
              </div>
              <TestimonialInline t={T_GERALDO} />
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 4 — Upload */}
          {step === 4 && (
            <Card>
              <Titulo>Agora envie a sua foto 📸</Titulo>
              <Sub>Escolha uma foto sua de frente e com boa luz. É ela que a IA vai usar.</Sub>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C9D6C6] bg-[#F5F8F2] px-4 py-8 text-center transition-colors hover:border-primary"
              >
                <span className="grid h-[54px] w-[54px] place-items-center rounded-full bg-[#E7F1E8] text-primary">
                  <Upload className="h-6 w-6" strokeWidth={2} />
                </span>
                <span className="font-heading text-[16px] font-bold text-foreground">
                  {fileName ?? "Enviar selfie"}
                </span>
                <span className="text-[12.5px] text-[#7A897F]">JPG ou PNG, de frente e com boa luz</span>
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#7A897F]">
                <ShieldCheck className="h-[15px] w-[15px] flex-none text-primary" strokeWidth={2} />
                Sua foto é usada só pra montar a sua lembrança. Nada além disso.
              </p>
              <Continuar onClick={avancar} disabled={!fileName} />
            </Card>
          )}

          {/* PASSO 5 — Gerando */}
          {step === 5 && (
            <Card>
              <div className="flex flex-col items-center py-6 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={2} />
                <h2 className="mt-5 font-heading text-[20px] font-bold text-foreground">Gerando sua imagem…</h2>
                <p className="mt-2 max-w-[280px] text-[13.5px] leading-[1.5] text-[#7A897F]">
                  A IA está montando sua foto patriota. Isso leva só alguns segundos.
                </p>
              </div>
            </Card>
          )}

          {/* PASSO 6 — Resultado / oferta */}
          {step === 6 && (
            <Card>
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F1E8] px-3 py-1.5 font-heading text-[11px] font-bold tracking-[0.05em] text-primary">
                  <Check className="h-[13px] w-[13px]" strokeWidth={3} /> IMAGEM PRONTA
                </span>
                <h2 className="mt-3 font-heading text-[22px] font-extrabold leading-[1.15] text-foreground">
                  Sua imagem com o Capitão está pronta!
                </h2>
                <p className="mt-2 text-[13.5px] leading-[1.5] text-[#7A897F]">
                  Libere agora para baixar em alta qualidade, sem marca d'água.
                </p>
              </div>

              <div className="relative mx-auto mt-5 aspect-[3/4] max-w-[240px] overflow-hidden rounded-[18px] border-[5px] border-white shadow-[0_18px_40px_rgba(9,26,18,.22)]">
                <img
                  src="/examples/patriota/example-real-selfie-capitao.svg"
                  alt="Prévia da sua imagem gerada"
                  className="h-full w-full object-cover blur-[6px]"
                />
                <div className="absolute inset-0 grid place-items-center bg-[rgba(9,20,14,.28)]">
                  <span className="rounded-lg bg-[rgba(9,20,14,.72)] px-3 py-1.5 font-heading text-[11px] font-bold tracking-[0.06em] text-white">
                    🔒 PRÉVIA BLOQUEADA
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[15px] bg-primary font-heading text-[17px] font-bold text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.30)] transition-colors hover:bg-[#08652F]"
              >
                Liberar minha imagem
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </button>
              <p className="mt-3 text-center text-[11px] text-[#A0A99C]">
                Imagem fictícia gerada por inteligência artificial.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-[22px] border border-[#E4E8DD] bg-card p-5 shadow-[0_10px_34px_rgba(9,26,18,.08)]">
      {children}
    </div>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-[22px] font-extrabold leading-[1.15] tracking-[-0.01em] text-foreground">{children}</h2>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[#7A897F]">{children}</p>;
}

function Continuar({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[15px] font-heading text-[17px] font-bold text-primary-foreground transition-colors " +
        (disabled
          ? "cursor-not-allowed bg-[#8FBF9F]"
          : "bg-primary shadow-[0_12px_26px_rgba(10,125,60,.28)] hover:bg-[#08652F]")
      }
    >
      Continuar
      <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
    </button>
  );
}
