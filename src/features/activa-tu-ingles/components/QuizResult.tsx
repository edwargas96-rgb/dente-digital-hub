import type { QuizResultData } from "../types";
import { ScoreCircle } from "./ScoreCircle";
import { Confetti } from "./Confetti";
import { paperBackgroundStyle } from "../utils/paperBackground";

const HIGH_PERFORMANCE_THRESHOLD = 6;

function CategoryBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between font-body text-sm font-semibold text-[#0B2145]">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#E4E9F5]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1E4FD6] to-[#0B2145] transition-all duration-700 ease-out"
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
    <div
      className="relative flex min-h-[100dvh] flex-col overflow-hidden px-6 pb-8 pt-10"
      style={paperBackgroundStyle}
    >
      {isHighPerformance ? <Confetti /> : null}

      <div className="text-center">
        <p className="font-script text-xl font-bold text-[#E4283F]">Tu resultado está listo</p>
        <p className="mt-0.5 font-display text-xs font-bold uppercase tracking-wider text-[#0B2145]/60">
          Tu nivel de inglés
        </p>
      </div>

      <div className="mt-6">
        <ScoreCircle percent={result.overallPercent} />
      </div>

      <div className="relative mx-auto mt-1 flex items-center justify-center">
        <span className="relative rounded-full bg-[#0B2145] px-5 py-2 font-display text-sm font-extrabold tracking-wide text-white shadow-[0_4px_12px_rgba(11,33,69,0.3)]">
          {result.level}
          <span className="absolute -left-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-[#0B2145]" />
          <span className="absolute -right-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-[#0B2145]" />
        </span>
      </div>

      <p className="mt-4 text-center font-body text-sm font-semibold text-[#0B2145]/70">
        {result.correctCount}/{result.totalQuestions} respuestas correctas
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-[#E4E9F5] bg-white p-5 shadow-[0_2px_0_rgba(11,33,69,0.06)]">
        {result.categories.map((c) => (
          <CategoryBar key={c.key} label={c.label} percent={c.percent} />
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[52px] w-full rounded-2xl bg-[#0B2145] font-display text-base font-bold text-white shadow-[0_4px_0_rgba(11,33,69,0.35)] transition-transform active:translate-y-0.5 active:shadow-none"
        >
          Ver mi diagnóstico
        </button>
      </div>
    </div>
  );
}
