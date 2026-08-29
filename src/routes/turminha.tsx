import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, BookOpen, Check, Download, HeartHandshake, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { FlagBR } from "@/components/flags";

// Troque este link pelo link real do checkout (Cakto, Hotmart, Stripe, etc.).
const CHECKOUT_URL = "https://pay.cakto.com.br/SEU-LINK-AQUI";

export const Route = createFileRoute("/turminha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Turminha do Bem — Livro digital de valores para crianças" },
      {
        name: "description",
        content:
          "Livro digital ilustrado que ensina respeito, honestidade, amor à família e à pátria. Ideal para crianças de 5 a 10 anos.",
      },
      { property: "og:title", content: "Turminha do Bem — Livro digital de valores para crianças" },
      {
        property: "og:description",
        content:
          "Livro digital ilustrado que ensina respeito, honestidade, amor à família e à pátria. Ideal para crianças de 5 a 10 anos.",
      },
      { property: "og:image", content: "/offer/turminha-capa.svg" },
    ],
  }),
  component: Turminha,
});

function Star({ size = 13, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.7 5.5 6 .9-4.35 4.24 1.03 6-5.38-2.83L6.6 19.13l1.03-6L3.28 8.9l6-.9L12 2.5z" />
    </svg>
  );
}

const VALORES = [
  { icone: HeartHandshake, titulo: "Respeito", texto: "Aprender a ouvir, a acolher e a tratar bem quem está por perto." },
  { icone: BookOpen, titulo: "Educação", texto: "Boas maneiras, disciplina em casa e na escola, atenção aos estudos." },
  { icone: Sparkles, titulo: "Honestidade", texto: "Falar a verdade, cuidar do que é dos outros, admitir erros." },
  { icone: Shield, titulo: "Amor à pátria", texto: "Conhecer os símbolos do Brasil e sentir orgulho de ser brasileiro." },
];

const PAGINAS = [
  { src: "/offer/turminha-pagina-1.svg", legenda: "Respeito em casa" },
  { src: "/offer/turminha-pagina-2.svg", legenda: "Amor à pátria" },
  { src: "/offer/turminha-pagina-3.svg", legenda: "Honestidade na escola" },
];

const PASSOS = [
  "Você compra pelo site — pagamento único no Pix ou cartão",
  "Recebe o livro digital em PDF no seu e-mail em minutos",
  "Lê com seu filho no celular, tablet, computador ou imprima em casa",
];

const DEPOIMENTOS = [
  {
    nome: "Marcia Ribeiro",
    handle: "mãe de 2, Curitiba - PR",
    quote:
      "Meu filho de 7 anos amou os desenhos e ainda me pediu pra ler de novo antes de dormir. As lições ficaram fáceis de explicar.",
  },
  {
    nome: "Roberto Almeida",
    handle: "pai de 3, Fortaleza - CE",
    quote:
      "Finalmente um livro infantil que fala de valores sem enrolação. Comprei um pra minha filha e outro pra dar de presente.",
  },
  {
    nome: "Juliana Prado",
    handle: "professora, Belo Horizonte - MG",
    quote:
      "Uso na sala de aula depois do intervalo. As crianças pedem pra continuar a história — e o assunto de respeito vira conversa natural.",
  },
];

const GARANTIAS = [
  "Entrega imediata no seu e-mail após o pagamento",
  "PDF de alta qualidade — leia no celular, tablet, PC ou imprima",
  "Pagamento único, sem assinatura recorrente",
  "Garantia de 7 dias: não gostou, devolvemos 100% do valor",
  "Compra segura, seus dados protegidos do início ao fim",
];

