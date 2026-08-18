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

export const Route = createFileRoute("/patriota-gerar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gerar minha foto — Foto Patriota IA" },
      { name: "description", content: "Monte sua foto patriota fictícia gerada por IA em poucos passos." },
    ],
  }),
  component: Funil,
});

const TOTAL_STEPS = 7;
const PRECO_BASE = 1990; // centavos
const PRECO_COMBO = 990;
const PRECO_EBOOKS = 990;

// Personagem escolhido no passo 1 (gamificação).
type Figura = "Capitão" | "ZeroUm";

// Checkout na Cakto — troque pelos links reais de cada produto.
const CAKTO_URL: Record<Figura, string> = {
  "Capitão": "https://pay.cakto.com.br/3bswr7q_1048378",
  ZeroUm: "https://pay.cakto.com.br/7d5dmz3_1048364",
};

const FIGURAS: { id: Figura; titulo: string; desc: string; emoji: string }[] = [
  { id: "Capitão", titulo: "Com o Capitão", desc: "O nosso capitão, o mito da direita.", emoji: "🫡" },
  { id: "ZeroUm", titulo: "Com o ZeroUm", desc: "O 01, o maior aliado da direita no mundo.", emoji: "①" },
];

function brl(cents: number) {
  return "R$ " + (cents / 100).toFixed(2).replace(".", ",");
}

type Opt = { title: string; desc?: string; icon?: "camera" | "landmark" | "flag" | "heart" };

const CENARIO: Opt[] = [
  { title: "Selfie", desc: "Uma foto casual, como se fosse um registro rápido para postar.", icon: "camera" },
  { title: "Encontro em Brasília", desc: "Um visual institucional, com clima de visita especial.", icon: "landmark" },
  { title: "Evento patriota", desc: "Clima de evento com bandeiras do Brasil ao fundo.", icon: "flag" },
  { title: "Encontro popular", desc: "Uma imagem calorosa, de fã encontrando seu grande ídolo.", icon: "heart" },
];

const ENQUADRAMENTO: Opt[] = [{ title: "Peito para cima" }, { title: "Meio corpo" }, { title: "Selfie proxima" }];

const CLIMA: Opt[] = [{ title: "Patriota discreta" }, { title: "Evento com bandeiras" }, { title: "Encontro popular" }];

type Testimonial = { img: string; name: string; quote: string };

