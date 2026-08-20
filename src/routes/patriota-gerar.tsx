import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Flag,
  Heart,
  Image as ImageIcon,
  Landmark,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FlagBR, FlagUS } from "@/components/flags";
import { lerIndicadoPor } from "@/lib/referral";

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

const TOTAL_STEPS = 9;
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

// Cupom de indicação (amigo ganha 20%) — um código por produto na Cakto.
const CUPOM: Record<Figura, string> = {
  "Capitão": "AMIGO20",
  ZeroUm: "AMIGO20Z",
};

// Prévias PRONTAS (você cria a imagem já borrada e hospeda no imgur).
// A imagem mostrada depende da figura + do cenário escolhido no funil.
// Ordem dos cenários: [0] Selfie · [1] Encontro em Brasília · [2] Evento patriota · [3] Encontro popular
// Deixe "" onde ainda não tiver o link — nesses casos cai na foto que a pessoa enviou (borrada).
const PREVIA: Record<Figura, string[]> = {
  "Capitão": ["", "", "", ""],
  ZeroUm: ["", "", "", ""],
};

const FIGURAS: { id: Figura; titulo: string; desc: string; img: string }[] = [
  { id: "Capitão", titulo: "Com o Capitão", desc: "O nosso capitão, o mito da direita.", img: "https://i.imgur.com/HfMka8B.jpeg" },
  { id: "ZeroUm", titulo: "Com o ZeroUm", desc: "O 01, o maior aliado da direita no mundo.", img: "https://i.imgur.com/hKwrerY.jpeg" },
];

function brl(cents: number) {
  return "R$ " + (cents / 100).toFixed(2).replace(".", ",");
}

type Opt = { title: string; desc?: string; icon?: "camera" | "landmark" | "flag" | "heart" | "image" };

const FORMATOS: Opt[] = [
  { title: "Selfie", desc: "Foto de pertinho, como se você mesmo tivesse tirado.", icon: "camera" },
  { title: "Foto", desc: "Uma foto sua, como se alguém tivesse tirado de você.", icon: "image" },
];

const CENARIO: Opt[] = [
  { title: "Selfie", desc: "Uma foto casual, como se fosse um registro rápido para postar.", icon: "camera" },
  { title: "Encontro em Brasília", desc: "Um visual institucional, com clima de visita especial.", icon: "landmark" },
  { title: "Evento patriota", desc: "Clima de evento com bandeiras do Brasil ao fundo.", icon: "flag" },
  { title: "Encontro popular", desc: "Uma imagem calorosa, de fã encontrando seu grande ídolo.", icon: "heart" },
];

const ENQUADRAMENTO: Opt[] = [{ title: "Peito para cima" }, { title: "Meio corpo" }, { title: "Selfie proxima" }];

const CLIMA: Opt[] = [{ title: "Patriota discreta" }, { title: "Evento com bandeiras" }, { title: "Encontro popular" }];

type Testimonial = { img: string; name: string; quote: string };

const T_JOAO: Testimonial = {
  img: "https://i.imgur.com/T8wJeYk.jpeg",
  name: "João Victor",
  quote:
    "Fiz todos meus amigos patriotas usarem foto de perfil. Ficou incrível, o grupo todo quis a sua também!",
};

const T_VALESKA: Testimonial = {
  img: "https://i.imgur.com/1wYOlpJ.jpeg",
  name: "Valeska Dalto",
  quote: "Amei a minha! Chegou rapidinho no WhatsApp e ficou linda demais.",
};

