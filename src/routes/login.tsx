import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — LAB PIGATTO" },
      {
        name: "description",
        content: "Acesso das clínicas parceiras e da equipe do laboratório LAB PIGATTO.",
      },
      { property: "og:title", content: "Entrar — LAB PIGATTO" },
      { property: "og:description", content: "Portal de ordens de serviço do LAB PIGATTO." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setEnviando(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: "Verifique o e-mail e a senha." });
      return;
    }
    toast.success("Bem-vindo(a) ao LAB PIGATTO");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 lg:flex">
        <div>
          <div className="font-display text-2xl font-bold text-sidebar-accent-foreground">
            LAB <span className="text-sidebar-primary">PIGATTO</span>
          </div>
          <div className="mt-2 text-xs tracking-[0.18em] text-sidebar-foreground/55 uppercase">
            Laboratório de prótese dentária
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-3xl leading-tight text-sidebar-accent-foreground">
            Ordens de serviço com precisão clínica, do consultório à bancada.
          </h2>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Envie arquivos e fotos, marque os elementos no odontograma e acompanhe cada etapa da
            produção em tempo real.
          </p>
        </div>
        <div className="numeric text-xs text-sidebar-foreground/45">
          Recebida → Em análise → Em produção → Em prova → Pronta → Entregue
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="font-display text-xl font-bold">
              LAB <span className="text-primary">PIGATTO</span>
            </div>
            <div className="mt-1 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Prótese dentária
            </div>
          </div>

          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o e-mail e a senha fornecidos pelo laboratório.
          </p>

          <form onSubmit={entrar} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinica@exemplo.com.br"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Ainda não tem acesso? Solicite o cadastro da sua clínica ao LAB PIGATTO.
          </p>
        </div>
      </div>
    </div>
  );
}
