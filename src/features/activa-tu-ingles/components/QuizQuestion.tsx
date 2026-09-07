import { useState } from "react";
import { ProgressBar } from "./ProgressBar";

const OPTION_LABELS = ["A", "B", "C", "D"];
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
    <div className="flex min-h-[100dvh] flex-col bg-[#f4f6fb] px-5 pb-8 pt-6">
      <div>
        <p className="text-sm font-semibold text-[#0b2b6b]">
          Pregunta {questionNumber} de {totalQuestions}
        </p>
        <div className="mt-2">
          <ProgressBar percent={percent} />
        </div>
      </div>

      <div className="mt-10 flex-1">
        <h1 className="text-2xl font-extrabold leading-snug text-[#0b2b6b]">{question}</h1>

        <div className="mt-8 grid grid-cols-1 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isDimmed = selectedIndex !== null && !isSelected;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(index)}
                disabled={selectedIndex !== null}
                className={[
                  "flex min-h-[52px] w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left text-base font-semibold text-[#0b2b6b] shadow-sm transition-all duration-200",
                  isSelected ? "scale-[0.98] border-[#0b2b6b] bg-[#eef2ff]" : "border-transparent",
                  isDimmed ? "opacity-50" : "",
                ].join(" ")}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0b2b6b] text-sm font-bold text-white">
                  {OPTION_LABELS[index]}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
