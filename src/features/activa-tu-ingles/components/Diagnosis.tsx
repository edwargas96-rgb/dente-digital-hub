import type { CategoryScore } from "../types";
import { paperBackgroundStyle } from "../utils/paperBackground";

export function Diagnosis({
  weakestCategory,
  allCategoriesMastered,
  onContinue,
}: {
  weakestCategory: CategoryScore;
  allCategoriesMastered: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col px-6 pb-8 pt-14" style={paperBackgroundStyle}>
      <div className="flex-1">
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-[#0B2145]">
          Ya tienes algunas piezas.
          <br />
          <span className="text-[#E4283F]">Ahora necesitas conectarlas.</span>
        </h1>

        <p className="mt-5 font-body text-base leading-relaxed text-[#0B2145]/75">
          Tu resultado muestra que ya reconoces palabras y expresiones en inglés.
        </p>
        <p className="mt-3 font-body text-base leading-relaxed text-[#0B2145]/75">
          El siguiente paso es aprender a conectar vocabulario, frases y estructuras para que el
          inglés empiece a tener sentido.
        </p>

        {allCategoriesMastered ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-[#1E4FD6]/30 bg-white p-5 shadow-[0_2px_0_rgba(11,33,69,0.06)]">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-[#0B2145]/55">
              Tu diagnóstico
            </p>
            <p className="mt-1.5 font-display text-xl font-extrabold text-[#1E4FD6]">
              Ya tienes una base sólida en todo
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-[#E4283F]/30 bg-white p-5 shadow-[0_2px_0_rgba(11,33,69,0.06)]">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-[#0B2145]/55">
              Tu mayor oportunidad de mejora
            </p>
            <p className="mt-1.5 font-display text-2xl font-extrabold text-[#E4283F]">
              {weakestCategory.label.toUpperCase()}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[52px] w-full rounded-2xl bg-[#0B2145] font-display text-base font-bold text-white shadow-[0_4px_0_rgba(11,33,69,0.35)] transition-transform active:translate-y-0.5 active:shadow-none"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
