import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Inbox, Hammer, PackageCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, PrazoBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatarData, prazoTipo, diasRestantes } from "@/lib/ordens";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — LAB PIGATTO" },
      { name: "description", content: "Acompanhe as ordens de serviço do LAB PIGATTO." },
      { property: "og:title", content: "Painel — LAB PIGATTO" },
      { property: "og:description", content: "Ordens de serviço e prazos em um só lugar." },
    ],
  }),
  component: Dashboard,
});

type OrdemLista = {
  id: string;
  numero: string;
  paciente: string;
  item: string | null;
  status: string;
  data_entrega: string;
  created_at: string;
  clinics: { nome: string } | null;
};

function Dashboard() {
  const { role } = useAuth();
  const isLab = role === "laboratorio";

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ["ordens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, numero, paciente, item, status, data_entrega, created_at, clinics(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemLista[];
    },
  });

  const novas = ordens.filter((o) => o.status === "Recebida").length;
  const producao = ordens.filter((o) =>
    ["Em análise", "Em produção", "Em prova"].includes(o.status),
  ).length;
  const prontas = ordens.filter((o) => o.status === "Pronta").length;
  const atrasadas = ordens.filter((o) => prazoTipo(o.data_entrega, o.status) === "atrasada").length;

  const cards = [
    { label: "Novas", valor: novas, icone: Inbox, cor: "text-primary" },
    { label: "Em produção", valor: producao, icone: Hammer, cor: "text-warning-foreground" },
    { label: "Prontas", valor: prontas, icone: PackageCheck, cor: "text-success" },
    { label: "Atrasadas", valor: atrasadas, icone: AlertTriangle, cor: "text-danger" },
  ];

  return (
    <AppLayout
      titulo={isLab ? "Painel do laboratório" : "Minhas ordens"}
      descricao={
        isLab ? "Todas as ordens das clínicas parceiras" : "Ordens enviadas pela sua clínica"
      }
      acao={
        <Button asChild>
          <Link to="/nova-ordem">
            <Plus className="size-4" /> Nova ordem
          </Link>
        </Button>
      }
    >
      {isLab && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <c.icone className={`size-4 ${c.cor}`} />
              </div>
              <div className="numeric mt-2 text-3xl font-semibold">{c.valor}</div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando ordens…</div>
        ) : ordens.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma ordem por aqui ainda.</p>
            <Button asChild className="mt-4">
              <Link to="/nova-ordem">Abrir primeira ordem</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {ordens.map((o) => {
              const tipo = prazoTipo(o.data_entrega, o.status);
              const d = diasRestantes(o.data_entrega);
              const texto =
                tipo === "concluida"
                  ? formatarData(o.data_entrega)
                  : d < 0
                    ? `${Math.abs(d)} d em atraso`
                    : d === 0
                      ? "Entrega hoje"
                      : `${d} d restantes`;
              return (
                <li key={o.id}>
                  <Link
                    to="/ordens/$id"
                    params={{ id: o.id }}
                    className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-secondary/60 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="numeric w-20 shrink-0 text-sm font-semibold text-primary">
                      {o.numero}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{o.paciente}</div>
                      <div className="truncate text-sm text-muted-foreground">
                        {[o.item, isLab ? o.clinics?.nome : null].filter(Boolean).join(" · ") ||
                          "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PrazoBadge tipo={tipo} texto={texto} />
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
