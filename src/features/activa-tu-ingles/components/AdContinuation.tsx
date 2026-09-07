import { Check } from "lucide-react";

/**
 * Pantalla breve (~1s) que conecta la landing con las 3 preguntas ya
 * respondidas en el anuncio. Avanza automáticamente.
 */
export function AdContinuation() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#0B2145] px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #E4283F 0px, #E4283F 3px, transparent 3px, transparent 34px)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#E4283F]/30" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#E4283F] shadow-[0_6px_20px_rgba(228,40,63,0.5)]">
          <Check className="h-8 w-8 text-white" strokeWidth={3.5} />
        </span>
      </div>

      <p className="relative mt-6 font-display text-3xl font-extrabold text-white">¡Muy bien!</p>
      <p className="relative mt-3 font-body text-base font-medium text-white/80">
        Ya completaste las primeras 3.
      </p>
      <p className="relative font-script text-2xl font-bold text-[#F6C445]">Continuemos...</p>
    </div>
  );
}
