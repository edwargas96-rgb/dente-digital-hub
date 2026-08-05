import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  ClipboardList,
  Truck,
  BarChart3,
  Wallet,
  Users,
  CalendarDays,
  Settings,
  Lock,
  Search,
  Plus,
  Printer,
  Loader2,
  X,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatarData, formatarDataHora, diasRestantes, hojeISO } from "@/lib/ordens";
import {
  LAB_STATUS,
  LAB_STATUS_STYLE,
  type LabStatus,
  proximoStatus,
  rotuloAvanco,
  formatarMoeda,
  URGENCIAS,
  ultimosMeses,
} from "@/lib/gestao";

export const Route = createFileRoute("/_app/gestao")({
  head: () => ({
    meta: [
      { title: "Gestão do laboratório — LAB PIGATTO" },
      { name: "description", content: "Painel de gestão de ordens de serviço do laboratório." },
    ],
  }),
  component: Gestao,
});

// ------------------------------------------------------------------ tipos
type OS = {
  id: string;
  numero: string;
  paciente: string;
  dentista: string | null;
  item: string | null;
  elementos: number[];
  cor: string | null;
  data_entrega: string;
  observacoes: string | null;
  created_at: string;
  lab_status: LabStatus;
  urgencia: string | null;
  convenio: string | null;
  tecnico_id: string | null;
  valor: number | null;
  resposta_laboratorio: string | null;
  laboratorio_destino: string | null;
  entregue_em: string | null;
  clinic_id: string;
  clinics: { nome: string } | null;
  tecnicos: { nome: string } | null;
};

type Tecnico = { id: string; nome: string; especialidade: string | null; ativo: boolean };
type Servico = { id: string; nome: string; valor: number; ativo: boolean };

// ------------------------------------------------------------------ hooks
function useLabSettings() {
  return useQuery({
    queryKey: ["lab_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("lab_settings").select("plano").maybeSingle();
      return (data?.plano ?? "essencial") as "essencial" | "profissional";
    },
  });
}

function useOrdens() {
  return useQuery({
    queryKey: ["gestao-ordens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, numero, paciente, dentista, item, elementos, cor, data_entrega, observacoes, created_at, lab_status, urgencia, convenio, tecnico_id, valor, resposta_laboratorio, laboratorio_destino, entregue_em, clinic_id, clinics(nome), tecnicos(nome)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OS[];
    },
  });
}

function useTecnicos() {
  return useQuery({
    queryKey: ["tecnicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("id, nome, especialidade, ativo")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Tecnico[];
    },
  });
}

function useServicos() {
  return useQuery({
    queryKey: ["servicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select("id, nome, valor, ativo")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Servico[];
    },
  });
}

// ------------------------------------------------------------------ UI base
function StatusSelo({ status }: { status: LabStatus }) {
  return (
    <span
      className={cn(
        "numeric inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        LAB_STATUS_STYLE[status],
      )}
    >
      {status}
    </span>
  );
}

