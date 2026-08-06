import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { ultimosMeses } from "@/lib/gestao";
import { diasRestantes } from "@/lib/ordens";
import { useOrdens, Kpi } from "@/components/gestao-shared";

export const Route = createFileRoute("/_app/visao")({
  head: () => ({
    meta: [
      { title: "Visão geral — LAB PIGATTO" },
      { name: "description", content: "Indicadores das ordens de serviço do laboratório." },
    ],
  }),
  component: VisaoGeral,
});

function VisaoGeral() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  const { data: ordens = [] } = useOrdens();
  const meses = ultimosMeses(6);

  const osPorMes = meses.map((m) => ({
    mes: m.rotulo,
    os: ordens.filter((o) => o.created_at.slice(0, 7) === m.chave).length,
  }));

  const recebidas = ordens.filter((o) => o.lab_status === "Recebida").length;
  const entregues = ordens.filter((o) => o.lab_status === "Entregue").length;
  const atrasadas = ordens.filter(
    (o) => o.lab_status === "Recebida" && diasRestantes(o.data_entrega) < 0,
  ).length;

  const porClinica = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of ordens) {
      const nome = o.clinics?.nome ?? "—";
      map.set(nome, (map.get(nome) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);
  }, [ordens]);

  return (
    <AppLayout titulo="Visão geral" descricao="Indicadores das ordens de serviço">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Total de O.S." valor={String(ordens.length)} />
          <Kpi label="Recebidas" valor={String(recebidas)} hint="em andamento" />
          <Kpi label="Entregues" valor={String(entregues)} />
          <Kpi label="Atrasadas" valor={String(atrasadas)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-sm font-semibold">Ordens por mês (6 meses)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={osPorMes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} allowDecimals={false} />
                  <RTooltip />
                  <Bar dataKey="os" name="O.S." fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-sm font-semibold">Clínicas mais ativas</h3>
            {porClinica.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <ol className="space-y-3">
                {porClinica.map((c, i) => (
                  <li key={c.nome} className="flex items-center gap-3">
                    <span className="numeric flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">{c.nome}</div>
                    <span className="numeric text-sm font-semibold text-primary">{c.qtd} O.S.</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
