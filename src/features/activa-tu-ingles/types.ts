export type QuestionCategory = "vocabulary" | "comprehension" | "structure";

export interface AdQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizQuestionData {
  id: number;
  difficulty: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CategoryScore {
  key: QuestionCategory;
  label: string;
  correct: number;
  total: number;
  percent: number;
}

export interface QuizResultData {
  correctCount: number;
  totalQuestions: number;
  overallPercent: number;
  level: string;
  categories: CategoryScore[];
  weakestCategory: CategoryScore;
  allCategoriesMastered: boolean;
}

export interface ActivityNotification {
  id: string;
  text: string;
  demo?: boolean;
}
