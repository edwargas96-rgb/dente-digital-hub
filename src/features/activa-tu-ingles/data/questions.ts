import type { AdQuestion, QuizQuestionData } from "../types";

/**
 * Preguntas 1-3 de "Activa tu Inglés".
 *
 * Ya se muestran en el anuncio (video) y NO se repiten aquí. Existen solo
 * como referencia / para un futuro tracking vía query params (ver
 * utils/adAnswers.ts).
 */
export const AD_QUESTIONS: AdQuestion[] = [
  {
    id: 1,
    question: '¿Qué significa "Thank you"?',
    options: ["Hola", "Gracias", "Perdón", "Adiós"],
    correctIndex: 1,
  },
  {
    id: 2,
    question: '¿Qué color es "Yellow"?',
    options: ["Azul", "Amarillo", "Verde", "Rojo"],
    correctIndex: 1,
  },
  {
    id: 3,
    question: '¿Qué significa "Good morning"?',
    options: ["Buenas noches", "Hasta luego", "Buenos días", "Buenas tardes"],
    correctIndex: 2,
  },
];

/**
 * Preguntas 4-10, con dificultad creciente. category: vocabulary |
 * comprehension | structure — usada para calcular el desglose del
 * resultado.
 */
export const QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    id: 4,
    difficulty: "fácil",
    category: "vocabulary",
    question: '¿Qué significa "House"?',
    options: ["Casa", "Auto", "Perro", "Silla"],
    correctIndex: 0,
  },
  {
    id: 5,
    difficulty: "fácil/media",
    category: "vocabulary",
    question: '¿Cuál palabra significa "trabajo"?',
    options: ["Play", "Work", "Sleep", "Eat"],
    correctIndex: 1,
  },
  {
    id: 6,
    difficulty: "media",
    category: "structure",
    question: 'Completa: "She ___ a teacher."',
    options: ["is", "are", "am", "be"],
    correctIndex: 0,
  },
  {
    id: 7,
    difficulty: "media",
    category: "comprehension",
    question: '¿Qué pregunta responde "At 8 AM"?',
    options: [
      "What is your name?",
      "What time do you wake up?",
      "Where do you live?",
      "How old are you?",
    ],
    correctIndex: 1,
  },
  {
    id: 8,
    difficulty: "media",
    category: "structure",
    question: 'Completa: "They ___ to the gym every day."',
    options: ["go", "goes", "going", "went"],
    correctIndex: 0,
  },
  {
    id: 9,
    difficulty: "media/difícil",
    category: "comprehension",
    question: "\"I can't go out, it's raining.\" ¿Por qué la persona no puede salir?",
    options: [
      "Porque está enferma",
      "Porque está lloviendo",
      "Porque está trabajando",
      "Porque está durmiendo",
    ],
    correctIndex: 1,
  },
  {
    id: 10,
    difficulty: "difícil",
    category: "structure",
    question: 'Elige la opción correcta: "If I ___ more time, I would travel more."',
    options: ["have", "had", "has", "having"],
    correctIndex: 1,
  },
];
