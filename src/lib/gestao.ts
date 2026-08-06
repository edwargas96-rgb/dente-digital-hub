// Helpers da área de GESTÃO do laboratório.

// Fluxo simplificado: a O.S. está "Recebida" ou "Entregue".
export const LAB_STATUS = ["Recebida", "Entregue"] as const;

export type LabStatus = (typeof LAB_STATUS)[number];

// Cores dos selos de status (classes Tailwind).
export const LAB_STATUS_STYLE: Record<LabStatus, string> = {
  Recebida: "bg-sky-100 text-sky-800 border-sky-200",
  Entregue: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

// Próximo status "de avanço" no fluxo.
export function proximoStatus(atual: LabStatus): LabStatus | null {
  return atual === "Recebida" ? "Entregue" : null;
}

// Mapeia o status de gestão do laboratório para o status que a clínica vê
// (enum order_status), mantendo os dois lados sincronizados.
export const LAB_TO_ORDER_STATUS: Record<LabStatus, string> = {
  Recebida: "Recebida",
  Entregue: "Enviada/Entregue",
};

export function rotuloAvanco(atual: LabStatus): string | null {
  return atual === "Recebida" ? "Marcar entregue" : null;
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
