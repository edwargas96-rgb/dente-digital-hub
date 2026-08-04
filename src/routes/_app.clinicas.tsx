import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { criarAcessoClinica } from "@/lib/clinicas.functions";

export const Route = createFileRoute("/_app/clinicas")({
  head: () => ({
    meta: [
      { title: "Clínicas parceiras — LAB PIGATTO" },
      { name: "description", content: "Cadastro das clínicas parceiras do laboratório." },
      { property: "og:title", content: "Clínicas parceiras — LAB PIGATTO" },
      { property: "og:description", content: "Gestão das clínicas atendidas pelo LAB PIGATTO." },
    ],
  }),
  component: Clinicas,
});

function Clinicas() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  const [novaAberta, setNovaAberta] = useState(false);
  const [acessoPara, setAcessoPara] = useState<{ id: string; nome: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereço] = useState("");

  const [emailAcesso, setEmailAcesso] = useState("");
  const [nomeAcesso, setNomeAcesso] = useState("");
  const [senhaAcesso, setSenhaAcesso] = useState("");

  const { data: clinicas = [], isLoading } = useQuery({
    queryKey: ["clinicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const criarClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase.from("clinics").insert({
      nome: nome.trim(),
      responsavel: responsavel.trim() || null,
      telefone: telefone.trim() || null,
      endereco: endereco.trim() || null,
    });
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível cadastrar a clínica.");
      return;
    }
    toast.success("Clínica cadastrada");
    setNome("");
    setResponsavel("");
    setTelefone("");
    setEndereço("");
    setNovaAberta(false);
    queryClient.invalidateQueries({ queryKey: ["clinicas"] });
  };

  const criarAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acessoPara) return;
    setSalvando(true);
    try {
      await criarAcessoClinica({
        data: {
          email: emailAcesso.trim(),
          senha: senhaAcesso,
          nome_completo: nomeAcesso.trim(),
          clinic_id: acessoPara.id,
        },
      });
      toast.success("Acesso criado", {
        description: `${emailAcesso.trim()} já pode entrar no portal.`,
      });
      setEmailAcesso("");
      setNomeAcesso("");
      setSenhaAcesso("");
      setAcessoPara(null);
    } catch (err) {
      toast.error("Não foi possível criar o acesso", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AppLayout
      titulo="Clínicas parceiras"
      descricao="Cadastro e acessos das clínicas"
      acao={
        <Button onClick={() => setNovaAberta(true)}>
          <Plus className="size-4" /> Nova clínica
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando…</p>
        ) : clinicas.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma clínica cadastrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {clinicas.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{c.nome}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {[c.responsavel, c.endereco, c.telefone].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAcessoPara({ id: c.id, nome: c.nome })}
                >
                  <UserPlus className="size-4" /> Criar acesso
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={novaAberta} onOpenChange={setNovaAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova clínica</DialogTitle>
            <DialogDescription>Cadastre uma clínica parceira do laboratório.</DialogDescription>
          </DialogHeader>
          <form onSubmit={criarClinica} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                required
                maxLength={120}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  maxLength={120}
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  maxLength={30}
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                maxLength={80}
                value={endereco}
                onChange={(e) => setEndereço(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando…" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!acessoPara} onOpenChange={(o) => !o && setAcessoPara(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar acesso</DialogTitle>
            <DialogDescription>
              Novo usuário vinculado a {acessoPara?.nome}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={criarAcesso} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-acesso">Nome completo *</Label>
              <Input
                id="nome-acesso"
                required
                maxLength={120}
                value={nomeAcesso}
                onChange={(e) => setNomeAcesso(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-acesso">E-mail *</Label>
              <Input
                id="email-acesso"
                type="email"
                required
                maxLength={255}
                value={emailAcesso}
                onChange={(e) => setEmailAcesso(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha-acesso">Senha provisória *</Label>
              <Input
                id="senha-acesso"
                type="text"
                required
                minLength={8}
                maxLength={72}
                value={senhaAcesso}
                onChange={(e) => setSenhaAcesso(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={salvando}>
                {salvando ? "Criando…" : "Criar acesso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
