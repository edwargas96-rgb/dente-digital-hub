import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { formatarMoeda } from "@/lib/gestao";
import { useOrdens, Kpi, StatusSelo } from "@/components/gestao-shared";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — LAB PIGATTO" },
      { name: "description", content: "Faturamento e recebíveis do laboratório." },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  const { data: ordens = [] } = useOrdens();
  const faturado = ordens
    .filter((o) => o.lab_status === "Entregue")
    .reduce((s, o) => s + (o.valor ?? 0), 0);
  const aReceber = ordens
    .filter((o) => ["Concluída", "Em Produção", "Aceita"].includes(o.lab_status))
    .reduce((s, o) => s + (o.valor ?? 0), 0);
  const comValor = ordens.filter((o) => o.valor);
  const ticket = comValor.length ? (faturado + aReceber) / comValor.length : 0;

  return (
    <AppLayout titulo="Financeiro" descricao="Faturamento e recebíveis">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Kpi label="Faturado (entregue)" valor={formatarMoeda(faturado)} />
          <Kpi label="A receber" valor={formatarMoeda(aReceber)} />
          <Kpi label="Ticket médio" valor={formatarMoeda(ticket)} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {comValor.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nenhuma O.S. com valor lançado ainda.
            </div>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-3">Nº</th>
                  <th className="px-3 py-3">Clínica</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comValor.map((o) => (
                  <tr key={o.id}>
                    <td className="numeric px-3 py-2.5 font-semibold text-primary">{o.numero}</td>
                    <td className="px-3 py-2.5">{o.clinics?.nome ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <StatusSelo status={o.lab_status} />
                    </td>
                    <td className="numeric px-3 py-2.5 text-right">{formatarMoeda(o.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
