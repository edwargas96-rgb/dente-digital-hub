import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário de entregas — LAB PIGATTO" },
      { name: "description", content: "Visualize as entregas de próteses por data." },
      { property: "og:title", content: "Calendário de entregas — LAB PIGATTO" },
      { property: "og:description", content: "Entregas do laboratório organizadas por dia." },
    ],
  }),
  component: Calendario,
});

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function Calendario() {
  const hoje = new Date();
  const [ref, setRef] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  const inicio = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}-01`;
  const fimDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  const fim = `${fimDate.getFullYear()}-${String(fimDate.getMonth() + 1).padStart(2, "0")}-${String(fimDate.getDate()).padStart(2, "0")}`;

  const { data: ordens = [] } = useQuery({
    queryKey: ["ordens-calendario", inicio],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, numero, paciente, status, data_entrega")
        .gte("data_entrega", inicio)
        .lte("data_entrega", fim)
        .order("data_entrega");
      if (error) throw error;
      return data ?? [];
    },
  });

  const porDia = new Map<number, typeof ordens>();
  for (const o of ordens) {
    const dia = Number(o.data_entrega.slice(8, 10));
    porDia.set(dia, [...(porDia.get(dia) ?? []), o]);
  }

  const primeiroDiaSemana = new Date(ref.getFullYear(), ref.getMonth(), 1).getDay();
  const totalDias = fimDate.getDate();
  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const mudarMes = (delta: number) =>
    setRef(new Date(ref.getFullYear(), ref.getMonth() + delta, 1));

  return (
    <AppLayout
      titulo="Calendário de entregas"
      descricao="Prazos das ordens em produção"
      acao={
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Mês anterior" onClick={() => mudarMes(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Próximo mês" onClick={() => mudarMes(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      }
    >
      <div className="mb-4 font-display text-lg font-semibold">
        {MESES[ref.getMonth()]} <span className="numeric">{ref.getFullYear()}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/60">
          {DIAS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {celulas.map((dia, i) => {
            const lista = dia ? (porDia.get(dia) ?? []) : [];
            const ehHoje =
              dia === hoje.getDate() &&
              ref.getMonth() === hoje.getMonth() &&
              ref.getFullYear() === hoje.getFullYear();
            return (
              <div
                key={i}
                className="min-h-24 border-r border-b border-border p-1.5 last:border-r-0"
              >
                {dia && (
                  <>
                    <div
                      className={
                        ehHoje
                          ? "numeric mb-1 inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                          : "numeric mb-1 inline-flex size-6 items-center justify-center text-xs text-muted-foreground"
                      }
                    >
                      {dia}
                    </div>
                    <div className="space-y-1">
                      {lista.map((o) => (
                        <Link
                          key={o.id}
                          to="/ordens/$id"
                          params={{ id: o.id }}
                          className="block truncate rounded bg-primary-soft px-1.5 py-1 text-[11px] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                          title={`${o.numero} · ${o.paciente}`}
                        >
                          <span className="numeric font-medium">{o.numero}</span> {o.paciente}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Entregas do mês
        </h2>
        {ordens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma entrega prevista neste mês.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {ordens.map((o) => (
              <li key={o.id}>
                <Link
                  to="/ordens/$id"
                  params={{ id: o.id }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60"
                >
                  <span className="numeric w-24 shrink-0 text-sm text-muted-foreground">
                    {o.data_entrega.slice(8, 10)}/{o.data_entrega.slice(5, 7)}
                  </span>
                  <span className="numeric w-20 shrink-0 text-sm font-semibold text-primary">
                    {o.numero}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{o.paciente}</span>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
