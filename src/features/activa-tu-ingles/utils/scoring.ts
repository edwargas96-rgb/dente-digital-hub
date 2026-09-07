import { QUIZ_QUESTIONS } from "../data/questions";
import type { CategoryScore, QuestionCategory, QuizResultData } from "../types";

/**
 * Niveles de inglés según aciertos en las preguntas 4-10 (7 preguntas).
 */
export function getLevel(correctCount: number): string {
  if (correctCount <= 2) return "INGLÉS INICIAL";
  if (correctCount <= 4) return "INGLÉS BÁSICO";
  if (correctCount <= 6) return "INGLÉS FUNCIONAL";
  return "MUY BUENA BASE";
}

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  vocabulary: "Vocabulario",
  comprehension: "Comprensión",
  structure: "Estructuras",
};

/**
 * answers: índice seleccionado (o null) por cada pregunta, alineado con
 * QUIZ_QUESTIONS.
 */
export function calculateResult(answers: Array<number | null>): QuizResultData {
  const totalQuestions = QUIZ_QUESTIONS.length;

  const categoryTotals: Record<QuestionCategory, number> = {
    vocabulary: 0,
    comprehension: 0,
    structure: 0,
  };
  const categoryCorrect: Record<QuestionCategory, number> = {
    vocabulary: 0,
    comprehension: 0,
    structure: 0,
  };

  let correctCount = 0;

  QUIZ_QUESTIONS.forEach((q, index) => {
    categoryTotals[q.category] += 1;
    const isCorrect = answers[index] === q.correctIndex;
    if (isCorrect) {
      correctCount += 1;
      categoryCorrect[q.category] += 1;
    }
  });

  const categories: CategoryScore[] = (Object.keys(categoryTotals) as QuestionCategory[]).map(
    (key) => {
      const total = categoryTotals[key];
      const correct = categoryCorrect[key];
      const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { key, label: CATEGORY_LABELS[key], correct, total, percent };
    },
  );

  const weakestCategory = categories.reduce(
    (weakest, current) => (current.percent < weakest.percent ? current : weakest),
    categories[0] as CategoryScore,
  );

  const overallPercent = Math.round((correctCount / totalQuestions) * 100);
  const allCategoriesMastered = categories.every((c) => c.percent === 100);

  return {
    correctCount,
    totalQuestions,
    overallPercent,
    level: getLevel(correctCount),
    categories,
    weakestCategory,
    allCategoriesMastered,
  };
}
