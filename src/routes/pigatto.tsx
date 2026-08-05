import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/pigatto")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso do laboratório — LAB PIGATTO" },
      {
        name: "description",
        content: "Área restrita da equipe do laboratório LAB PIGATTO.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acesso do laboratório — LAB PIGATTO" },
      { property: "og:description", content: "Área restrita do LAB PIGATTO." },
    ],
  }),
  component: LoginPigatto,
});

function LoginPigatto() {
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Se já estiver autenticado como laboratório, segue direto para o painel.
  useEffect(() => {
    if (!loading && session && role === "laboratorio") {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, role, navigate]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error || !data.user) {
      setEnviando(false);
      toast.error("Não foi possível entrar", { description: "Verifique o e-mail e a senha." });
      return;
    }

    // Confirma que a conta pertence à equipe do laboratório.
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isLab = (roles ?? []).some((r) => r.role === "laboratorio");

    if (!isLab) {
      await supabase.auth.signOut();
      setEnviando(false);
      toast.error("Acesso restrito", {
        description: "Esta área é exclusiva da equipe do laboratório.",
      });
      return;
    }

    setEnviando(false);
    toast.success("Bem-vindo(a) à área do laboratório");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="size-11 shrink-0" />
          <div>
            <div className="font-display text-2xl font-bold text-sidebar-accent-foreground">
              LAB <span className="text-sidebar-primary">PIGATTO</span>
            </div>
            <div className="mt-2 text-xs tracking-[0.18em] text-sidebar-foreground/55 uppercase">
              Área interna do laboratório
            </div>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-3xl leading-tight text-sidebar-accent-foreground">
            Central de produção do laboratório.
          </h2>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Analise as ordens recebidas de todas as clínicas, acompanhe prazos e atualize o status de
            cada trabalho na bancada.
          </p>
        </div>
        <div className="numeric text-xs text-sidebar-foreground/45">
          Recebida → Em análise → Em produção → Em prova → Pronta → Entregue
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="/logo.svg" alt="" className="size-9 shrink-0" />
            <div>
              <div className="font-display text-xl font-bold">
                LAB <span className="text-primary">PIGATTO</span>
              </div>
              <div className="mt-1 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                Área interna
              </div>
            </div>
          </div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft/50 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="size-3.5" /> Acesso restrito
          </div>
          <h1 className="text-2xl font-semibold">Entrar no laboratório</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Área exclusiva da equipe interna do LAB PIGATTO.
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
                placeholder="equipe@labpigatto.com.br"
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
            É de uma clínica parceira?{" "}
            <a href="/login" className="text-primary hover:underline">
              Acesse por aqui
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
