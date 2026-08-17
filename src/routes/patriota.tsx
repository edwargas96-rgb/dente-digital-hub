import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/patriota")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Foto Patriota IA" },
      {
        name: "description",
        content: "Crie uma foto patriota ficticia gerada por IA, pronta para postar.",
      },
      { property: "og:title", content: "Foto Patriota IA" },
      {
        property: "og:description",
        content: "Crie uma foto patriota ficticia gerada por IA, pronta para postar.",
      },
    ],
  }),
  component: Patriota,
});

/** Estrela usada nos selos e avaliações. */
function Star({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.7 5.5 6 .9-4.35 4.24 1.03 6-5.38-2.83L6.6 19.13l1.03-6L3.28 8.9l6-.9L12 2.5z" />
    </svg>
  );
}

const EXAMPLES = [
  {
    src: "/examples/patriota/example-real-selfie-capitao.svg",
    alt: "Exemplo 1: Selfie patriota",
    title: "Exemplo 1: Selfie patriota",
  },
  {
    src: "/examples/patriota/example-real-02.svg",
    alt: "Exemplo 2: Encontro com o Capitão",
    title: "Exemplo 2: Encontro com o Capitão",
  },
  {
    src: "/examples/patriota/example-real-03.svg",
    alt: "Exemplo 3: Evento com bandeiras",
    title: "Exemplo 3: Evento com bandeiras",
  },
];

const STEPS = ["Escolha o clima", "Envie uma foto nítida", "Libere sua imagem"];

const TESTIMONIALS = [
  {
    img: "/testimonials/valdeci.svg",
    name: "Valdeci Oliveira",
    handle: "@valdeci.patriota",
    quote:
      "Fiz todos meus amigos patriotas usarem foto de perfil com o Capitão. Ficou tão real que o pessoal do grupo nem acreditou!",
  },
  {
    img: "/testimonials/terezinha.svg",
    name: "Terezinha Souza",
    handle: "@dona.terezinha",
    quote:
      "Botei minha foto com o Capitão no WhatsApp e o grupo da família inteiro quis fazer a sua também. Ficou muito real!",
  },
  {
    img: "/testimonials/sebastiao.svg",
    name: "Sebastiao Ramos",
    handle: "@sebastiao.brasil",
    quote:
      "Nunca tive a chance de tirar uma foto com o Capitão pessoalmente, mas essa aqui ficou de arrepiar. Já virou minha foto de perfil!",
  },
  {
    img: "/testimonials/geraldo.svg",
    name: "Geraldo Nunes",
    handle: "@geraldo.nunes",
    quote:
      "Paguei no PIX e recebi na hora. Compartilhei no grupo e todo mundo pediu o link. Simples até pra mim que não manjo de celular!",
  },
];

const SECURITY = [
  "Imagem gerada por IA",
  "Pagamento único, sem assinatura",
  "Sua foto é usada apenas para gerar o resultado",
  "Seus dados ficam protegidos do início ao fim",
  "Não é propaganda oficial nem apoio de figura pública",
];

