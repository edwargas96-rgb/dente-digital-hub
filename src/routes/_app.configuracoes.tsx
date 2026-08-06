import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — LAB PIGATTO" },
      { name: "description", content: "Catálogos de itens, materiais, implantes e cores." },
      { property: "og:title", content: "Configurações — LAB PIGATTO" },
      { property: "og:description", content: "Gerencie os catálogos do laboratório." },
    ],
  }),
  component: Configuracoes,
});

type Tabela = "item_types" | "materials" | "implant_systems" | "scanbodies" | "tooth_shades";

const CATALOGOS: { tabela: Tabela; titulo: string; placeholder: string }[] = [
  { tabela: "item_types", titulo: "Tipos de trabalho", placeholder: "Ex.: Coroa unitária" },
  { tabela: "materials", titulo: "Materiais", placeholder: "Ex.: Zircônia translúcida" },
  { tabela: "implant_systems", titulo: "Sistemas de implante", placeholder: "Ex.: Neodent GM" },
  { tabela: "scanbodies", titulo: "Scanbodies", placeholder: "Ex.: Neodent GM Scanbody" },
  { tabela: "tooth_shades", titulo: "Cores (VITA)", placeholder: "Ex.: A2" },
];

function CatalogoCard({
  tabela,
  titulo,
  placeholder,
}: {
  tabela: Tabela;
  titulo: string;
  placeholder: string;
}) {
  const queryClient = useQueryClient();
  const [novo, setNovo] = useState("");

  const { data: itens = [] } = useQuery({
    queryKey: ["catalogo-admin", tabela],
    queryFn: async () => {
      const { data, error } = await supabase.from(tabela).select("id, nome, ativo").order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const recarregar = () => {
    queryClient.invalidateQueries({ queryKey: ["catalogo-admin", tabela] });
    queryClient.invalidateQueries({ queryKey: ["catalogo", tabela] });
  };

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novo.trim()) return;
    const { error } = await supabase.from(tabela).insert({ nome: novo.trim() });
    if (error) {
      toast.error("Não foi possível adicionar o item.");
      return;
    }
    setNovo("");
    recarregar();
  };

  const alternar = async (id: string, ativo: boolean) => {
    const { error } = await supabase.from(tabela).update({ ativo: !ativo }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o item.");
      return;
    }
    recarregar();
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-3 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {titulo}
      </h2>
      <form onSubmit={adicionar} className="mb-3 flex gap-2">
        <Input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder={placeholder} />
        <Button type="submit" size="icon" aria-label={`Adicionar em ${titulo}`}>
          <Plus className="size-4" />
        </Button>
      </form>
      <ul className="space-y-1.5">
        {itens.map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between rounded-md bg-secondary px-3 py-1.5 text-sm"
          >
            <span className={i.ativo ? "" : "text-muted-foreground line-through"}>{i.nome}</span>
            <button
              type="button"
              aria-label={`${i.ativo ? "Desativar" : "Reativar"} ${i.nome}`}
              onClick={() => alternar(i.id, i.ativo)}
              className="text-muted-foreground hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {itens.length === 0 && <li className="text-sm text-muted-foreground">Nenhum item.</li>}
      </ul>
    </section>
  );
}

function Configuracoes() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  return (
    <AppLayout titulo="Configurações" descricao="Catálogos usados no formulário de ordens">
      <div className="grid gap-5 lg:grid-cols-2">
        {CATALOGOS.map((c) => (
          <CatalogoCard key={c.tabela} {...c} />
        ))}
      </div>
    </AppLayout>
  );
}
