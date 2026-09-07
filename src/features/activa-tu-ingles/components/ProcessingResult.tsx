import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { paperBackgroundStyle } from "../utils/paperBackground";

const STEPS = [
  "Analizando tus respuestas...",
  "Analizando vocabulario...",
  "Analizando comprensión...",
  "Analizando estructuras...",
  "Preparando tu resultado...",
];

const STEP_DURATION_MS = 700;

export function ProcessingResult({ onDone }: { onDone: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) {
      const finalTimer = window.setTimeout(onDone, STEP_DURATION_MS);
      return () => window.clearTimeout(finalTimer);
    }
    const timer = window.setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [stepIndex, onDone]);

  const percent = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center"
      style={paperBackgroundStyle}
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#E4E9F5" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#E4283F"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - percent / 100)}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute font-display text-xl font-extrabold text-[#0B2145]">
          {percent}%
        </span>
      </div>

      <div className="mt-8 space-y-2.5">
        {STEPS.map((step, index) => {
          const isDone = index < stepIndex;
          const isActive = index === stepIndex;
          if (index > stepIndex) return null;
          return (
            <p
              key={step}
              className={[
                "flex items-center justify-center gap-2 font-body text-sm font-semibold transition-opacity",
                isActive ? "text-[#0B2145]" : "text-[#0B2145]/45",
              ].join(" ")}
            >
              {isDone ? (
                <Check className="h-4 w-4 shrink-0 text-[#E4283F]" strokeWidth={3} />
              ) : null}
              {step}
            </p>
          );
        })}
      </div>
    </div>
  );
}
