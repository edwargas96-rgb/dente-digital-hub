import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  CalendarDays,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navBase = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/nova-ordem", label: "Nova ordem", icon: FilePlus2 },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
] as const;

const navLab = [
  { to: "/clinicas", label: "Clínicas", icon: Building2 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppLayout({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  const { role, nomeCompleto, email, clinicNome, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [aberto, setAberto] = useState(false);

  const itens = role === "laboratorio" ? [...navBase, ...navLab] : navBase;

  const sair = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  const menu = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {itens.map((item) => {
        const ativo = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setAberto(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              ativo
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const marca = (
    <div className="px-5 py-6">
      <div className="font-display text-lg leading-none font-bold tracking-tight text-sidebar-accent-foreground">
        LAB <span className="text-sidebar-primary">PIGATTO</span>
      </div>
      <div className="mt-1.5 text-[11px] tracking-[0.14em] text-sidebar-foreground/55 uppercase">
        Prótese dentária
      </div>
    </div>
  );

  const rodape = (
    <div className="border-t border-sidebar-border px-4 py-4">
      <div className="truncate text-sm font-medium text-sidebar-accent-foreground">
        {nomeCompleto || email}
      </div>
      <div className="truncate text-xs text-sidebar-foreground/60">
        {role === "laboratorio" ? "Laboratório" : clinicNome || "Clínica"}
      </div>
      <button
        onClick={sair}
        className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      >
        <LogOut className="size-4" /> Sair
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar md:flex">
        {marca}
        {menu}
        {rodape}
      </aside>

      {aberto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setAberto(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar">
            <div className="flex items-start justify-between">
              {marca}
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="mt-6 mr-4 text-sidebar-foreground/70"
              >
                <X className="size-5" />
              </button>
            </div>
            {menu}
            {rodape}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <button
              className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
              onClick={() => setAberto(true)}
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold sm:text-2xl">{titulo}</h1>
              {descricao && (
                <p className="truncate text-sm text-muted-foreground">{descricao}</p>
              )}
            </div>
            {acao}
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
