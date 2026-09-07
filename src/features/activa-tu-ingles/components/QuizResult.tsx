import type { QuizResultData } from "../types";
import { ScoreCircle } from "./ScoreCircle";
import { Confetti } from "./Confetti";

const HIGH_PERFORMANCE_THRESHOLD = 6;

function CategoryBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-[#0b2b6b]">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#dbe4f5]">
        <div
          className="h-full rounded-full bg-[#1e4fd6] transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function QuizResult({
  result,
  onContinue,
}: {
  result: QuizResultData;
  onContinue: () => void;
}) {
  const isHighPerformance = result.correctCount >= HIGH_PERFORMANCE_THRESHOLD;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#f4f6fb] px-6 pb-8 pt-10">
      {isHighPerformance ? <Confetti /> : null}

      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#d21f3c]">
          Tu resultado está listo
        </p>
        <p className="mt-1 text-xs font-medium text-[#0b2b6b]/60">TU NIVEL DE INGLÉS</p>
      </div>

      <div className="mt-6">
        <ScoreCircle percent={result.overallPercent} level={result.level} />
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-[#0b2b6b]">
        {result.correctCount}/{result.totalQuestions} respuestas correctas
      </p>

      <div className="mt-8 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        {result.categories.map((c) => (
          <CategoryBar key={c.key} label={c.label} percent={c.percent} />
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[52px] w-full rounded-2xl bg-[#0b2b6b] text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
        >
          Ver mi diagnóstico
        </button>
      </div>
    </div>
  );
}
