export const STATUS_LIST = [
  "Recebida",
  "Em análise",
  "Em produção",
  "Em prova",
  "Pronta",
  "Enviada/Entregue",
] as const;

export type OrderStatus = (typeof STATUS_LIST)[number];

export const ARCADA_SUPERIOR = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const ARCADA_INFERIOR = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export function formatarData(iso: string | null | undefined) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function diasRestantes(dataEntrega: string) {
  const hoje = new Date(hojeISO() + "T00:00:00");
  const alvo = new Date(dataEntrega.slice(0, 10) + "T00:00:00");
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

/** 'atrasada' | 'proxima' | 'ok' | 'concluida' */
export function prazoTipo(dataEntrega: string, status: string) {
  if (status === "Enviada/Entregue") return "concluida" as const;
  const d = diasRestantes(dataEntrega);
  if (d < 0) return "atrasada" as const;
  if (d <= 2) return "proxima" as const;
  return "ok" as const;
}

export function formatarTamanho(bytes: number | null | undefined) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
