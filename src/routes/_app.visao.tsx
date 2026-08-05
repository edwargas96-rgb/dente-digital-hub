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
import { formatarMoeda, ultimosMeses } from "@/lib/gestao";
import { useOrdens, Kpi } from "@/components/gestao-shared";

export const Route = createFileRoute("/_app/visao")({
  head: () => ({
    meta: [
      { title: "Visão geral — LAB PIGATTO" },
      { name: "description", content: "Indicadores e receita do laboratório." },
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

  const receitaPorMes = meses.map((m) => ({
    mes: m.rotulo,
    receita: ordens
      .filter((o) => (o.entregue_em ?? o.created_at).slice(0, 7) === m.chave && o.valor)
      .reduce((s, o) => s + (o.valor ?? 0), 0),
  }));

  const faturamentoMes = receitaPorMes[receitaPorMes.length - 1]?.receita ?? 0;
  const pendentes = ordens.filter((o) => o.lab_status === "Pendente").length;
  const emProducao = ordens.filter((o) => o.lab_status === "Em Produção").length;
  const concluidas = ordens.filter((o) => ["Concluída", "Entregue"].includes(o.lab_status)).length;

  const porClinica = useMemo(() => {
    const map = new Map<string, { nome: string; qtd: number; valor: number }>();
    for (const o of ordens) {
      const nome = o.clinics?.nome ?? "—";
      const cur = map.get(nome) ?? { nome, qtd: 0, valor: 0 };
      cur.qtd += 1;
      cur.valor += o.valor ?? 0;
      map.set(nome, cur);
    }
    return [...map.values()].sort((a, b) => b.valor - a.valor).slice(0, 5);
  }, [ordens]);

  return (
    <AppLayout titulo="Visão geral" descricao="Indicadores e receita do laboratório">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Faturamento do mês" valor={formatarMoeda(faturamentoMes)} />
          <Kpi label="Pendentes" valor={String(pendentes)} hint="aguardando aceite" />
          <Kpi label="Em produção" valor={String(emProducao)} />
          <Kpi label="Concluídas" valor={String(concluidas)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-sm font-semibold">Receita (6 meses)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={receitaPorMes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={48} />
                  <RTooltip formatter={(v: number) => formatarMoeda(v)} />
                  <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-sm font-semibold">Maiores clínicas</h3>
            {porClinica.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <ol className="space-y-3">
                {porClinica.map((c, i) => (
                  <li key={c.nome} className="flex items-center gap-3">
                    <span className="numeric flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.nome}</div>
                      <div className="numeric text-xs text-muted-foreground">{c.qtd} O.S.</div>
                    </div>
                    <span className="numeric text-sm font-semibold text-primary">
                      {formatarMoeda(c.valor)}
                    </span>
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
