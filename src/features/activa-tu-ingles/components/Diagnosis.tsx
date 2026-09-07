import type { CategoryScore } from "../types";

export function Diagnosis({
  weakestCategory,
  onContinue,
}: {
  weakestCategory: CategoryScore;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f4f6fb] px-6 pb-8 pt-14">
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold leading-snug text-[#0b2b6b]">
          Ya tienes algunas piezas.
          <br />
          Ahora necesitas conectarlas.
        </h1>

        <p className="mt-5 text-base leading-relaxed text-[#0b2b6b]/80">
          Tu resultado muestra que ya reconoces palabras y expresiones en inglés.
        </p>
        <p className="mt-3 text-base leading-relaxed text-[#0b2b6b]/80">
          El siguiente paso es aprender a conectar vocabulario, frases y estructuras para que el
          inglés empiece a tener sentido.
        </p>

        <div className="mt-8 rounded-2xl border-2 border-[#d21f3c]/20 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0b2b6b]/60">
            Tu mayor oportunidad de mejora
          </p>
          <p className="mt-1 text-xl font-extrabold text-[#d21f3c]">
            {weakestCategory.label.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[52px] w-full rounded-2xl bg-[#0b2b6b] text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
