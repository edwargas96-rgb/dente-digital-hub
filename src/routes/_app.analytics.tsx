import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { ultimosMeses, LAB_STATUS } from "@/lib/gestao";
import { useOrdens } from "@/components/gestao-shared";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — LAB PIGATTO" },
      { name: "description", content: "Tendências e distribuição das ordens." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  const { data: ordens = [] } = useOrdens();
  const meses = ultimosMeses(6);
  const trend = meses.map((m) => ({
    mes: m.rotulo,
    os: ordens.filter((o) => o.created_at.slice(0, 7) === m.chave).length,
  }));

  const porStatus = LAB_STATUS.map((s) => ({
    status: s,
    qtd: ordens.filter((o) => o.lab_status === s).length,
  }));

  return (
    <AppLayout titulo="Analytics" descricao="Tendências e distribuição">
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 text-sm font-semibold">Ordens recebidas por mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} allowDecimals={false} />
                <RTooltip />
                <Line
                  type="monotone"
                  dataKey="os"
                  name="O.S."
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {porStatus.map((s) => (
            <div
              key={s.status}
              className="rounded-xl border border-border bg-card p-4 text-center shadow-[var(--shadow-card)]"
            >
              <div className="numeric text-2xl font-semibold">{s.qtd}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.status}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