function Turminha() {
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
          "radial-gradient(130% 70% at 50% -8%, rgba(10,125,60,.12), transparent 55%), radial-gradient(90% 55% at 108% 4%, rgba(232,183,19,.16), transparent 55%), radial-gradient(80% 55% at -8% 8%, rgba(18,43,107,.09), transparent 55%), #e7ebe1",
      }}
    >
      <div className="relative w-full max-w-[468px] bg-card shadow-[0_0_70px_rgba(9,26,18,.13)]">
        <div className="sticky top-0 z-30 h-1 fp-tricolor" />

        {/* HERO */}
        <section className="px-5 pb-[26px] pt-6">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#EAC94F] bg-[#FFF4CE] px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#8A6A00]">
            <Sparkles className="size-3.5" strokeWidth={2.4} /> Livro digital ilustrado
          </div>

          <h1 className="mt-2 font-heading text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground">
            Ensine seu filho os valores que a escola esqueceu de ensinar <FlagBR />
          </h1>
          <p className="mt-3 text-[14.5px] leading-[1.5] text-[#53645A]">
            <strong className="text-foreground">Turminha do Bem</strong> é um livro digital ilustrado que ensina respeito,
            honestidade, amor à família e à pátria — do jeitinho que criança entende.
          </p>

          <div className="mt-[18px] flex justify-center">
            <img
              src="/offer/turminha-capa.svg"
              alt="Capa do livro Turminha do Bem"
              className="w-[240px] rounded-[14px] border-[6px] border-white shadow-[0_22px_46px_rgba(9,26,18,.22)] [transform:rotate(-2deg)]"
            />
          </div>

          <div className="mt-[18px] rounded-[14px] border border-[#E4E8DD] bg-white p-4">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7A897F]">
              Oferta de lançamento
            </p>
            <p className="mt-1 text-center">
              <span className="text-[#A0A99C] text-[15px] line-through">R$ 47,00</span>{" "}
              <span className="font-heading text-[32px] font-extrabold text-primary">R$ 19,90</span>
            </p>
            <p className="mt-0.5 text-center text-[12.5px] text-[#53645A]">Pagamento único no Pix ou cartão</p>
          </div>

          <a
            href={CHECKOUT_URL}
            className="mt-[18px] flex min-h-[56px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-primary font-heading text-[17px] font-bold tracking-[0.01em] text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.3)] transition-colors hover:bg-[#08652F] fp-btn fp-cta"
          >
            Quero o livro por R$ 19,90
            <ArrowRight className="size-[19px]" strokeWidth={2.4} />
          </a>

          <div className="mt-[14px] flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
              <Download className="size-[14px] text-primary" strokeWidth={2.2} /> Entrega em minutos
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E8DD] bg-[#F2F5EE] px-[11px] py-[7px] text-[12px] font-semibold text-[#41533F]">
              <ShieldCheck className="size-[14px] text-primary" strokeWidth={2} /> Garantia de 7 dias
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-[7px] text-[12.5px] text-[#7A897F]">
            <Star size={15} className="text-[#E8B713]" />
            <span>
              <strong className="text-foreground">+3.482</strong> famílias já receberam
            </span>
          </div>
        </section>

        {/* VALORES */}
        <section className="fp-reveal w-full border-y border-[#ECEFE6] bg-muted px-5 pb-6 pt-[22px]">
          <span className="fp-accent" />
          <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">
            O que seu filho vai aprender
          </h2>
          <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
            Cada capítulo trabalha um valor, com uma história curta e ilustrações grandes que prendem a atenção da criança.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {VALORES.map(({ icone: Icone, titulo, texto }) => (
              <div
                key={titulo}
                className="rounded-2xl border border-border bg-card p-3.5 shadow-[0_6px_18px_rgba(9,26,18,.05)]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#EAF4EC] text-primary">
                  <Icone className="size-[18px]" strokeWidth={2.2} />
                </span>
                <h3 className="mt-2 font-heading text-[15px] font-bold text-foreground">{titulo}</h3>
                <p className="mt-1 text-[12.5px] leading-[1.45] text-[#53645A]">{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRÉVIA DE PÁGINAS */}
        <section className="fp-reveal px-5 pb-2 pt-6">
          <span className="fp-accent" />
          <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">Uma espiada por dentro</h2>
          <p className="mt-1.5 mb-4 text-[13px] leading-[1.5] text-muted-foreground">
            Ilustrações originais, cores vivas e diálogos simples. Feito para ler com a criança no colo.
          </p>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
            {PAGINAS.map((p) => (
              <div key={p.src} className="w-[190px] shrink-0 snap-start">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#E4E8DD] bg-white shadow-[0_8px_20px_rgba(9,26,18,.09)]">
                  <img alt={p.legenda} src={p.src} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <p className="mx-0.5 mt-2 text-[12.5px] font-semibold text-[#0F1E16]">{p.legenda}</p>
                <p className="mx-0.5 mt-px text-[11px] text-[#8A978D]">Página ilustrativa.</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="fp-reveal px-5 pb-2 pt-6">
          <span className="fp-accent" />
          <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">Como você recebe</h2>
          <p className="mb-4 mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
            Sem esperar entrega, sem frete. Você compra e já pode começar a ler hoje mesmo.
          </p>
          <div className="flex flex-col gap-2.5">
            {PASSOS.map((passo, i) => (
              <div
                key={passo}
                className="flex items-start gap-3.5 rounded-2xl border border-border bg-card px-[15px] py-[14px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
              >
                <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-[#EAF4EC] font-heading text-[16px] font-extrabold text-primary">
                  {i + 1}
                </span>
                <span className="pt-1 text-[14px] font-medium leading-[1.4] text-[#20302A]">{passo}</span>
              </div>
            ))}
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className="fp-reveal px-5 pb-1 pt-6">
          <span className="fp-accent" />
          <h2 className="font-heading text-[19px] font-bold tracking-[-0.01em] text-foreground">O que os pais estão dizendo</h2>
          <p className="mb-3.5 mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
            Famílias que já leram com seus filhos e estão vendo diferença no dia a dia.
          </p>
          <div className="flex flex-col gap-3">
            {DEPOIMENTOS.map((t) => (
              <figure
                key={t.nome}
                className="rounded-2xl border border-border bg-card p-[15px] shadow-[0_6px_18px_rgba(9,26,18,.05)]"
              >
                <div className="flex items-center gap-[11px]">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#EAF4EC] font-heading text-[14px] font-extrabold text-primary">
                    {t.nome
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <figcaption className="min-w-0 flex-1">
                    <div className="font-heading text-[14px] font-bold text-foreground">{t.nome}</div>
                    <span className="block text-[11.5px] text-[#8A978D]">{t.handle}</span>
                  </figcaption>
                  <div className="flex flex-none gap-px text-[#E8B713]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} />
                    ))}
                  </div>
                </div>
                <blockquote className="mt-[11px] text-[13.5px] leading-[1.55] text-[#3A4A40]">{t.quote}</blockquote>
              </figure>
            ))}
          </div>
        </section>

        {/* CTA SECUNDÁRIO */}
        <section className="fp-reveal px-5 pt-4">
          <a
            href={CHECKOUT_URL}
            className="flex min-h-[56px] w-full items-center justify-center gap-[9px] rounded-[15px] bg-primary font-heading text-[17px] font-bold tracking-[0.01em] text-primary-foreground shadow-[0_12px_26px_rgba(10,125,60,.3)] transition-colors hover:bg-[#08652F] fp-btn fp-cta"
          >
            Quero o livro por R$ 19,90
            <ArrowRight className="size-[19px]" strokeWidth={2.4} />
          </a>
          <p className="mt-2 text-center text-[12px] text-[#7A897F]">
            Pagamento único • Entrega imediata • Garantia de 7 dias
          </p>
        </section>

        {/* GARANTIAS */}
        <section className="fp-reveal px-5 pb-2 pt-6">
          <div className="overflow-hidden rounded-2xl border border-border shadow-[0_6px_18px_rgba(9,26,18,.05)]">
            <div className="bg-card px-4 pb-1 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-[17px] w-[17px] flex-none text-primary" strokeWidth={2} />
                <h3 className="font-heading text-[15px] font-bold text-foreground">Sua compra é 100% segura</h3>
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

        {/* FOOTER */}
        <footer className="px-5 pb-8 pt-6 text-center">
          <p className="text-[11.5px] text-[#8A978D]">
            © {new Date().getFullYear()} Nobilex • Todos os direitos reservados
          </p>
          <p className="mt-1 text-[11px] text-[#A0A99C]">
            Suporte: <a href="mailto:suporte@nobilex.com.br" className="underline">suporte@nobilex.com.br</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
