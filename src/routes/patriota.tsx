import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Shield, ShieldCheck } from "lucide-react";
import { FlagBR } from "@/components/flags";

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
    src: "https://i.imgur.com/K9BZneU.jpeg",
    alt: "Exemplo 1: Selfie patriota",
    title: "Exemplo 1: Selfie patriota",
  },
  {
    src: "https://i.imgur.com/V5dN9xv.jpeg",
    alt: "Exemplo 2: Encontro com o ZeroUm",
    title: "Exemplo 2: Encontro com o ZeroUm",
  },
  {
    src: "https://i.imgur.com/f0Aa0H1.jpeg",
    alt: "Exemplo 3: Evento com bandeiras",
    title: "Exemplo 3: Evento com bandeiras",
  },
];

const STEPS = ["Escolha o clima", "Envie uma foto nítida", "Libere sua imagem"];

const TESTIMONIALS = [
  {
    img: "https://i.imgur.com/T8wJeYk.jpeg",
    name: "João Victor",
    handle: "@joaovictor.br",
    quote:
      "Fiz todos meus amigos patriotas usarem foto de perfil com o ZeroUm. Ficou incrível, o grupo todo quis a sua também!",
  },
  {
    img: "https://i.imgur.com/YUshkSn.jpeg",
    name: "Terezinha Souza",
    handle: "@dona.terezinha",
    quote:
      "Botei minha foto com o ZeroUm no WhatsApp e o grupo da família inteiro quis fazer a sua também. Ficou linda!",
  },
  {
    img: "https://i.imgur.com/9NBgvZr.jpeg",
    name: "Brendha Nunes",
    handle: "@brendha.nunes",
    quote:
      "Nunca tive a chance de tirar uma foto com o ZeroUm pessoalmente, mas essa aqui ficou de arrepiar. Já virou minha foto de perfil!",
  },
];

const SECURITY = [
  "Imagem gerada por IA",
  "Pagamento único, sem assinatura",
  "Garantia de 7 dias: não gostou, devolvemos o seu dinheiro",
  "Sua foto é usada apenas para gerar o resultado",
  "Seus dados ficam protegidos do início ao fim",
  "Não é propaganda oficial nem apoio de figura pública",
];

// Notificações de "alguém comprou" (prova social). Nomes fictícios, ciclam na tela.
const COMPRAS = [
  { nome: "Carlos Eduardo", cidade: "Belo Horizonte - MG" },
  { nome: "Fernanda Lima", cidade: "Curitiba - PR" },
  { nome: "Marcos Antônio", cidade: "Salvador - BA" },
  { nome: "Patrícia Gomes", cidade: "Fortaleza - CE" },
  { nome: "Rafael Souza", cidade: "Porto Alegre - RS" },
  { nome: "Juliana Alves", cidade: "Recife - PE" },
  { nome: "Anderson Silva", cidade: "Goiânia - GO" },
  { nome: "Camila Ribeiro", cidade: "Manaus - AM" },
  { nome: "Roberto Dias", cidade: "Brasília - DF" },
  { nome: "Aline Costa", cidade: "Campinas - SP" },
];

/** Notificação flutuante de prova social: "fulano criou a foto patriota". */
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
      hide = window.setTimeout(() => setVisible(false), 5000);
      i++;
      // Espaçamento crescente: 1ª→2ª em 60s, 2ª→3ª em 120s, 3ª→4ª em 180s...
      next = window.setTimeout(show, i * 60000);
    };
    const first = window.setTimeout(show, 10000); // primeira após ~10s
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
        "fixed bottom-4 left-4 z-50 max-w-[290px] transition-all duration-500 " +
        (visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0")
      }
    >
      <div className="flex items-center gap-3 rounded-2xl border border-[#E4E8DD] bg-white px-3.5 py-2.5 shadow-[0_10px_30px_rgba(9,26,18,.18)]">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#EAF4EC] text-primary">
          <Check className="h-5 w-5" strokeWidth={2.6} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight text-foreground">{c.nome} <FlagBR /></p>
          <p className="text-[11.5px] leading-tight text-[#7A897F]">criou a foto patriota • {c.cidade}</p>
          <p className="text-[10.5px] text-[#A0A99C]">há {mins} min</p>
        </div>
      </div>
    </div>
  );
}

// Fotos do carrossel do topo (trocam sozinhas). Troque os src pelas fotos reais.
const HERO_SLIDES = [
  { src: "https://i.imgur.com/K9BZneU.jpeg", alt: "Selfie com o Capitão" },
  { src: "https://i.imgur.com/nr3BZUR.jpeg", alt: "Selfie com o ZeroUm" },
  { src: "https://i.imgur.com/V5dN9xv.jpeg", alt: "Encontro patriota" },
  { src: "https://i.imgur.com/f0Aa0H1.jpeg", alt: "Evento com bandeiras" },
];

/** Mini carrossel do hero: cross-fade automático entre as fotos. */
function HeroCarousel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % HERO_SLIDES.length), 2600);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto mb-0.5 mt-[22px] max-w-[300px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[22px] border-[6px] border-white shadow-[0_22px_46px_rgba(9,26,18,.24)] [transform:rotate(-1.4deg)]">
        {HERO_SLIDES.map((s, idx) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            className={
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out " +
              (idx === i ? "opacity-100" : "opacity-0")
            }
          />
        ))}
        {/* Dots */}
        <div className="absolute right-[10px] top-[10px] z-10 flex gap-1.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Ver foto ${idx + 1}`}
              onClick={() => setI(idx)}
              className={
                "h-[7px] rounded-full transition-all " + (idx === i ? "w-[16px] bg-white" : "w-[7px] bg-white/60")
              }
            />
          ))}
        </div>
        {/* Selo permanente de imagem fictícia */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-[rgba(9,20,14,.72)] py-[6px] text-center font-heading text-[10px] font-bold tracking-[0.10em] text-white">
          IMAGEM FICTÍCIA • GERADA POR IA
        </div>
      </div>
      <div className="absolute -top-2 right-0.5 grid h-[38px] w-[38px] place-items-center rounded-[11px] bg-[color:var(--color-navy)] shadow-[0_8px_18px_rgba(18,43,107,.3)] [transform:rotate(6deg)]">
        <Star size={20} className="text-[#E8B713]" />
      </div>
    </div>
  );
}

