// Peças compartilhadas entre as telas de gestão do laboratório
// (Ordens, Financeiro, Técnicos), agora expostas na barra lateral.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { diasRestantes } from "@/lib/ordens";
import { LAB_STATUS_STYLE, type LabStatus } from "@/lib/gestao";

export type OS = {
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

export type Tecnico = { id: string; nome: string; especialidade: string | null; ativo: boolean };
export type Servico = { id: string; nome: string; valor: number; ativo: boolean };

export function useOrdens() {
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

export function useTecnicos() {
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

export function useServicos() {
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

export function StatusSelo({ status }: { status: LabStatus }) {
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

export function Kpi({ label, valor, hint }: { label: string; valor: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="numeric mt-2 text-2xl font-semibold">{valor}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function prazoChip(o: OS): { texto: string; cls: string } {
  if (o.lab_status === "Entregue") return { texto: "Entregue", cls: "text-muted-foreground" };
  const d = diasRestantes(o.data_entrega);
  if (d < 0) return { texto: `${Math.abs(d)}d atrasado`, cls: "text-danger font-semibold" };
  if (d === 0) return { texto: "HOJE", cls: "text-danger font-semibold" };
  if (d === 1) return { texto: "Amanhã", cls: "text-warning-foreground font-medium" };
  return { texto: `${d}d`, cls: "text-muted-foreground" };
}

export async function registrarEvento(orderId: string, status: string | null, comentario: string) {
  await supabase.from("order_events").insert({
    order_id: orderId,
    status: status as never,
    comentario,
    autor: "Laboratório",
  });
}