function Patriota() {
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

        <div className="pb-2">
          {/* HERO */}
          <section className="px-5 pb-[26px] pt-6">
            <h1 className="mt-4 font-heading text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground">
              Mostre pra todo mundo de que lado você está: faça sua foto com o nosso capitão e fortaleça o nosso lado 🇧🇷
            </h1>
            <p className="mt-3 text-[14.5px] leading-[1.5] text-[#53645A]">
              Você manda uma foto sua, a gente monta tudo pra você e em poucos minutos ela fica pronta 📸
            </p>

            <div className="mt-[14px] flex items-start gap-2.5 rounded-[14px] border border-[#EAC94F] bg-[#FFF4CE] px-4 py-3">
              <span className="text-[22px] leading-none" aria-hidden="true">
                🎁
              </span>
              <p className="text-[14px] leading-[1.42] text-[#6B5A1E]">
                E leve <strong className="font-extrabold text-[#8A6A00]">de GRAÇA</strong> o bônus{" "}
                <strong className="font-bold text-foreground">Poste Como Patriota</strong> — 20 legendas prontas,
                figurinhas e papéis de parede.
              </p>
            </div>

            <div className="relative mx-auto mb-0.5 mt-[22px] max-w-[300px]">
              <div className="relative overflow-hidden rounded-[22px] border-[6px] border-white shadow-[0_22px_46px_rgba(9,26,18,.24)] [transform:rotate(-1.4deg)]">
                <img
                  alt="Exemplo de foto patriota gerada por IA"
                  width={450}
                  height={800}
                  className="block h-auto w-full"
                  src="/examples/patriota/example-real-selfie-capitao.svg"
                />
                <span className="absolute bottom-[9px] left-[9px] rounded-[7px] bg-[rgba(9,20,14,.74)] px-2 py-[5px] font-heading text-[9px] font-bold tracking-[0.07em] text-white">
                  EXEMPLO GERADO POR IA
                </span>
              </div>
              <div className="absolute -top-2 right-0.5 grid h-[38px] w-[38px] place-items-center rounded-[11px] bg-[color:var(--color-navy)] shadow-[0_8px_18px_rgba(18,43,107,.3)] [transform:rotate(6deg)]">
                <Star size={20} className="text-[#E8B713]" />
              </div>
            </div>

            <Link
              to="/patriota-gerar"
              className="mt-[18px] flex min-h-[56px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-primary font-heading text-[17px] font-bold tracking-[0.01em] text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.3)] transition-colors hover:bg-[#08652F]"
            >
              Quero minha foto com o ZeroUm
              <ArrowRight className="size-[19px]" strokeWidth={2.4} />
            </Link>

            <div className="mt-[18px] flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
                <ShieldCheck className="size-[14px] text-primary" strokeWidth={2} /> Dados protegidos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
                <Check className="size-[14px] text-primary" strokeWidth={2.2} /> Garantia de satisfação
              </span>
            </div>

            <div className="mt-3 flex items-center justify-center gap-[7px] text-[12.5px] text-[#7A897F]">
              <Star size={15} className="text-[#E8B713]" />
              <span>
                <strong className="text-foreground">+12.487</strong> fotos patriotas ja criadas
              </span>
            </div>
            <p className="mt-2 text-center text-[11px] text-[#A0A99C]">
              Imagem fictícia gerada por inteligência artificial.
            </p>
          </section>

          {/* EXEMPLOS */}
          <section className="w-full border-y border-[#ECEFE6] bg-muted pb-6 pt-[22px]">
            <div className="px-5 pb-[14px]">
              <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">
                Exemplos de resultado
              </h2>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#7A897F]">
                Imagens de exemplo servem apenas para mostrar estilos possíveis. Elas não são clientes reais.
              </p>
            </div>
            <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 pt-0.5 [-webkit-overflow-scrolling:touch]">
              {EXAMPLES.map((ex) => (
                <div key={ex.title} className="w-[180px] shrink-0 snap-start">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#E4E8DD] bg-[#EDEFE8] shadow-[0_8px_20px_rgba(9,26,18,.09)]">
                    <img alt={ex.alt} src={ex.src} className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-md bg-[rgba(9,20,14,.74)] px-[7px] py-1 font-heading text-[8.5px] font-bold tracking-[0.06em] text-white">
                      EXEMPLO GERADO POR IA
                    </span>
                  </div>
                  <p className="mx-0.5 mt-2 text-[12.5px] font-semibold text-[#0F1E16]">{ex.title}</p>
                  <p className="mx-0.5 mt-px text-[11px] text-[#8A978D]">Imagem fictícia para demonstrar o estilo.</p>
                </div>
              ))}
            </div>
          </section>

          {/* COMO FUNCIONA */}
          <section className="px-5 pb-2 pt-6">
            <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">Como funciona</h2>
            <p className="mb-4 mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              O processo é curto, direto e feito para quem quer uma imagem patriota pronta para postar.
            </p>
            <div className="flex flex-col gap-2.5">
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-[15px] py-[14px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
                >
                  <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-[#EAF4EC] font-heading text-[16px] font-extrabold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-medium text-[#20302A]">{step}</span>
                </div>
              ))}
            </div>
          </section>

          {/* DEPOIMENTOS */}
          <section className="px-5 pb-1 pt-6">
            <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">Quem já usou aprova</h2>
            <p className="mb-3.5 mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              Mensagens de patriotas que já criaram e compartilharam a própria foto.{" "}
              <span className="text-[#8A978D]">Fotos ilustrativas.</span>
            </p>
            <div className="flex flex-col gap-3">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.handle}
                  className="rounded-2xl border border-border bg-card p-[15px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
                >
                  <div className="flex items-center gap-[11px]">
                    <span className="relative flex h-10 w-10 flex-none overflow-hidden rounded-full bg-[#EAF4EC]">
                      <img alt="" src={t.img} className="h-full w-full object-cover" />
                    </span>
                    <figcaption className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-heading text-[14px] font-bold text-foreground">
                        <span className="truncate">{t.name}</span>
                        <span className="flex-none text-[12px]" aria-hidden="true">
                          🇧🇷
                        </span>
                      </div>
                      <span className="block text-[11.5px] text-[#8A978D]">{t.handle}</span>
                    </figcaption>
                    <div className="flex flex-none gap-px text-[#E8B713]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} />
                      ))}
                    </div>
                  </div>
                  <blockquote className="mt-[11px] text-[13.5px] leading-[1.55] text-[#3A4A40]">
                    “{t.quote}”
                  </blockquote>
                </figure>
              ))}
            </div>
          </section>

          {/* SEGURANÇA */}
          <section className="px-5 pb-1.5 pt-3.5">
            <div className="overflow-hidden rounded-2xl border border-border shadow-[0_6px_18px_rgba(9,26,18,.05)]">
              <div className="bg-card px-4 pb-1 pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <Shield className="h-[17px] w-[17px] flex-none text-primary" strokeWidth={2} />
                  <h3 className="font-heading text-[15px] font-bold text-foreground">Segurança e transparência</h3>
                </div>
                <ul className="flex flex-col gap-[9px] pb-3.5">
                  {SECURITY.map((item) => (
                    <li key={item} className="flex items-start gap-[9px]">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-primary" strokeWidth={2.4} />
                      <span className="text-[13px] leading-[1.45] text-[#4B5B50]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
