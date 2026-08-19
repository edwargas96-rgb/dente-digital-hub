import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Copy, Gift, Share2 } from "lucide-react";
import { FlagBR } from "@/components/flags";
import { gerarCodigo } from "@/lib/referral";

export const Route = createFileRoute("/indique")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Indique e Ganhe — Foto Patriota" },
      { name: "description", content: "Indique amigos e ganhe dinheiro de volta no Pix." },
    ],
  }),
  component: Indique,
});

function getParam(name: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function Indique() {
  const [nome, setNome] = useState(() => getParam("nome"));
  const [whatsapp, setWhatsapp] = useState(() => getParam("wa"));
  const [gerado, setGerado] = useState(() => !!getParam("nome") && !!getParam("wa"));
  const [copiado, setCopiado] = useState(false);

  const whatsappValido = whatsapp.replace(/\D/g, "").length >= 10;
  const podeGerar = nome.trim().length > 1 && whatsappValido;

  const codigo = gerarCodigo(nome, whatsapp);
  const origem = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origem}/patriota?ref=${codigo}`;
  const mensagem =
    `🇧🇷 Fiz minha foto patriota e ficou incrível! Faça a sua também com 20% de desconto usando o meu código *${codigo}*:\n${link}`;
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <main
      className="fp-scope flex min-h-screen justify-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(130% 70% at 50% -8%, rgba(10,125,60,.12), transparent 55%), radial-gradient(90% 55% at 108% 4%, rgba(232,183,19,.14), transparent 55%), radial-gradient(80% 55% at -8% 8%, rgba(18,43,107,.08), transparent 55%), #e7ebe1",
      }}
    >
      <div className="relative w-full max-w-[468px] bg-card shadow-[0_0_70px_rgba(9,26,18,.13)]">
        <div className="sticky top-0 z-30 h-1 fp-tricolor" />

        <div className="px-5 pb-12 pt-7">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F1E8] px-3 py-1.5 font-heading text-[11px] font-bold tracking-[0.05em] text-primary">
              <Gift className="h-[13px] w-[13px]" strokeWidth={2.4} /> INDIQUE E GANHE
            </span>
            <h1 className="mt-3 font-heading text-[26px] font-extrabold leading-[1.1] tracking-[-0.01em] text-foreground">
              Indique amigos e ganhe dinheiro de volta <FlagBR />
            </h1>
            <p className="mt-2 text-[13.5px] leading-[1.5] text-[#53645A]">
              A cada amigo que criar a foto com o seu código, ele ganha 20% de desconto e você recebe 20% de volta no
              Pix.
            </p>
          </div>

          {!gerado ? (
            <div className="mt-6 rounded-[22px] border border-[#E4E8DD] bg-card p-5 shadow-[0_10px_34px_rgba(9,26,18,.08)]">
              <p className="font-heading text-[15px] font-bold text-foreground">Gere o seu código</p>
              <p className="mt-1 text-[12.5px] text-[#7A897F]">Use o mesmo nome e WhatsApp da sua compra.</p>

              <label className="mt-4 block font-heading text-[13px] font-bold text-foreground">Seu nome</label>
              <input
                className="mt-1.5 w-full rounded-[12px] border border-border bg-card px-[14px] py-[13px] text-[14.5px] text-foreground placeholder:text-[#A6B0A3] focus:border-primary focus:outline-none"
                placeholder="Nome e sobrenome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <label className="mt-3 block font-heading text-[13px] font-bold text-foreground">Seu WhatsApp (com DDD)</label>
              <input
                className="mt-1.5 w-full rounded-[12px] border border-border bg-card px-[14px] py-[13px] text-[14.5px] text-foreground placeholder:text-[#A6B0A3] focus:border-primary focus:outline-none"
                inputMode="tel"
                placeholder="(11) 91234-5678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setGerado(true)}
                disabled={!podeGerar}
                className={
                  "fp-btn mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[15px] font-heading text-[16px] font-bold text-primary-foreground " +
                  (podeGerar
                    ? "bg-primary shadow-[0_12px_26px_rgba(10,125,60,.28)] hover:bg-[#08652F]"
                    : "cursor-not-allowed bg-[#8FBF9F]")
                }
              >
                Ver meu código <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            <>
              {/* Código */}
              <div
                className="mt-6 overflow-hidden rounded-[22px] border-2 border-[#EAC94F] p-5 text-center"
                style={{ background: "linear-gradient(180deg, #FFFBEF, #FFF6D8)" }}
              >
                <p className="font-heading text-[12.5px] font-bold uppercase tracking-[0.08em] text-[#8A6A00]">
                  Seu código
                </p>
                <p className="mt-1 font-heading text-[38px] font-extrabold tracking-[0.04em] text-primary">{codigo}</p>
              </div>

              {/* Botões */}
              <a
                href={whatsappShare}
                target="_blank"
                rel="noopener noreferrer"
                className="fp-btn fp-cta mt-4 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[15px] bg-primary font-heading text-[16.5px] font-bold text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.30)] hover:bg-[#08652F]"
              >
                <Share2 className="h-[19px] w-[19px]" strokeWidth={2.2} /> Compartilhar no WhatsApp
              </a>
              <button
                type="button"
                onClick={copiar}
                className="fp-btn mt-2.5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-border bg-card font-heading text-[14.5px] font-bold text-foreground"
              >
                {copiado ? (
                  <>
                    <Check className="h-[17px] w-[17px] text-primary" strokeWidth={2.6} /> Link copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-[17px] w-[17px]" strokeWidth={2.2} /> Copiar meu link
                  </>
                )}
              </button>

              {/* Como funciona */}
              <div className="mt-6 rounded-[22px] border border-[#E4E8DD] bg-card p-5 shadow-[0_10px_34px_rgba(9,26,18,.08)]">
                <p className="font-heading text-[15px] font-bold text-foreground">Como funciona</p>
                <ol className="mt-3 flex flex-col gap-3">
                  {[
                    "Compartilhe o seu código com os amigos patriotas.",
                    "Cada amigo que fizer a foto com o seu código ganha 20% de desconto.",
                    "Você recebe 20% de volta no Pix por cada amigo que comprar.",
                  ].map((txt, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-[#EAF4EC] font-heading text-[13px] font-extrabold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] leading-[1.45] text-[#3A4A40]">{txt}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#EAD9A0] bg-[#FFF6D8] px-3 py-2.5">
                  <span className="text-[18px] leading-none" aria-hidden="true">
                    🔥
                  </span>
                  <p className="text-[13px] font-semibold leading-[1.4] text-[#6B5A1E]">
                    Indicou 5 amigos? A sua foto sai <strong className="font-extrabold text-[#8A6A00]">de graça</strong>!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGerado(false)}
                className="mt-4 w-full text-center text-[12.5px] font-semibold text-[#7A897F] underline"
              >
                Gerar código com outro nome/WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