function Patriota() {
  // Anima as seções conforme entram na tela ao rolar.
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
  }, []);

  return (
    <main
      className="fp-scope flex min-h-screen justify-center overflow-x-hidden"
      style={{
        background:
          "radial-gradient(130% 70% at 50% -8%, rgba(10,125,60,.12), transparent 55%), radial-gradient(90% 55% at 108% 4%, rgba(232,183,19,.14), transparent 55%), radial-gradient(80% 55% at -8% 8%, rgba(18,43,107,.08), transparent 55%), #e7ebe1",
      }}
    >
      <SalesNotification />
      <div className="relative w-full max-w-[468px] bg-card shadow-[0_0_70px_rgba(9,26,18,.13)]">
        <div className="sticky top-0 z-30 h-1 fp-tricolor" />

        <div className="pb-2">
          {/* HERO */}
          <section className="px-5 pb-[26px] pt-6">
            <h1 className="mt-4 font-heading text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground">
              Mostre pra todo mundo de que lado você está: faça sua foto com o Capitão ou com o ZeroUm e fortaleça o nosso lado <FlagBR />
            </h1>
            <p className="mt-3 text-[14.5px] leading-[1.5] text-[#53645A]">
              Você manda uma foto sua, a gente monta tudo pra você e em poucos minutos ela fica pronta 📸
            </p>

            <p className="mt-2.5 flex items-start gap-2 rounded-[12px] bg-[#EAF4EC] px-3 py-2 text-[13px] font-semibold leading-[1.4] text-[#20302A]">
              <span aria-hidden="true">📸</span> Já deixe em mãos uma selfie sua, de frente e com boa luz — é ela que a
              IA vai usar.
            </p>

            <div className="mt-[14px] flex items-start gap-2.5 rounded-[14px] border border-[#EAC94F] bg-[#FFF4CE] px-4 py-3">
              <span className="text-[22px] leading-none" aria-hidden="true">
                🎁
              </span>
              <p className="text-[14px] leading-[1.42] text-[#6B5A1E]">
                E leve <strong className="font-extrabold text-[#8A6A00]">de GRAÇA</strong> o bônus{" "}
                <strong className="font-bold text-foreground">Poste Como um Patriota</strong> — 20 legendas prontas
                para postar em suas redes.
              </p>
            </div>

            <HeroCarousel />

            <Link
              to="/patriota-gerar"
              className="mt-[18px] flex min-h-[56px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-primary font-heading text-[17px] font-bold tracking-[0.01em] text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.3)] transition-colors hover:bg-[#08652F] fp-btn fp-cta"
            >
              Quero minha foto patriota
              <ArrowRight className="size-[19px]" strokeWidth={2.4} />
            </Link>

            <p className="mt-3 text-center text-[13.5px] text-[#53645A]">
              <span className="text-[#A0A99C] line-through">R$ 39,90</span>{" "}
              <strong className="font-heading text-[17px] font-extrabold text-primary">R$ 19,90</strong> no Pix
            </p>

            <div className="mt-[14px] flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
                <ShieldCheck className="size-[14px] text-primary" strokeWidth={2} /> Dados protegidos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
                <Check className="size-[14px] text-primary" strokeWidth={2.2} /> Garantia de 7 dias
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
          <section className="fp-reveal w-full border-y border-[#ECEFE6] bg-muted pb-6 pt-[22px]">
            <div className="px-5 pb-[14px]">
              <span className="fp-accent" />
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
                    <div className="absolute inset-x-0 bottom-0 bg-[rgba(9,20,14,.72)] py-[5px] text-center font-heading text-[8.5px] font-bold tracking-[0.08em] text-white">
                      IMAGEM FICTÍCIA • GERADA POR IA
                    </div>
                  </div>
                  <p className="mx-0.5 mt-2 text-[12.5px] font-semibold text-[#0F1E16]">{ex.title}</p>
                  <p className="mx-0.5 mt-px text-[11px] text-[#8A978D]">Imagem fictícia para demonstrar o estilo.</p>
                </div>
              ))}
            </div>
          </section>

          {/* COMO FUNCIONA */}
          <section className="fp-reveal px-5 pb-2 pt-6">
            <span className="fp-accent" />
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
          <section className="fp-reveal px-5 pb-1 pt-6">
            <span className="fp-accent" />
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
                    {t.quote}
                  </blockquote>
                </figure>
              ))}
            </div>
          </section>

          {/* CTA entre depoimentos e segurança */}
          <section className="fp-reveal px-5 pt-2">
            <Link
              to="/patriota-gerar"
              className="flex min-h-[56px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-primary font-heading text-[17px] font-bold tracking-[0.01em] text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.3)] transition-colors hover:bg-[#08652F] fp-btn fp-cta"
            >
              Quero minha foto patriota
              <ArrowRight className="size-[19px]" strokeWidth={2.4} />
            </Link>
          </section>

          {/* SEGURANÇA */}
          <section className="fp-reveal px-5 pb-1.5 pt-3.5">
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
