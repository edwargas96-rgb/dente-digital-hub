/**
 * Indique e Ganhe — utilitários do código de indicação.
 * O código é derivado do nome + WhatsApp do comprador (determinístico),
 * então não precisa ser guardado: dá pra recalcular sempre igual.
 */

export const REF_KEY = "fp_ref";

/** Gera um código curto e legível, ex.: "ED1013". */
export function gerarCodigo(nome: string, whatsapp: string): string {
  const digitos = whatsapp.replace(/\D/g, "");
  const ult4 = (digitos.slice(-4) || "0000").padStart(4, "0");
  const primeiro = (nome.trim().split(/\s+/)[0] || "").toUpperCase().replace(/[^A-Z]/g, "");
  const iniciais = primeiro.slice(0, 2) || "PT";
  return iniciais + ult4;
}

/** Lê o código de quem indicou (da URL ?ref= ou do que ficou salvo). */
export function lerIndicadoPor(): string | null {
  if (typeof window === "undefined") return null;
  const daUrl = new URLSearchParams(window.location.search).get("ref");
  if (daUrl) {
    const c = daUrl.toUpperCase().slice(0, 12);
    try {
      window.localStorage.setItem(REF_KEY, c);
    } catch {
      /* ignore */
    }
    return c;
  }
  try {
    return window.localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}
