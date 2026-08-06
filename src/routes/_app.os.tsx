import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatarData, formatarDataHora, diasRestantes } from "@/lib/ordens";
import {
  LAB_STATUS,
  type LabStatus,
  proximoStatus,
  URGENCIAS,
  LAB_TO_ORDER_STATUS,
} from "@/lib/gestao";
import {
  type OS,
  useOrdens,
  useTecnicos,
  useServicos,
  StatusSelo,
  Kpi,
  prazoChip,
  registrarEvento,
} from "@/components/gestao-shared";

export const Route = createFileRoute("/_app/os")({
  head: () => ({
    meta: [
      { title: "Ordens — LAB PIGATTO" },
      { name: "description", content: "Gestão das ordens de serviço do laboratório." },
    ],
  }),
  component: OrdensPage,
});

function OrdensPage() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && role && role !== "laboratorio") navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

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

  const recebidas = ordens.filter((o) => o.lab_status === "Recebida").length;
  const entregues = ordens.filter((o) => o.lab_status === "Entregue").length;
  const atrasadas = ordens.filter(
    (o) => o.lab_status === "Recebida" && diasRestantes(o.data_entrega) < 0,
  ).length;

  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const avancarLote = async () => {
    const alvos = ordens.filter((o) => sel.has(o.id));
    for (const o of alvos) {
      const prox = proximoStatus(o.lab_status);
      if (!prox) continue;
      await supabase
        .from("orders")
        .update({
          lab_status: prox,
          status: LAB_TO_ORDER_STATUS[prox] as never,
          entregue_em: new Date().toISOString(),
        })
        .eq("id", o.id);
      await registrarEvento(o.id, prox, "Marcada como entregue em lote");
    }
    toast.success("Marcadas como entregue");
    setSel(new Set());
    invalidate();
  };

  const atribuirLote = async () => {
    if (!tecnicoLote) return;
    await supabase.from("orders").update({ tecnico_id: tecnicoLote }).in("id", [...sel]);
    toast.success("Técnico atribuído");
    setSel(new Set());
    setTecnicoLote("");
    invalidate();
  };

  return (
    <AppLayout
      titulo="Ordens de serviço"
      descricao="Recebimento, produção e entrega das O.S."
      acao={
        <Button onClick={() => setNovaAberta(true)}>
          <Plus className="size-4" /> Nova O.S.
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Total" valor={String(ordens.length)} />
          <Kpi label="Recebidas" valor={String(recebidas)} hint="em andamento" />
          <Kpi label="Entregues" valor={String(entregues)} />
          <Kpi label="Atrasadas" valor={String(atrasadas)} />
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar O.S., paciente, clínica…"
            className="pl-8"
          />
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
              Marcar como entregue
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
                          <div className="text-xs text-muted-foreground">
                            {o.clinics?.nome ?? "—"}
                          </div>
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
      </div>

      {abrir && <DetalheOS os={abrir} onClose={() => setAbrir(null)} onChange={invalidate} />}
      {novaAberta && <NovaOS onClose={() => setNovaAberta(false)} onSaved={invalidate} />}
    </AppLayout>
  );
}

// ------------------------------------------------------------ Detalhe O.S.
function DetalheOS({ os, onClose, onChange }: { os: OS; onClose: () => void; onChange: () => void }) {
  const qc = useQueryClient();
  const { data: tecnicos = [] } = useTecnicos();
  const [tecnicoId, setTecnicoId] = useState(os.tecnico_id ?? "");
  const [resposta, setResposta] = useState(os.resposta_laboratorio ?? "");
  const [salvando, setSalvando] = useState(false);

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
    const patch: Record<string, unknown> = {
      lab_status: novo,
      status: LAB_TO_ORDER_STATUS[novo],
    };
    if (novo === "Entregue") patch.entregue_em = new Date().toISOString();
    await supabase.from("orders").update(patch).eq("id", os.id);
    await registrarEvento(os.id, novo, comentario);
    setSalvando(false);
    qc.invalidateQueries({ queryKey: ["os-eventos", os.id] });
    onChange();
    toast.success(`O.S. ${novo}`);
    onClose();
  };

  const salvarProducao = async () => {
    setSalvando(true);
    await supabase
      .from("orders")
      .update({
        tecnico_id: tecnicoId || null,
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
    await supabase.from("order_steps").insert({ order_id: os.id, nome, ordem: etapas.length });
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

  const acao =
    os.lab_status === "Recebida" ? (
      <Button
        size="sm"
        disabled={salvando}
        onClick={() => mudarStatus("Entregue", "Entregue ao dentista")}
      >
        Marcar como entregue
      </Button>
    ) : null;

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
      const { data } = await supabase
        .from("clinics")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
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
        elementos,
        cor: f.cor || null,
        convenio: f.convenio.trim() || null,
        urgencia: f.urgencia,
        laboratorio_destino: f.laboratorio_destino.trim() || null,
        data_entrega: f.data_entrega,
        observacoes: f.observacoes.trim() || null,
        lab_status: "Recebida",
        status: "Recebida",
      })
      .select("id")
      .single();
    if (error || !data) {
      setSalvando(false);
      toast.error("Não foi possível criar a O.S.", { description: error?.message });
      return;
    }
    await registrarEvento(data.id, "Recebida", "O.S. recebida");
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
            <Input
              value={f.laboratorio_destino}
              onChange={(e) => set("laboratorio_destino", e.target.value)}
              placeholder="Bancada / setor"
            />
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
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Dente (FDI)</Label>
              <Input
                value={f.dente}
                onChange={(e) => set("dente", e.target.value)}
                placeholder="11, 21"
                className="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <Input
                value={f.cor}
                onChange={(e) => set("cor", e.target.value)}
                placeholder="A2"
                className="numeric"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Prazo de entrega *</Label>
            <Input
              type="date"
              value={f.data_entrega}
              onChange={(e) => set("data_entrega", e.target.value)}
              className="numeric"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea
              rows={3}
              value={f.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
            />
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

