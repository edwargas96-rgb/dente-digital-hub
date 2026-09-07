import { Check } from "lucide-react";

/**
 * Pantalla breve (~1s) que conecta la landing con las 3 preguntas ya
 * respondidas en el anuncio. Avanza automáticamente.
 */
export function AdContinuation() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0b2b6b] px-6 text-center text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
        <Check className="h-7 w-7" strokeWidth={3} />
      </div>
      <p className="mt-5 text-2xl font-extrabold">¡Muy bien!</p>
      <p className="mt-2 text-base text-white/85">Ya completaste las primeras 3.</p>
      <p className="mt-1 text-base text-white/85">Continuemos.</p>
    </div>
  );
}