const T_SEBASTIAO: Testimonial = {
  img: "/testimonials/sebastiao.svg",
  name: "Sebastiao Ramos",
  quote:
    "Nunca tive a chance de tirar uma foto dessas pessoalmente, mas essa aqui ficou de arrepiar. Já virou minha foto de perfil!",
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

function OptionRow({ opt, selected, onSelect }: { opt: Opt; selected: boolean; onSelect: () => void }) {
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
          <span className="align-middle text-[9px]" aria-hidden="true">
            🇧🇷
          </span>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <label className="block font-heading text-[14px] font-bold text-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[11.5px] leading-[1.45] text-[#7A897F]">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-[12px] border border-border bg-card px-[14px] py-[13px] text-[14.5px] text-foreground placeholder:text-[#A6B0A3] focus:border-primary focus:outline-none";

function Funil() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  const [figura, setFigura] = useState<Figura | null>(null);
  const alvo: Figura = figura ?? "Capitão";

  const [cenario, setCenario] = useState(0);
  const [enquadramento, setEnquadramento] = useState(0);
  const [clima, setClima] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const [addCombo, setAddCombo] = useState(false);
  const [addEbooks, setAddEbooks] = useState(false);

  const total = PRECO_BASE + (addCombo ? PRECO_COMBO : 0) + (addEbooks ? PRECO_EBOOKS : 0);

  // Primeira opção de cenário reflete a figura escolhida.
  const cenarioOpts: Opt[] = CENARIO.map((o, i) => (i === 0 ? { ...o, title: `Selfie com o ${alvo}` } : o));

  function voltar() {
    if (step === 1) {
      navigate({ to: "/patriota" });
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  function avancar() {
    if (step === 5) {
      // Geração da imagem (após o upload) antes de coletar os dados.
      setGenerating(true);
      window.setTimeout(() => {
        setGenerating(false);
        setStep(6);
      }, 2600);
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
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

        <div className="px-5 pb-16 pt-4">
          {/* Cabeçalho */}
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
              PASSO {step} DE {TOTAL_STEPS}
            </span>
          </div>

          {/* Progresso */}
          <div className="mt-3 h-[7px] w-full overflow-hidden rounded-full bg-[#DCE3D6]">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* PASSO 1 — Escolha da figura */}
          {step === 1 && (
            <Card>
              <Titulo>Com quem você quer tirar sua foto? 🇧🇷</Titulo>
              <Sub>Escolha o líder e a IA monta a sua foto do lado dele.</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {FIGURAS.map((f) => {
                  const selected = figura === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFigura(f.id)}
                      className={
                        "flex w-full items-center gap-3 rounded-2xl border px-[15px] py-[16px] text-left transition-colors " +
                        (selected
                          ? "border-primary bg-[#EAF4EC] shadow-[0_6px_18px_rgba(10,125,60,.10)]"
                          : "border-border bg-card shadow-[0_4px_14px_rgba(9,26,18,.04)]")
                      }
                    >
                      <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px] bg-[#EEF2EA] text-[24px] leading-none">
                        {f.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-heading text-[16px] font-extrabold text-foreground">{f.titulo}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-[1.4] text-[#7A897F]">{f.desc}</span>
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
                })}
              </div>
              <Continuar onClick={avancar} disabled={!figura} />
            </Card>
          )}

          {/* PASSO 2 — Cenário */}
          {step === 2 && (
            <Card>
              <Titulo>Escolha o cenário da sua foto</Titulo>
              <Sub>{SUBTITULO}</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {cenarioOpts.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={cenario === i} onSelect={() => setCenario(i)} />
                ))}
              </div>
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 3 */}
          {step === 3 && (
            <Card>
              <Titulo>Defina o enquadramento</Titulo>
              <Sub>{SUBTITULO}</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {ENQUADRAMENTO.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={enquadramento === i} onSelect={() => setEnquadramento(i)} />
                ))}
              </div>
              <TestimonialInline t={T_SEBASTIAO} />
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 4 */}
          {step === 4 && (
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

          {/* PASSO 5 — Upload */}
          {step === 5 && (
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
                <span className="font-heading text-[16px] font-bold text-foreground">{fileName ?? "Enviar selfie"}</span>
                <span className="text-[12.5px] text-[#7A897F]">JPG ou PNG, de frente e com boa luz</span>
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#7A897F]">
                <ShieldCheck className="h-[15px] w-[15px] flex-none text-primary" strokeWidth={2} />
                Sua foto é usada só pra montar a sua lembrança. Nada além disso.
              </p>
              <Continuar onClick={avancar} disabled={!fileName} label={generating ? "Gerando…" : "Continuar"} loading={generating} />
            </Card>
          )}

          {/* PASSO 6 — Dados */}
          {step === 6 && (
            <Card>
              <div className="flex items-start gap-2.5 rounded-[14px] border border-[#EAC94F] bg-[#FFF4CE] px-4 py-3">
                <span className="text-[20px] leading-none" aria-hidden="true">
                  👇
                </span>
                <p className="text-[13.5px] font-semibold leading-[1.42] text-[#6B5A1E]">
                  Siga as instruções abaixo para receber a sua foto.
                </p>
              </div>

              <Field label="Seu nome">
                <input className={inputCls} placeholder="Nome e sobrenome" value={nome} onChange={(e) => setNome(e.target.value)} />
              </Field>

              <Field
                label="Seu WhatsApp (com DDD)"
                hint="Usamos este número para entrar em contato e enviar sua foto manualmente no WhatsApp. Os lembretes automáticos de Pix pendente são enviados por e-mail."
              >
                <div className="flex items-stretch gap-2">
                  <span className="flex flex-none items-center gap-1 rounded-[12px] border border-border bg-[#F2F5EE] px-3 font-heading text-[13px] font-bold text-[#41533F]">
                    BR <span className="text-foreground">+55</span>
                  </span>
                  <input
                    className={inputCls}
                    inputMode="tel"
                    placeholder="(11) 91234-5678"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </Field>

              <Field
                label="Seu e-mail — é pra lá que a sua foto vai"
                hint="Enviamos sua foto e um bônus exclusivo pra cá — assim você não perde, nem trocando de celular."
              >
                <input
                  className={inputCls}
                  inputMode="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field label="CPF" hint="Precisamos do CPF só para emitir o Pix.">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </Field>

              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 7 — Checkout / oferta */}
          {step === 7 && (
            <Card>
              <Titulo>Para liberar a sua foto com o {alvo}</Titulo>
              <Sub>É esta mesma imagem que você recebe, sem a marca d'água — não geramos de novo.</Sub>

              {/* Oferta principal */}
              <div
                className="mt-4 overflow-hidden rounded-2xl border-2 border-[#EAC94F] p-[18px]"
                style={{ background: "linear-gradient(180deg, #FFFBEF, #FFF6D8)" }}
              >
                <p className="font-heading text-[15px] font-extrabold leading-[1.25] text-[#5A4A15]">
                  Para liberar a sua foto e já usar no WhatsApp, no Instagram e no Facebook:
                </p>
                <p className="mt-2 font-heading text-[34px] font-extrabold leading-none text-primary">
                  R$&nbsp;19,90 <span className="text-[16px] font-bold text-[#5A4A15]">no Pix</span>
                </p>
                <p className="mt-2.5 text-[13.5px] leading-[1.5] text-[#6B5A1E]">
                  Esse valor cobre só o nosso trabalho e fortalece o nosso lado, em apoio ao nosso {alvo} 🇧🇷
                </p>
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#EAD9A0] bg-white/70 px-3 py-2.5">
                  <span className="text-[18px] leading-none" aria-hidden="true">
                    🎁
                  </span>
                  <p className="text-[13px] font-semibold leading-[1.4] text-[#6B5A1E]">
                    E você ainda leva um bônus especial de presente.
                  </p>
                </div>
                <div className="mt-3.5 border-t border-[#EAD9A0] pt-3 text-center font-heading text-[15px] font-extrabold tracking-[0.02em] text-[#5A4A15]">
                  APOIE A NOSSA LUTA
                </div>
              </div>

              {/* Order bump 1 — Combo */}
              <BumpCard checked={addCombo} onToggle={() => setAddCombo((v) => !v)} accent="navy" badge="⭐ MAIS ESCOLHIDO">
                <p className="font-heading text-[15.5px] font-extrabold text-foreground">Combo 3 Líderes da Direita 🇧🇷</p>
                <span className="mt-1.5 inline-block rounded-md bg-[color:var(--color-navy)] px-2.5 py-1 font-heading text-[11px] font-bold text-white">
                  SUA FOTO VIRA 3 — POR SÓ + R$ 9,90
                </span>
                <p className="mt-2 text-[12.5px] leading-[1.5] text-[#4B5B50]">
                  A <strong>mesma selfie</strong> também com o <strong>Trump</strong> e o <strong>Flávio, o 01</strong>.
                  Enquanto a esquerda treme, você já mostra de que lado tá — com o 01 e o maior aliado da direita no
                  mundo. 🇧🇷🇺🇸
                </p>
                <div className="mt-2.5 flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <img src="/offer/trump.svg" alt="" className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-[12.5px] font-semibold text-[#3A4A40]">Trump</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <img src="/offer/flavio.svg" alt="" className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-[12.5px] font-semibold text-[#3A4A40]">Flávio · 01</span>
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="rounded-md bg-[#D23434] px-2 py-1 font-heading text-[11px] font-extrabold text-white">
                    −75% SÓ AGORA
                  </span>
                  <span className="text-[13px] text-[#A0A99C] line-through">R$ 39,80</span>
                  <span className="font-heading text-[16px] font-extrabold text-foreground">+ R$ 9,90</span>
                </div>
              </BumpCard>

              {/* Brinde grupos */}
              <div className="mt-3 rounded-2xl border border-[#CFE0EE] bg-[#EDF4FA] p-[15px]">
                <p className="font-heading text-[14.5px] font-bold text-[#123A5E]">🎁 De brinde: os grupos dos patriotas</p>
                <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#3B5468]">
                  Comprando a sua foto você entra nos nossos grupos do <strong>WhatsApp</strong> e do{" "}
                  <strong>Telegram</strong> — sem pagar nada a mais. É lá que as novidades saem primeiro. O acesso aparece
                  nesta tela assim que o pagamento confirmar. 🇧🇷
                </p>
              </div>

              {/* Order bump 2 — E-books */}
              <p className="mb-2 mt-4 font-heading text-[14px] font-bold text-foreground">Adicione ao seu pedido</p>
              <BumpCard checked={addEbooks} onToggle={() => setAddEbooks((v) => !v)}>
                <div className="flex items-start gap-3">
                  <img src="/offer/ebooks.svg" alt="" className="h-[70px] w-[92px] flex-none rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="font-heading text-[14.5px] font-extrabold text-foreground">Pacote 3 E-books</p>
                    <p className="mt-0.5 text-[12px] leading-[1.4] text-[#7A897F]">Todo conteudo que um patriota precisa</p>
                    <p className="mt-1.5">
                      <span className="text-[12.5px] text-[#A0A99C] line-through">R$ 19,90</span>{" "}
                      <span className="font-heading text-[15px] font-extrabold text-foreground">+ R$ 9,90</span>
                    </p>
                    <span className="mt-1.5 inline-block rounded-md bg-[#FFF0C4] px-2 py-0.5 font-heading text-[10.5px] font-bold text-[#8A6A00]">
                      50% OFF SÓ AGORA
                    </span>
                  </div>
                </div>
              </BumpCard>

              <a
                href={CAKTO_URL[alvo]}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[15px] bg-primary px-4 text-center font-heading text-[16.5px] font-bold text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.30)] transition-colors hover:bg-[#08652F]"
              >
                Liberar sem marca d'água por {brl(total)}
              </a>
              <p className="mt-3 text-center text-[11.5px] leading-[1.5] text-[#7A897F]">
                Você vai para o checkout seguro (Cakto) — sua foto libera assim que o pagamento confirmar.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function BumpCard({
  checked,
  onToggle,
  badge,
  accent,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  badge?: string;
  accent?: "navy";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "relative mt-3 rounded-2xl border bg-card p-[15px] transition-colors " +
        (checked ? "border-primary shadow-[0_6px_18px_rgba(10,125,60,.12)]" : "border-border shadow-[0_4px_14px_rgba(9,26,18,.04)]")
      }
    >
      {badge && (
        <span
          className="absolute -top-2.5 right-3 rounded-full px-2.5 py-1 font-heading text-[10.5px] font-bold text-white"
          style={{ background: accent === "navy" ? "var(--color-navy)" : "#0a7d3c" }}
        >
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={checked}
          className={
            "mt-0.5 grid h-[24px] w-[24px] flex-none place-items-center rounded-full border transition-colors " +
            (checked ? "border-primary bg-primary text-white" : "border-[#CFD8CC] bg-transparent")
          }
        >
          {checked && <Check className="h-[14px] w-[14px]" strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-[22px] border border-[#E4E8DD] bg-card p-5 shadow-[0_10px_34px_rgba(9,26,18,.08)]">{children}</div>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-[22px] font-extrabold leading-[1.15] tracking-[-0.01em] text-foreground">{children}</h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[#7A897F]">{children}</p>;
}

function Continuar({
  onClick,
  disabled = false,
  label = "Continuar",
  loading = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={
        "mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[15px] font-heading text-[17px] font-bold text-primary-foreground transition-colors " +
        (disabled || loading
          ? "cursor-not-allowed bg-[#8FBF9F]"
          : "bg-primary shadow-[0_12px_26px_rgba(10,125,60,.28)] hover:bg-[#08652F]")
      }
    >
      {loading && <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2.4} />}
      {label}
      {!loading && <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />}
    </button>
  );
}
