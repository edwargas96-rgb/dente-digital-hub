import { useState } from "react";
import { Check } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { paperBackgroundStyle } from "../utils/paperBackground";

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_ACCENTS = ["#0B2145", "#1E4FD6", "#B91530", "#0B2145"];
const ANSWER_DELAY_MS = 500;

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  onAnswer: (index: number) => void;
}

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  onAnswer,
}: QuizQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Pregunta 4 de 10 -> 30% (ya completó 3 preguntas en el anuncio).
  const percent = Math.round(((questionNumber - 1) / totalQuestions) * 100);

  function handleSelect(index: number) {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    window.setTimeout(() => onAnswer(index), ANSWER_DELAY_MS);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col px-5 pb-8 pt-6" style={paperBackgroundStyle}>
      <div>
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold tracking-wide text-[#0B2145]">
            Pregunta <span className="text-[#E4283F]">{questionNumber}</span> de {totalQuestions}
          </p>
          <span className="rounded-full bg-[#0B2145] px-2.5 py-1 font-display text-xs font-bold text-white">
            {percent}%
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar percent={percent} />
        </div>
      </div>

      <div className="mt-9 flex-1">
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-[#0B2145]">
          {question}
        </h1>

        <div className="mt-7 grid grid-cols-1 gap-3.5">
          {options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isDimmed = selectedIndex !== null && !isSelected;
            const accent = OPTION_ACCENTS[index % OPTION_ACCENTS.length];
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(index)}
                disabled={selectedIndex !== null}
                className={[
                  "flex min-h-[56px] w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left shadow-[0_2px_0_rgba(11,33,69,0.08)] transition-all duration-200",
                  isSelected
                    ? "scale-[0.98] border-[#E4283F] bg-[#FFF1F2] shadow-[0_1px_0_rgba(11,33,69,0.05)]"
                    : "border-[#E4E9F5]",
                  isDimmed ? "opacity-40" : "",
                ].join(" ")}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                  style={{ backgroundColor: isSelected ? "#E4283F" : accent }}
                >
                  {OPTION_LABELS[index]}
                </span>
                <span className="flex-1 font-body text-base font-semibold text-[#0B2145]">
                  {option}
                </span>
                {isSelected ? (
                  <Check className="h-5 w-5 shrink-0 text-[#E4283F]" strokeWidth={3} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
