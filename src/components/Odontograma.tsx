import { cn } from "@/lib/utils";
import { ARCADA_SUPERIOR, ARCADA_INFERIOR } from "@/lib/ordens";

function IconeDente({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M6.4 3.2c1.4 0 2.1.7 3.3.7h1.6c1.2 0 1.9-.7 3.3-.7 2.4 0 4 1.9 4 4.7 0 2.2-.7 3.4-1.2 5.3-.4 1.6-.5 3.1-.9 5-.3 1.6-.8 2.6-1.8 2.6-1.1 0-1.4-1.2-1.7-3-.3-1.7-.5-3.4-1.6-3.4h-1.9c-1.1 0-1.3 1.7-1.6 3.4-.3 1.8-.6 3-1.7 3-1 0-1.5-1-1.8-2.6-.4-1.9-.5-3.4-.9-5C2.9 11.3 2.2 10.1 2.2 7.9c0-2.8 1.7-4.7 4.2-4.7Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dente({
  numero,
  ativo,
  onToggle,
  somenteLeitura,
}: {
  numero: number;
  ativo: boolean;
  onToggle: (n: number) => void;
  somenteLeitura?: boolean | undefined;
}) {
  return (
    <button
      type="button"
      disabled={somenteLeitura}
      onClick={() => onToggle(numero)}
      aria-pressed={ativo}
      aria-label={`Dente ${numero}`}
      className={cn(
        "group flex w-9 flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition-all sm:w-10",
        "disabled:cursor-default",
        ativo
          ? "border-primary bg-primary text-primary-foreground shadow-[0_2px_10px_oklch(0.455_0.078_186_/_35%)]"
          : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:bg-primary-soft hover:text-primary",
      )}
    >
      <IconeDente className="size-5 sm:size-6" />
      <span className="numeric text-[10px] leading-none font-medium sm:text-[11px]">{numero}</span>
    </button>
  );
}

export function Odontograma({
  selecionados,
  onChange,
  somenteLeitura,
}: {
  selecionados: number[];
  onChange?: ((proximos: number[]) => void) | undefined;
  somenteLeitura?: boolean | undefined;
}) {
  const toggle = (n: number) => {
    if (!onChange) return;
    onChange(
      selecionados.includes(n)
        ? selecionados.filter((x) => x !== n)
        : [...selecionados, n].sort((a, b) => a - b),
    );
  };

  const linha = (dentes: number[]) => (
    <div className="flex justify-center gap-1 overflow-x-auto pb-1">
      {dentes.map((n, i) => (
        <div key={n} className={cn(i === 8 && "ml-2 border-l border-dashed border-border pl-2")}>
          <Dente
            numero={n}
            ativo={selecionados.includes(n)}
            onToggle={toggle}
            somenteLeitura={Boolean(somenteLeitura)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-gradient-to-b from-card to-secondary/60 p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between text-[11px] tracking-wide text-muted-foreground uppercase">
        <span>Arcada superior</span>
        <span className="numeric">FDI</span>
      </div>
      {linha(ARCADA_SUPERIOR)}
      <div className="my-3 h-px bg-border" />
      {linha(ARCADA_INFERIOR)}
      <div className="mt-2 text-[11px] tracking-wide text-muted-foreground uppercase">
        Arcada inferior
      </div>
      <div className="mt-3 rounded-lg bg-card px-3 py-2 text-sm">
        <span className="text-muted-foreground">Elementos: </span>
        <span className="numeric font-medium text-primary">
          {selecionados.length ? selecionados.join(", ") : "nenhum selecionado"}
        </span>
      </div>
    </div>
  );
}
