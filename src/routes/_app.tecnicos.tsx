import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTecnicos, type Tecnico } from "@/components/gestao-shared";

export const Route = createFileRoute("/_app/tecnicos")({
  head: () => ({
    meta: [
      { title: "Técnicos — LAB PIGATTO" },
      { name: "description", content: "Cadastro dos técnicos do laboratório." },
    ],
  }),
  component: Tecnicos,
});

function Tecnicos() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  const qc = useQueryClient();
  const { data: tecnicos = [] } = useTecnicos();
  const [nome, setNome] = useState("");
  const [esp, setEsp] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tecnicos"] });

  const add = async () => {
    if (!nome.trim()) return;
    await supabase.from("tecnicos").insert({ nome: nome.trim(), especialidade: esp.trim() || null });
    setNome("");
    setEsp("");
    invalidate();
  };
  const toggleAtivo = async (t: Tecnico) => {
    await supabase.from("tecnicos").update({ ativo: !t.ativo }).eq("id", t.id);
    invalidate();
  };

  return (
    <AppLayout titulo="Técnicos" descricao="Equipe de produção do laboratório">
      <div className="max-w-2xl space-y-4">
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex-1 space-y-1.5">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do técnico" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Especialidade</Label>
            <Input value={esp} onChange={(e) => setEsp(e.target.value)} placeholder="Cerâmica, CAD/CAM…" />
          </div>
          <Button onClick={add}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          {tecnicos.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Nenhum técnico.</div>
          ) : (
            <ul className="divide-y divide-border">
              {tecnicos.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">{t.nome}</div>
                    <div className="text-xs text-muted-foreground">{t.especialidade ?? "—"}</div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    {t.ativo ? "Ativo" : "Inativo"}
                    <Switch checked={t.ativo} onCheckedChange={() => toggleAtivo(t)} />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
