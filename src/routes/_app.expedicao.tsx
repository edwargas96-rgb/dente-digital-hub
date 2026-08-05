import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { formatarData } from "@/lib/ordens";
import { useOrdens, type OS } from "@/components/gestao-shared";

export const Route = createFileRoute("/_app/expedicao")({
  head: () => ({
    meta: [
      { title: "Expedição — LAB PIGATTO" },
      { name: "description", content: "Entregas e trabalhos a expedir." },
    ],
  }),
  component: Expedicao,
});

function Bloco({ titulo, lista }: { titulo: string; lista: OS[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-sm font-semibold">
        {titulo} <span className="numeric text-muted-foreground">({lista.length})</span>
      </h3>
      {lista.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada por aqui.</p>
      ) : (
        <ul className="divide-y divide-border">
          {lista.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <span className="numeric font-semibold text-primary">{o.numero}</span> · {o.paciente}
                <div className="text-xs text-muted-foreground">{o.clinics?.nome}</div>
              </div>
              <span className="numeric text-xs text-muted-foreground">
                {o.entregue_em ? formatarData(o.entregue_em) : formatarData(o.data_entrega)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Expedicao() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  const { data: ordens = [] } = useOrdens();
  const aExpedir = ordens.filter((o) => o.lab_status === "Concluída");
  const entregues = ordens.filter((o) => o.lab_status === "Entregue");

  return (
    <AppLayout titulo="Expedição" descricao="Trabalhos prontos e entregas">
      <div className="grid gap-4 lg:grid-cols-2">
        <Bloco titulo="A expedir" lista={aExpedir} />
        <Bloco titulo="Entregues" lista={entregues} />
      </div>
    </AppLayout>
  );
}