function Kpi({ label, valor, hint }: { label: string; valor: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="numeric mt-2 text-2xl font-semibold">{valor}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function prazoChip(o: OS): { texto: string; cls: string } {
  if (o.lab_status === "Entregue") return { texto: "Entregue", cls: "text-muted-foreground" };
  const d = diasRestantes(o.data_entrega);
  if (d < 0) return { texto: `${Math.abs(d)}d atrasado`, cls: "text-danger font-semibold" };
  if (d === 0) return { texto: "HOJE", cls: "text-danger font-semibold" };
  if (d === 1) return { texto: "Amanhã", cls: "text-warning-foreground font-medium" };
  return { texto: `${d}d`, cls: "text-muted-foreground" };
}

// ============================================================ TABS
const TABS = [
  { id: "visao", label: "Visão Geral", icon: LayoutGrid, pro: false },
  { id: "ordens", label: "Ordens", icon: ClipboardList, pro: false },
  { id: "expedicao", label: "Expedição", icon: Truck, pro: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, pro: true },
  { id: "financeiro", label: "Financeiro", icon: Wallet, pro: true },
  { id: "tecnicos", label: "Técnicos", icon: Users, pro: false },
  { id: "calendario", label: "Calendário", icon: CalendarDays, pro: true },
  { id: "config", label: "Configurações", icon: Settings, pro: false },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Gestao() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("ordens");
  const { data: plano = "essencial" } = useLabSettings();

  useEffect(() => {
    if (!loading && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  if (role !== "laboratorio") return null;

  const isPro = plano === "profissional";
  const tabAtual = TABS.find((t) => t.id === tab)!;
  const bloqueada = tabAtual.pro && !isPro;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="font-display text-lg font-bold tracking-tight">
              LAB <span className="text-primary">PIGATTO</span>
              <span className="ml-2 text-sm font-normal text-muted-foreground">· Gestão</span>
            </div>
            <Link
              to="/dashboard"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              ← Painel
            </Link>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              isPro
                ? "border-primary/30 bg-primary-soft/50 text-primary"
                : "border-border bg-secondary text-muted-foreground",
            )}
          >
            Plano {isPro ? "Profissional" : "Essencial"}
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 sm:px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
              {t.pro && !isPro && <Lock className="size-3 opacity-70" />}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {bloqueada ? (
          <BloqueioPlano label={tabAtual.label} />
        ) : (
          <>
            {tab === "visao" && <VisaoGeral />}
            {tab === "ordens" && <Ordens />}
            {tab === "expedicao" && <Expedicao />}
            {tab === "analytics" && <Analytics />}
            {tab === "financeiro" && <Financeiro />}
            {tab === "tecnicos" && <Tecnicos />}
            {tab === "calendario" && <CalendarioTab />}
            {tab === "config" && <Configuracoes />}
          </>
        )}
      </main>
    </div>
  );
}

function BloqueioPlano({ label }: { label: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <Lock className="size-8 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">{label} é do plano Profissional</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Faça upgrade para desbloquear expedição, analytics, financeiro e calendário.
      </p>
      <Button className="mt-5">Fazer upgrade</Button>
    </div>
  );
}

// ============================================================ VISÃO GERAL
function VisaoGeral() {
  const { data: ordens = [] } = useOrdens();
  const meses = ultimosMeses(6);

  const receitaPorMes = meses.map((m) => {
    const total = ordens
      .filter((o) => (o.entregue_em ?? o.created_at).slice(0, 7) === m.chave && o.valor)
      .reduce((s, o) => s + (o.valor ?? 0), 0);
    return { mes: m.rotulo, receita: total };
  });

  const faturamentoMes = receitaPorMes[receitaPorMes.length - 1]?.receita ?? 0;
  const emProducao = ordens.filter((o) => o.lab_status === "Em Produção").length;
  const concluidas = ordens.filter((o) =>
    ["Concluída", "Entregue"].includes(o.lab_status),
  ).length;
  const pendentes = ordens.filter((o) => o.lab_status === "Pendente").length;

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
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
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
  );
}

// ============================================================ ORDENS (núcleo)
function Ordens() {
  const qc = useQueryClient();
  const { data: ordens = [], isLoading } = useOrdens();
  const { data: tecnicos = [] } = useTecnicos();

  const [filtro, setFiltro] = useState<LabStatus | "Todas">("Todas");
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [abrir, setAbrir] = useState<OS | null>(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const [tecnicoLote, setTecnicoLote] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["gestao-ordens"] });

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return ordens.filter((o) => {
      if (filtro !== "Todas" && o.lab_status !== filtro) return false;
      if (!q) return true;
      return [o.numero, o.paciente, o.clinics?.nome, o.item]
        .filter(Boolean)
        .some((t) => String(t).toLowerCase().includes(q));
    });
  }, [ordens, filtro, busca]);

  const sla = (() => {
    const entregues = ordens.filter((o) => o.lab_status === "Entregue");
    if (entregues.length === 0) return "—";
    const noPrazo = entregues.filter(
      (o) => !o.entregue_em || o.entregue_em.slice(0, 10) <= o.data_entrega.slice(0, 10),
    ).length;
    return `${Math.round((noPrazo / entregues.length) * 100)}%`;
  })();
  const gargalo = (() => {
    const cont = new Map<LabStatus, number>();
    for (const o of ordens)
      if (!["Entregue", "Recusada"].includes(o.lab_status))
        cont.set(o.lab_status, (cont.get(o.lab_status) ?? 0) + 1);
    const top = [...cont.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "—";
  })();
  const emProducao = ordens.filter((o) => o.lab_status === "Em Produção").length;
  const concluidas = ordens.filter((o) => o.lab_status === "Concluída").length;

  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const avancarLote = async () => {
    const alvos = ordens.filter((o) => sel.has(o.id));
    for (const o of alvos) {
      const prox = proximoStatus(o.lab_status);
      if (!prox) continue;
      if (prox === "Concluída" && !o.tecnico_id) continue;
      await supabase.from("orders").update({ lab_status: prox }).eq("id", o.id);
      await registrarEvento(o.id, prox, "Avanço em lote");
    }
    toast.success("Status avançado");
    setSel(new Set());
    invalidate();
  };

  const atribuirLote = async () => {
    if (!tecnicoLote) return;
    const ids = [...sel];
    await supabase.from("orders").update({ tecnico_id: tecnicoLote }).in("id", ids);
    toast.success("Técnico atribuído");
    setSel(new Set());
    setTecnicoLote("");
    invalidate();
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="SLA de entrega" valor={sla} hint="entregues no prazo" />
        <Kpi label="Gargalo atual" valor={String(gargalo)} />
        <Kpi label="Em produção" valor={String(emProducao)} />
        <Kpi label="Concluídas" valor={String(concluidas)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar O.S., paciente, clínica…"
            className="w-64 pl-8"
          />
        </div>
        <Button onClick={() => setNovaAberta(true)}>
          <Plus className="size-4" /> Nova O.S.
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["Todas", ...LAB_STATUS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filtro === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {sel.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft/40 px-4 py-3">
          <span className="numeric text-sm font-medium">{sel.size} selecionada(s)</span>
          <Button size="sm" variant="secondary" onClick={avancarLote}>
            Avançar status
          </Button>
          <div className="flex items-center gap-2">
            <Select value={tecnicoLote} onValueChange={setTecnicoLote}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Atribuir técnico" />
              </SelectTrigger>
              <SelectContent>
                {tecnicos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="secondary" onClick={atribuirLote} disabled={!tecnicoLote}>
              Aplicar
            </Button>
          </div>
          <button
            onClick={() => setSel(new Set())}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Limpar
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : lista.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma O.S.</div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="w-8 px-3 py-3"></th>
                <th className="px-3 py-3">Nº</th>
                <th className="px-3 py-3">Paciente / Clínica</th>
                <th className="px-3 py-3">Trabalho</th>
                <th className="px-3 py-3">Técnico</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((o) => {
                const p = prazoChip(o);
                return (
                  <tr key={o.id} className="hover:bg-secondary/50">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={sel.has(o.id)}
                        onChange={() => toggle(o.id)}
                        aria-label={`Selecionar ${o.numero}`}
                      />
                    </td>
                    <td className="numeric px-3 py-3 font-semibold text-primary">
                      <button onClick={() => setAbrir(o)}>{o.numero}</button>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => setAbrir(o)} className="text-left">
                        <div className="font-medium">{o.paciente}</div>
                        <div className="text-xs text-muted-foreground">{o.clinics?.nome ?? "—"}</div>
                      </button>
                    </td>
                    <td className="px-3 py-3">{o.item ?? "—"}</td>
                    <td className="px-3 py-3">{o.tecnicos?.nome ?? "—"}</td>
                    <td className="px-3 py-3">
                      <StatusSelo status={o.lab_status} />
                    </td>
                    <td className={cn("numeric px-3 py-3", p.cls)}>{p.texto}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {abrir && <DetalheOS os={abrir} onClose={() => setAbrir(null)} onChange={invalidate} />}
      {novaAberta && <NovaOS onClose={() => setNovaAberta(false)} onSaved={invalidate} />}
    </div>
  );
}

async function registrarEvento(orderId: string, status: string | null, comentario: string) {
  await supabase.from("order_events").insert({
    order_id: orderId,
    status: status as never,
    comentario,
    autor: "Laboratório",
  });
}

// ------------------------------------------------------------ Detalhe O.S.
function DetalheOS({ os, onClose, onChange }: { os: OS; onClose: () => void; onChange: () => void }) {
  const qc = useQueryClient();
  const { data: tecnicos = [] } = useTecnicos();
  const [tecnicoId, setTecnicoId] = useState(os.tecnico_id ?? "");
  const [valor, setValor] = useState(os.valor != null ? String(os.valor) : "");
  const [resposta, setResposta] = useState(os.resposta_laboratorio ?? "");
  const [salvando, setSalvando] = useState(false);
  const [entregaAberta, setEntregaAberta] = useState(false);

  const { data: eventos = [] } = useQuery({
    queryKey: ["os-eventos", os.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_events")
        .select("*")
        .eq("order_id", os.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: etapas = [] } = useQuery({
    queryKey: ["os-etapas", os.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_steps")
        .select("*")
        .eq("order_id", os.id)
        .order("ordem");
      return (data ?? []) as { id: string; nome: string; concluida: boolean; ordem: number }[];
    },
  });

  const progresso = etapas.length
    ? Math.round((etapas.filter((e) => e.concluida).length / etapas.length) * 100)
    : 0;

  const mudarStatus = async (novo: LabStatus, comentario: string) => {
    setSalvando(true);
    const patch: Record<string, unknown> = { lab_status: novo };
    if (novo === "Entregue") patch.entregue_em = new Date().toISOString();
    await supabase.from("orders").update(patch).eq("id", os.id);
    await registrarEvento(os.id, novo, comentario);
    setSalvando(false);
    qc.invalidateQueries({ queryKey: ["os-eventos", os.id] });
    onChange();
    toast.success(`O.S. ${novo}`);
    if (novo !== "Entregue") onClose();
  };

  const salvarProducao = async () => {
    setSalvando(true);
    await supabase
      .from("orders")
      .update({
        tecnico_id: tecnicoId || null,
        valor: valor ? Number(valor) : null,
        resposta_laboratorio: resposta.trim() || null,
      })
      .eq("id", os.id);
    setSalvando(false);
    onChange();
    toast.success("Produção salva");
  };

  const toggleEtapa = async (id: string, concluida: boolean) => {
    await supabase.from("order_steps").update({ concluida: !concluida }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["os-etapas", os.id] });
  };

  const addEtapa = async () => {
    const nome = window.prompt("Nome da etapa (ex.: Enceramento, Prova, Acabamento)");
    if (!nome) return;
    await supabase
      .from("order_steps")
      .insert({ order_id: os.id, nome, ordem: etapas.length });
    qc.invalidateQueries({ queryKey: ["os-etapas", os.id] });
  };

  const imprimirFicha = () => {
    const w = window.open("", "_blank", "width=780,height=900");
    if (!w) return;
    w.document.write(fichaHtml(os, tecnicos.find((t) => t.id === tecnicoId)?.nome));
    w.document.close();
    w.focus();
    w.print();
  };

  const acao = (() => {
    switch (os.lab_status) {
      case "Pendente":
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => mudarStatus("Aceita", "O.S. aceita")}>
              <Check className="size-4" /> Aceitar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => mudarStatus("Recusada", "O.S. recusada")}
            >
              <X className="size-4" /> Recusar
            </Button>
          </div>
        );
      case "Aceita":
        return (
          <Button size="sm" onClick={() => mudarStatus("Em Produção", "Produção iniciada")}>
            Iniciar produção
          </Button>
        );
      case "Em Produção":
        return (
          <Button
            size="sm"
            disabled={!tecnicoId}
            title={!tecnicoId ? "Atribua um técnico antes de concluir" : undefined}
            onClick={() => mudarStatus("Concluída", "Produção concluída")}
          >
            Concluir O.S.
          </Button>
        );
      case "Concluída":
        return (
          <Button size="sm" onClick={() => setEntregaAberta(true)}>
            Marcar como entregue
          </Button>
        );
      default:
        return null;
    }
  })();

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="flex items-center gap-2">
              <span className="numeric text-primary">{os.numero}</span>
              <StatusSelo status={os.lab_status} />
            </DialogTitle>
            <Button size="sm" variant="outline" onClick={imprimirFicha}>
              <Printer className="size-4" /> Ficha
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/60 p-3">
          <div>
            <div className="font-medium">{os.paciente}</div>
            <div className="text-xs text-muted-foreground">
              {os.clinics?.nome} · {os.item ?? "—"} · Entrega {formatarData(os.data_entrega)}
            </div>
          </div>
          {acao}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Produção</h3>
            <div className="space-y-1.5">
              <Label>Técnico responsável</Label>
              <Select value={tecnicoId} onValueChange={setTecnicoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor do trabalho (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Resposta / observação ao dentista</Label>
              <Textarea
                rows={3}
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Texto que a clínica visualiza"
              />
            </div>
            <Button size="sm" onClick={salvarProducao} disabled={salvando}>
              {salvando && <Loader2 className="size-4 animate-spin" />} Salvar produção
            </Button>

            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                  Etapas de produção
                </h3>
                <button onClick={addEtapa} className="text-xs text-primary hover:underline">
                  + etapa
                </button>
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-primary" style={{ width: `${progresso}%` }} />
              </div>
              {etapas.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma etapa. Adicione acima.</p>
              ) : (
                <ul className="space-y-1.5">
                  {etapas.map((e) => (
                    <li key={e.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={e.concluida}
                        onChange={() => toggleEtapa(e.id, e.concluida)}
                      />
                      <span className={cn(e.concluida && "text-muted-foreground line-through")}>
                        {e.nome}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Linha do tempo</h3>
            {eventos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem movimentações.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-border pl-4">
                {eventos.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span className="absolute top-1.5 -left-[1.15rem] size-2 rounded-full bg-primary ring-4 ring-card" />
                    <div className="text-sm font-medium">{ev.status ?? "Atualização"}</div>
                    <div className="numeric text-xs text-muted-foreground">
                      {formatarDataHora(ev.created_at)}
                    </div>
                    {ev.comentario && <p className="text-sm">{ev.comentario}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {entregaAberta && (
          <ModalEntrega
            os={os}
            onClose={() => setEntregaAberta(false)}
            onEntregar={async (imprimir) => {
              if (imprimir) imprimirComprovante(os);
              await mudarStatus("Entregue", "Entregue ao dentista");
              setEntregaAberta(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ModalEntrega({
  os,
  onClose,
  onEntregar,
}: {
  os: OS;
  onClose: () => void;
  onEntregar: (imprimir: boolean) => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Entregar {os.numero}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Deseja imprimir o comprovante de entrega?
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={() => onEntregar(true)}>
            <Printer className="size-4" /> Imprimir e entregar
          </Button>
          <Button variant="outline" onClick={() => onEntregar(false)}>
            Entregar sem imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------ Nova O.S.
function NovaOS({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { userId } = useAuth();
  const { data: servicos = [] } = useServicos();
  const { data: clinicas = [] } = useQuery({
    queryKey: ["gestao-clinicas"],
    queryFn: async () => {
      const { data } = await supabase.from("clinics").select("id, nome").eq("ativo", true).order("nome");
      return (data ?? []) as { id: string; nome: string }[];
    },
  });

  const [f, setF] = useState({
    paciente: "",
    clinic_id: "",
    dentista: "",
    convenio: "",
    urgencia: "Normal",
    servico: "",
    dente: "",
    cor: "",
    data_entrega: "",
    observacoes: "",
    laboratorio_destino: "",
  });
  const [salvando, setSalvando] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const enviar = async () => {
    if (!f.paciente.trim() || !f.clinic_id || !f.data_entrega) {
      toast.error("Preencha paciente, clínica e prazo.");
      return;
    }
    setSalvando(true);
    const servico = servicos.find((s) => s.id === f.servico);
    const elementos = f.dente
      .split(/[,\s]+/)
      .map((n) => parseInt(n, 10))
      .filter((n) => !isNaN(n));
    const { data, error } = await supabase
      .from("orders")
      .insert({
        clinic_id: f.clinic_id,
        created_by: userId!,
        paciente: f.paciente.trim(),
        dentista: f.dentista.trim() || null,
        item: servico?.nome ?? null,
        valor: servico?.valor ?? null,
        elementos,
        cor: f.cor || null,
        convenio: f.convenio.trim() || null,
        urgencia: f.urgencia,
        laboratorio_destino: f.laboratorio_destino.trim() || null,
        data_entrega: f.data_entrega,
        observacoes: f.observacoes.trim() || null,
        lab_status: "Pendente",
      })
      .select("id")
      .single();
    if (error || !data) {
      setSalvando(false);
      toast.error("Não foi possível criar a O.S.", { description: error?.message });
      return;
    }
    await registrarEvento(data.id, "Pendente", "O.S. criada pelo laboratório");
    setSalvando(false);
    toast.success("O.S. criada");
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova O.S.</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Urgência</Label>
            <Select value={f.urgencia} onValueChange={(v) => set("urgencia", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {URGENCIAS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Laboratório de destino</Label>
            <Input value={f.laboratorio_destino} onChange={(e) => set("laboratorio_destino", e.target.value)} placeholder="Bancada / setor" />
          </div>
          <div className="space-y-1.5">
            <Label>Paciente *</Label>
            <Input value={f.paciente} onChange={(e) => set("paciente", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Clínica *</Label>
            <Select value={f.clinic_id} onValueChange={(v) => set("clinic_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {clinicas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Dentista</Label>
            <Input value={f.dentista} onChange={(e) => set("dentista", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Convênio</Label>
            <Input value={f.convenio} onChange={(e) => set("convenio", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Serviço</Label>
            <Select value={f.servico} onValueChange={(v) => set("servico", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tabela de valores" />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome} — {formatarMoeda(s.valor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Dente (FDI)</Label>
              <Input value={f.dente} onChange={(e) => set("dente", e.target.value)} placeholder="11, 21" className="numeric" />
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <Input value={f.cor} onChange={(e) => set("cor", e.target.value)} placeholder="A2" className="numeric" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Prazo de entrega *</Label>
            <Input type="date" value={f.data_entrega} onChange={(e) => set("data_entrega", e.target.value)} className="numeric" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea rows={3} value={f.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={enviar} disabled={salvando}>
            {salvando && <Loader2 className="size-4 animate-spin" />} Criar O.S.
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------ impressão
function fichaBase(titulo: string, os: OS, linhas: string[]): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo} ${os.numero}</title>
  <style>body{font-family:system-ui,Arial,sans-serif;color:#16232B;padding:32px;max-width:640px;margin:auto}
  h1{font-size:20px;margin:0}.sub{color:#5C6B73;font-size:12px;margin-top:2px}
  .box{border:1px solid #d5dde0;border-radius:10px;padding:16px;margin-top:16px}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eef1f3;font-size:14px}
  .row b{color:#5C6B73;font-weight:500}.tit{color:#0D6E6C;font-weight:700}.foot{margin-top:28px;font-size:12px;color:#5C6B73}</style>
  </head><body>
  <h1>LAB <span style="color:#0D6E6C">PIGATTO</span></h1><div class="sub">${titulo}</div>
  <div class="box"><div class="row"><b>O.S.</b><span class="tit">${os.numero}</span></div>
  ${linhas.map((l) => `<div class="row">${l}</div>`).join("")}</div>
  <div class="foot">Emitido em ${new Date().toLocaleString("pt-BR")}</div>
  </body></html>`;
}

function fichaHtml(os: OS, tecnico?: string): string {
  return fichaBase("Ficha de Ordem de Serviço", os, [
    `<b>Paciente</b><span>${os.paciente}</span>`,
    `<b>Clínica</b><span>${os.clinics?.nome ?? "—"}</span>`,
    `<b>Dentista</b><span>${os.dentista ?? "—"}</span>`,
    `<b>Trabalho</b><span>${os.item ?? "—"}</span>`,
    `<b>Elementos</b><span>${(os.elementos ?? []).join(", ") || "—"}</span>`,
    `<b>Cor</b><span>${os.cor ?? "—"}</span>`,
    `<b>Técnico</b><span>${tecnico ?? "—"}</span>`,
    `<b>Entrega</b><span>${formatarData(os.data_entrega)}</span>`,
    `<b>Observações</b><span>${os.observacoes ?? "—"}</span>`,
  ]);
}

function imprimirComprovante(os: OS) {
  const w = window.open("", "_blank", "width=780,height=900");
  if (!w) return;
  w.document.write(
    fichaBase("Comprovante de Entrega", os, [
      `<b>Paciente</b><span>${os.paciente}</span>`,
      `<b>Clínica</b><span>${os.clinics?.nome ?? "—"}</span>`,
      `<b>Trabalho</b><span>${os.item ?? "—"}</span>`,
      `<b>Valor</b><span>${formatarMoeda(os.valor)}</span>`,
      `<b>Entregue em</b><span>${new Date().toLocaleDateString("pt-BR")}</span>`,
      `<b>Recebido por</b><span>__________________________</span>`,
    ]),
  );
  w.document.close();
  w.focus();
  w.print();
}

// ============================================================ EXPEDIÇÃO
function Expedicao() {
  const { data: ordens = [] } = useOrdens();
  const aExpedir = ordens.filter((o) => o.lab_status === "Concluída");
  const entregues = ordens.filter((o) => o.lab_status === "Entregue");

  const Bloco = ({ titulo, lista }: { titulo: string; lista: OS[] }) => (
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

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Bloco titulo="A expedir" lista={aExpedir} />
      <Bloco titulo="Entregues" lista={entregues} />
    </div>
  );
}

// ============================================================ ANALYTICS
function Analytics() {
  const { data: ordens = [] } = useOrdens();
  const meses = ultimosMeses(6);
  const trend = meses.map((m) => ({
    mes: m.rotulo,
    os: ordens.filter((o) => o.created_at.slice(0, 7) === m.chave).length,
    receita: ordens
      .filter((o) => (o.entregue_em ?? o.created_at).slice(0, 7) === m.chave)
      .reduce((s, o) => s + (o.valor ?? 0), 0),
  }));

  const porStatus = LAB_STATUS.map((s) => ({
    status: s,
    qtd: ordens.filter((o) => o.lab_status === s).length,
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <h3 className="mb-4 text-sm font-semibold">Tendência de receita</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
              <RTooltip formatter={(v: number) => formatarMoeda(v)} />
              <Line type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {porStatus.map((s) => (
          <div key={s.status} className="rounded-xl border border-border bg-card p-4 text-center shadow-[var(--shadow-card)]">
            <div className="numeric text-2xl font-semibold">{s.qtd}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================ FINANCEIRO
function Financeiro() {
  const { data: ordens = [] } = useOrdens();
  const faturado = ordens
    .filter((o) => o.lab_status === "Entregue")
    .reduce((s, o) => s + (o.valor ?? 0), 0);
  const aReceber = ordens
    .filter((o) => ["Concluída", "Em Produção", "Aceita"].includes(o.lab_status))
    .reduce((s, o) => s + (o.valor ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi label="Faturado (entregue)" valor={formatarMoeda(faturado)} />
        <Kpi label="A receber" valor={formatarMoeda(aReceber)} />
        <Kpi label="Ticket médio" valor={formatarMoeda(ordens.length ? (faturado + aReceber) / ordens.filter((o) => o.valor).length || 0 : 0)} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-3">Nº</th>
              <th className="px-3 py-3">Clínica</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ordens
              .filter((o) => o.valor)
              .map((o) => (
                <tr key={o.id}>
                  <td className="numeric px-3 py-2.5 font-semibold text-primary">{o.numero}</td>
                  <td className="px-3 py-2.5">{o.clinics?.nome ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <StatusSelo status={o.lab_status} />
                  </td>
                  <td className="numeric px-3 py-2.5 text-right">{formatarMoeda(o.valor)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================ TÉCNICOS
function Tecnicos() {
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
      </div>
    </div>
  );
}

// ============================================================ CALENDÁRIO
function CalendarioTab() {
  const { data: ordens = [] } = useOrdens();
  const [ref] = useState(() => new Date());
  const ano = ref.getFullYear();
  const mes = ref.getMonth();
  const primeiro = new Date(ano, mes, 1);
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const offset = primeiro.getDay();
  const celulas: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  const porDia = (dia: number) => {
    const iso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return ordens.filter((o) => o.data_entrega.slice(0, 10) === iso);
  };
  const hoje = hojeISO();

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="mb-4 text-sm font-semibold capitalize">
        {primeiro.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={`e${i}`} />;
          const iso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const list = porDia(dia);
          const atrasado = list.some((o) => o.lab_status !== "Entregue" && iso < hoje);
          return (
            <div
              key={dia}
              className={cn(
                "min-h-16 rounded-lg border border-border p-1 text-left",
                iso === hoje && "ring-2 ring-primary",
              )}
            >
              <div className="numeric text-xs font-medium">{dia}</div>
              {list.slice(0, 2).map((o) => (
                <div
                  key={o.id}
                  className={cn(
                    "mt-0.5 truncate rounded px-1 text-[10px]",
                    atrasado ? "bg-danger/15 text-danger" : "bg-primary-soft/60 text-primary",
                  )}
                >
                  {o.numero}
                </div>
              ))}
              {list.length > 2 && (
                <div className="numeric text-[10px] text-muted-foreground">+{list.length - 2}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================ CONFIGURAÇÕES
function Configuracoes() {
  const qc = useQueryClient();
  const { data: servicos = [] } = useServicos();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["servicos"] });

  const add = async () => {
    if (!nome.trim()) return;
    await supabase.from("servicos").insert({ nome: nome.trim(), valor: Number(valor) || 0 });
    setNome("");
    setValor("");
    invalidate();
  };
  const salvarValor = async (id: string, novo: string) => {
    await supabase.from("servicos").update({ valor: Number(novo) || 0 }).eq("id", id);
    invalidate();
  };
  const toggleAtivo = async (s: Servico) => {
    await supabase.from("servicos").update({ ativo: !s.ativo }).eq("id", s.id);
    invalidate();
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h3 className="text-sm font-semibold">Tabela de valores</h3>
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex-1 space-y-1.5">
          <Label>Serviço</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do serviço" />
        </div>
        <div className="w-32 space-y-1.5">
          <Label>Valor (R$)</Label>
          <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className="numeric" />
        </div>
        <Button onClick={add}>
          <Plus className="size-4" /> Adicionar
        </Button>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <ul className="divide-y divide-border">
          {servicos.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 font-medium">{s.nome}</div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={s.valor}
                  onBlur={(e) => salvarValor(s.id, e.target.value)}
                  className="numeric h-8 w-24"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {s.ativo ? "Ativo" : "Inativo"}
                <Switch checked={s.ativo} onCheckedChange={() => toggleAtivo(s)} />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
