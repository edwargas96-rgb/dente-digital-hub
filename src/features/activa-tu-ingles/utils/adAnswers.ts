/**
 * Preparado para recibir las respuestas de las preguntas 1-3 (del anuncio)
 * vía query param, ej: ?adAnswers=BBB (una letra A-D por pregunta).
 * No se usa en el MVP; solo tracking/contexto a futuro.
 */
export function parseAdAnswers(searchParams: URLSearchParams): Array<number | null> | null {
  const raw = searchParams.get("adAnswers");
  if (!raw) return null;

  const indexByLetter: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

  return raw
    .toUpperCase()
    .split("")
    .map((letter) => indexByLetter[letter] ?? null);
}
