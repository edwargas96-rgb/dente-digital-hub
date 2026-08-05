// Helpers da área de GESTÃO do laboratório.

export const LAB_STATUS = [
  "Pendente",
  "Aceita",
  "Em Produção",
  "Concluída",
  "Entregue",
  "Recusada",
] as const;

export type LabStatus = (typeof LAB_STATUS)[number];

// Cores dos selos de status (classes Tailwind).
export const LAB_STATUS_STYLE: Record<LabStatus, string> = {
  Pendente: "bg-amber-100 text-amber-800 border-amber-200",
  Aceita: "bg-sky-100 text-sky-800 border-sky-200",
  "Em Produção": "bg-violet-100 text-violet-800 border-violet-200",
  Concluída: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Entregue: "bg-slate-200 text-slate-700 border-slate-300",
  Recusada: "bg-rose-100 text-rose-800 border-rose-200",
};

// Próximo status "de avanço" no fluxo (para ação em lote e botões).
export function proximoStatus(atual: LabStatus): LabStatus | null {
  switch (atual) {
    case "Pendente":
      return "Aceita";
    case "Aceita":
      return "Em Produção";
    case "Em Produção":
      return "Concluída";
    case "Concluída":
      return "Entregue";
    default:
      return null;
  }
}

export function rotuloAvanco(atual: LabStatus): string | null {
  switch (atual) {
    case "Pendente":
      return "Aceitar";
    case "Aceita":
      return "Iniciar produção";
    case "Em Produção":
      return "Concluir";
    case "Concluída":
      return "Marcar entregue";
    default:
      return null;
  }
}

export function formatarMoeda(valor: number | null | undefined): string {
  return (valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const URGENCIAS = ["Normal", "Urgente", "Prioridade"] as const;

/** Rótulos dos últimos N meses, ex.: ["mar", "abr", ...] com chave AAAA-MM. */
export function ultimosMeses(n: number): { chave: string; rotulo: string }[] {
  const out: { chave: string; rotulo: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const chave = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    const rotulo = m.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    out.push({ chave, rotulo });
  }
  return out;
}