function OptionIcon({ icon }: { icon: NonNullable<Opt["icon"]> }) {
  const cls = "h-[19px] w-[19px]";
  if (icon === "camera") return <Camera className={cls} strokeWidth={2} />;
  if (icon === "landmark") return <Landmark className={cls} strokeWidth={2} />;
  if (icon === "flag") return <Flag className={cls} strokeWidth={2} />;
  if (icon === "image") return <ImageIcon className={cls} strokeWidth={2} />;
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
        <p className="text-[12.5px] leading-[1.5] text-[#3A4A40]">{t.quote}</p>
        <p className="mt-1.5 text-[11.5px] text-[#7A897F]">
          <strong className="font-bold text-foreground">— {t.name}</strong> · patriota
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

  const [figura, setFigura] = useState<Figura | null>(null);
  const alvo: Figura = figura ?? "Capitão";
  const figuraImg = FIGURAS.find((f) => f.id === alvo)?.img ?? "";

  const [formato, setFormato] = useState<number | null>(null);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cenario, setCenario] = useState(0);
  const [enquadramento, setEnquadramento] = useState(0);
  const [clima, setClima] = useState(0);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [indicadoPor, setIndicadoPor] = useState<string | null>(null);
  useEffect(() => {
    setIndicadoPor(lerIndicadoPor());
  }, []);

  // Validação dos dados: precisa de nome e de um WhatsApp com pelo menos 10 dígitos.
  const whatsappValido = whatsapp.replace(/\D/g, "").length >= 10;
  const dadosOk = nome.trim().length > 1 && whatsappValido;

  // Primeira opção de cenário reflete a figura escolhida.
  const cenarioOpts: Opt[] = CENARIO.map((o, i) => (i === 0 ? { ...o, title: `Selfie com o ${alvo}` } : o));

  // Combo: a mesma selfie também com o Trump e o OUTRO líder (o que não foi escolhido).
  const outro =
    alvo === "Capitão"
      ? { nome: "Flávio, o 01", img: FIGURAS[1].img }
      : { nome: "Jair Bolsonaro", img: FIGURAS[0].img };

  function voltar() {
    if (step === 1) {
      navigate({ to: "/patriota" });
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  // Salva as escolhas no Supabase (para você consultar pelo WhatsApp e gerar a imagem rápido).
  async function salvarPedido() {
    try {
      await (supabase as unknown as { from: (t: string) => any }).from("foto_pedidos").insert({
        nome: nome.trim(),
        whatsapp,
        figura: alvo,
        formato: formato !== null ? FORMATOS[formato]?.title : null,
        cenario: cenarioOpts[cenario]?.title,
        enquadramento: ENQUADRAMENTO[enquadramento]?.title,
        clima: CLIMA[clima]?.title,
        indicado_por: indicadoPor,
      });
    } catch (e) {
      console.error("Falha ao salvar pedido:", e);
    }
  }

  function avancar() {
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

          <p className="mt-2.5 text-center text-[12.5px] text-[#7A897F]">
            Sua foto por <span className="text-[#A0A99C] line-through">R$ 39,90</span>{" "}
            <strong className="font-heading text-[14px] font-extrabold text-primary">R$ 19,90</strong> no Pix
          </p>

          {/* PASSO 1 — Escolha da figura */}
          {step === 1 && (
            <Card>
              <Titulo>Com quem você quer tirar sua foto? <FlagBR /></Titulo>
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
                      <img
                        src={f.img}
                        alt={f.titulo}
                        className="h-[54px] w-[54px] flex-none rounded-[13px] object-cover"
                      />
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

          {/* PASSO 2 — Foto ou selfie */}
          {step === 2 && (
            <Card>
              <Titulo>Você quer uma foto ou uma selfie?</Titulo>
              <Sub>Escolha o formato da sua imagem com o líder.</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {FORMATOS.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={formato === i} onSelect={() => setFormato(i)} />
                ))}
              </div>
              <Continuar onClick={avancar} disabled={formato === null} />
            </Card>
          )}

          {/* PASSO 3 — Upload da foto */}
          {step === 3 && (
            <Card>
              <Titulo>Agora envie a sua foto 📸</Titulo>
              <Sub>Escolha uma foto sua de frente e com boa luz. É ela que a IA vai usar.</Sub>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFileUrl(f ? URL.createObjectURL(f) : null);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C9D6C6] bg-[#F5F8F2] px-4 py-7 text-center transition-colors hover:border-primary"
              >
                {fileUrl ? (
                  <img src={fileUrl} alt="Sua foto" className="h-[120px] w-[120px] rounded-xl object-cover" />
                ) : (
                  <span className="grid h-[54px] w-[54px] place-items-center rounded-full bg-[#E7F1E8] text-primary">
                    <Upload className="h-6 w-6" strokeWidth={2} />
                  </span>
                )}
                <span className="font-heading text-[15px] font-bold text-foreground">
                  {fileUrl ? "Trocar foto" : "Enviar sua foto"}
                </span>
                <span className="text-[12.5px] text-[#7A897F]">JPG ou PNG, de frente e com boa luz</span>
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#7A897F]">
                <ShieldCheck className="h-[15px] w-[15px] flex-none text-primary" strokeWidth={2} />
                Sua foto é usada só para montar a sua imagem. Nada além disso.
              </p>
              <Continuar onClick={avancar} disabled={!fileUrl} />
            </Card>
          )}

          {/* PASSO 4 — Cenário */}
          {step === 4 && (
            <Card>
              <Titulo>Escolha o cenário da sua foto</Titulo>
              <Sub>Onde vocês aparecem juntos — a IA monta o fundo e a cena a partir daqui.</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {cenarioOpts.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={cenario === i} onSelect={() => setCenario(i)} />
                ))}
              </div>
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 5 — Enquadramento */}
          {step === 5 && (
            <Card>
              <Titulo>Defina o enquadramento</Titulo>
              <Sub>Como você quer aparecer na foto: mais de perto ou mostrando o ambiente.</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {ENQUADRAMENTO.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={enquadramento === i} onSelect={() => setEnquadramento(i)} />
                ))}
              </div>
              <TestimonialInline t={T_JOAO} />
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 6 — Clima */}
          {step === 6 && (
            <Card>
              <Titulo>Escolha o clima da imagem</Titulo>
              <Sub>O estilo do momento — de um registro discreto a um clima de evento.</Sub>
              <div className="mt-4 flex flex-col gap-2.5">
                {CLIMA.map((opt, i) => (
                  <OptionRow key={opt.title} opt={opt} selected={clima === i} onSelect={() => setClima(i)} />
                ))}
              </div>
              <TestimonialInline t={T_VALESKA} />
              <Continuar onClick={avancar} />
            </Card>
          )}

          {/* PASSO 7 — Prévia com filtro (placeholder para a IA) */}
          {step === 7 && (
            <Card>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-[18px] w-[18px] text-accent" strokeWidth={2.2} />
                <p className="font-heading text-[12.5px] font-bold uppercase tracking-[0.06em] text-primary">
                  Sua prévia
                </p>
              </div>
              <Titulo>Olha como está ficando! 🔥</Titulo>
              <Sub>
                Sua imagem com o {alvo} já está sendo montada. Libere a versão final, nítida e sem borrão, no próximo
                passo.
              </Sub>

              <div className="relative mx-auto mt-4 aspect-[3/4] max-w-[260px] overflow-hidden rounded-[18px] border-[5px] border-white shadow-[0_18px_40px_rgba(9,26,18,.22)]">
                {(() => {
                  const pronta = PREVIA[alvo]?.[cenario] || "";
                  const src = pronta || fileUrl;
                  if (!src) return <div className="h-full w-full bg-[#0f5232]" />;
                  // Imagem pronta você já borra; a foto enviada recebe blur mais forte.
                  return (
                    <img
                      src={src}
                      alt="Prévia"
                      className={"h-full w-full object-cover saturate-[1.15] " + (pronta ? "blur-[2px]" : "blur-[7px]")}
                    />
                  );
                })()}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(160deg, rgba(10,125,60,.30), rgba(18,43,107,.42))" }}
                />
                <div className="absolute inset-x-0 top-0 bg-[rgba(9,20,14,.72)] py-[5px] text-center font-heading text-[8.5px] font-bold tracking-[0.08em] text-white">
                  IMAGEM FICTÍCIA • GERADA POR IA
                </div>
                <div className="absolute inset-0 grid place-items-center">
                  <span className="flex items-center gap-1.5 rounded-lg bg-[rgba(9,20,14,.76)] px-3 py-1.5 font-heading text-[11px] font-bold tracking-[0.06em] text-white">
                    <Lock className="h-[13px] w-[13px]" strokeWidth={2.4} /> PRÉVIA BLOQUEADA
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-[rgba(9,20,14,.72)] px-2 py-1">
                  <img src={figuraImg} alt="" className="h-6 w-6 rounded-full object-cover" />
                  <span className="pr-1 font-heading text-[10px] font-bold text-white">+ {alvo}</span>
                </div>
              </div>

              <p className="mt-3 text-center text-[13px] font-semibold text-[#20302A]">
                Ficou incrível, né? 😍 Libere agora e receba no WhatsApp.
              </p>
              <Continuar onClick={avancar} label="Quero a minha imagem" />
            </Card>
          )}

          {/* PASSO 8 — Dados */}
          {step === 8 && (
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
                hint="É por aqui que a sua foto vai ser enviada. Coloque um número válido, senão não conseguimos entregar."
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
                {whatsapp.length > 0 && !whatsappValido && (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-[#C0392B]">
                    Digite um WhatsApp válido com DDD.
                  </p>
                )}
              </Field>

              <Continuar
                onClick={() => {
                  void salvarPedido();
                  avancar();
                }}
                disabled={!dadosOk}
              />
            </Card>
          )}

          {/* PASSO 9 — Checkout / oferta */}
          {step === 9 && (
            <Card>
              <Titulo>Para liberar a sua foto com o {alvo}</Titulo>
              <Sub>É esta mesma imagem que você recebe — em alta qualidade, com o selo de imagem fictícia gerada por IA.</Sub>

              {/* Oferta principal */}
              <div
                className="mt-4 overflow-hidden rounded-2xl border-2 border-[#EAC94F] p-[18px]"
                style={{ background: "linear-gradient(180deg, #FFFBEF, #FFF6D8)" }}
              >
                <p className="font-heading text-[15px] font-extrabold leading-[1.25] text-[#5A4A15]">
                  Sua foto será entregue no WhatsApp, e já poderá usar no Instagram e no Facebook:
                </p>
                <p className="mt-2 font-heading text-[34px] font-extrabold leading-none text-primary">
                  R$&nbsp;19,90 <span className="text-[16px] font-bold text-[#5A4A15]">no Pix</span>
                </p>
                <p className="mt-2.5 text-[13.5px] leading-[1.5] text-[#6B5A1E]">
                  Esse valor cobre só o nosso trabalho e fortalece o nosso lado, em apoio ao nosso {alvo} <FlagBR />
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

              {/* Order bump 1 — Combo (selecionável no checkout da Cakto) */}
              <BumpCard accent="navy" badge="⭐ MAIS ESCOLHIDO">
                <p className="font-heading text-[15.5px] font-extrabold text-foreground">Combo 3 Líderes da Direita <FlagBR /></p>
                <span className="mt-1.5 inline-block rounded-md bg-[color:var(--color-navy)] px-2.5 py-1 font-heading text-[11px] font-bold text-white">
                  SUA FOTO VIRA 3 — POR SÓ + R$ 9,90
                </span>
                <p className="mt-2 text-[12.5px] leading-[1.5] text-[#4B5B50]">
                  A <strong>mesma selfie</strong> também com o <strong>Trump</strong> e o <strong>{outro.nome}</strong>.
                  Enquanto a esquerda treme, você já mostra de que lado tá — com os maiores nomes da direita. <FlagBR /> <FlagUS />
                </p>
                <div className="mt-2.5 flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <img src="https://i.imgur.com/q8XqXvu.jpeg" alt="" className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-[12.5px] font-semibold text-[#3A4A40]">Trump</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <img src={outro.img} alt="" className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-[12.5px] font-semibold text-[#3A4A40]">{outro.nome}</span>
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
                  <strong>Telegram</strong> — sem pagar nada a mais. É lá que as novidades saem primeiro. O acesso chega
                  junto com a foto no WhatsApp. <FlagBR />
                </p>
              </div>

              {/* Order bump 2 — E-book (selecionável no checkout da Cakto) */}
              <p className="mb-2 mt-4 font-heading text-[14px] font-bold text-foreground">
                Você também pode adicionar no pagamento:
              </p>
              <BumpCard>
                <div className="flex items-start gap-3">
                  <img src="https://i.imgur.com/XyK2QN0.png" alt="" className="h-[96px] w-[70px] flex-none rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="font-heading text-[14.5px] font-extrabold text-foreground">
                      E-book Flávio Bolsonaro — Além do Sobrenome
                    </p>
                    <p className="mt-0.5 text-[12px] leading-[1.4] text-[#7A897F]">A história do 01 além do sobrenome.</p>
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

              {indicadoPor && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#EAC94F] bg-[#FFF4CE] px-3.5 py-2.5 text-[12.5px] font-semibold leading-[1.4] text-[#6B5A1E]">
                  <span aria-hidden="true">🎁</span>
                  <span>
                    Indicação de amigo: use o cupom <strong className="text-[#8A6A00]">{CUPOM[alvo]}</strong> no checkout
                    para 20% de desconto.
                  </span>
                </div>
              )}
              <a
                href={CAKTO_URL[alvo]}
                className="fp-btn fp-cta mt-5 flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[15px] bg-primary px-4 text-center font-heading text-[16.5px] font-bold text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.30)] hover:bg-[#08652F]"
              >
                Comprar minha foto por {brl(PRECO_BASE)}
              </a>
              <p className="mt-3 text-center text-[11.5px] leading-[1.5] text-[#7A897F]">
                No pagamento seguro (Cakto) você pode adicionar o Combo 3 e o E-book. Sua foto libera assim que o
                pagamento confirmar.
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function BumpCard({
  badge,
  accent,
  children,
}: {
  badge?: string;
  accent?: "navy";
  children: React.ReactNode;
}) {
  return (
    <div className="relative mt-3 rounded-2xl border border-border bg-card p-[15px] shadow-[0_4px_14px_rgba(9,26,18,.04)]">
      {badge && (
        <span
          className="absolute -top-2.5 right-3 rounded-full px-2.5 py-1 font-heading text-[10.5px] font-bold text-white"
          style={{ background: accent === "navy" ? "var(--color-navy)" : "#0a7d3c" }}
        >
          {badge}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-[22px] border border-[#E4E8DD] bg-card p-5 shadow-[0_10px_34px_rgba(9,26,18,.08)] [animation:fpUp_.35s_cubic-bezier(.22,1,.36,1)_both]">
      {children}
    </div>
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
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "fp-btn mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[15px] font-heading text-[17px] font-bold text-primary-foreground " +
        (disabled
          ? "cursor-not-allowed bg-[#8FBF9F]"
          : "bg-primary shadow-[0_12px_26px_rgba(10,125,60,.28)] hover:bg-[#08652F]")
      }
    >
      {label}
      <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
    </button>
  );
}
