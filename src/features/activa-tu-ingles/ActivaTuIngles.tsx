import { Fragment, useEffect, useRef, useState } from "react";

import { FontStyles } from "./components/FontStyles";
import { AdContinuation } from "./components/AdContinuation";
import { QuizQuestion } from "./components/QuizQuestion";
import { MotivationToast } from "./components/MotivationToast";
import { ActivityToast } from "./components/ActivityToast";
import { ProcessingResult } from "./components/ProcessingResult";
import { QuizResult } from "./components/QuizResult";
import { Diagnosis } from "./components/Diagnosis";
import { LeadCapture } from "./components/LeadCapture";
import { OfferSection } from "./components/OfferSection";

import { QUIZ_QUESTIONS } from "./data/questions";
import { getActivityNotifications } from "./data/activityNotifications";
import { calculateResult } from "./utils/scoring";
import { trackEvent, metaPixel } from "./utils/tracking";
import { saveLeadLocally } from "./utils/leadCapture";
import { PRODUCT_CONFIG } from "./config/product";
import type { QuizResultData } from "./types";

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;
const INTRO_DURATION_MS = 1000;
const MICRO_MESSAGE_DURATION_MS = 700;

// Después de responder estas posiciones (0-indexadas, preguntas 4-10) se
// muestra un mensaje motivacional antes de la siguiente pregunta.
const MICRO_MESSAGE_AFTER_INDEX: Record<number, string> = {
  1: "Sigue así.",
  3: "Ahora se pone interesante...",
  5: "Últimas preguntas.",
};

type Stage =
  "intro" | "question" | "micro" | "processing" | "result" | "diagnosis" | "lead" | "offer";

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function ActivaTuIngles() {
  const [stage, setStage] = useState<Stage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() =>
    Array(TOTAL_QUESTIONS).fill(null),
  );
  const [pendingMicroMessage, setPendingMicroMessage] = useState("");
  const [toast, setToast] = useState({ text: "", visible: false });

  const result = useRef<QuizResultData | null>(null);

  // landing_viewed al montar
  useEffect(() => {
    trackEvent("landing_viewed");
    metaPixel.viewContent({ content_name: "activa_tu_ingles_landing" });
  }, []);

  // Transición automática de la pantalla de continuación del anuncio.
  useEffect(() => {
    if (stage !== "intro") return;
    const timer = window.setTimeout(() => {
      trackEvent("quiz_continued");
      metaPixel.quizStarted();
      setStage("question");
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // Mensaje motivacional breve entre preguntas.
  useEffect(() => {
    if (stage !== "micro") return;
    const timer = window.setTimeout(() => {
      setStage("question");
    }, MICRO_MESSAGE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // Notificaciones de actividad, discretas, cada 8-18s, mientras dura el quiz.
  useEffect(() => {
    const isQuizActive = stage === "question" || stage === "micro";
    if (!isQuizActive) return;

    const notifications = getActivityNotifications();
    let hideTimer: number | undefined;

    const showTimer = window.setTimeout(
      () => {
        const notification = notifications[Math.floor(Math.random() * notifications.length)];
        if (!notification) return;
        setToast({ text: notification.text, visible: true });
        hideTimer = window.setTimeout(
          () => {
            setToast((t) => ({ ...t, visible: false }));
          },
          randomBetween(2000, 3000),
        );
      },
      randomBetween(8000, 18000),
    );

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
    // Se re-arma cada vez que cambia de pregunta para variar el intervalo.
  }, [stage, questionIndex]);

  function handleAnswer(selectedIndex: number) {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = selectedIndex;
    setAnswers(newAnswers);

    const currentQuestion = QUIZ_QUESTIONS[questionIndex];
    if (!currentQuestion) return;

    trackEvent("question_answered", {
      questionNumber: currentQuestion.id,
      category: currentQuestion.category,
    });

    const isLastQuestion = questionIndex === TOTAL_QUESTIONS - 1;

    if (isLastQuestion) {
      const computedResult = calculateResult(newAnswers);
      result.current = computedResult;
      trackEvent("quiz_completed", { correctCount: computedResult.correctCount });
      metaPixel.quizCompleted({ score: computedResult.correctCount });
      trackEvent("result_processing");
      setStage("processing");
      return;
    }

    const microMessage = MICRO_MESSAGE_AFTER_INDEX[questionIndex];
    setQuestionIndex((i) => i + 1);

    if (microMessage) {
      setPendingMicroMessage(microMessage);
      setStage("micro");
    }
  }

  function handleProcessingDone() {
    if (!result.current) return;
    trackEvent("result_viewed", { correctCount: result.current.correctCount });
    setStage("result");
  }

  function handleResultContinue() {
    setStage("diagnosis");
  }

  function handleDiagnosisContinue() {
    setStage("lead");
  }

  function handleLeadSubmit(lead: { name: string; email: string }) {
    saveLeadLocally(lead);
    trackEvent("lead_captured");
    metaPixel.lead({ content_name: PRODUCT_CONFIG.name });
    goToOffer();
  }

  function handleLeadSkip() {
    goToOffer();
  }

  function goToOffer() {
    if (!result.current) return;
    trackEvent("offer_viewed", { weakestCategory: result.current.weakestCategory.key });
    setStage("offer");
  }

  function handleCheckoutClick() {
    trackEvent("checkout_clicked", { product: PRODUCT_CONFIG.name });
    metaPixel.initiateCheckout({ content_name: PRODUCT_CONFIG.name });
    if (PRODUCT_CONFIG.checkoutUrl) {
      window.location.href = PRODUCT_CONFIG.checkoutUrl;
    }
  }

  function renderStage() {
    if (stage === "intro") {
      return <AdContinuation />;
    }

    if (stage === "micro") {
      return <MotivationToast message={pendingMicroMessage} />;
    }

    if (stage === "question") {
      const current = QUIZ_QUESTIONS[questionIndex];
      if (!current) return null;
      return (
        <>
          <QuizQuestion
            key={current.id}
            questionNumber={current.id}
            totalQuestions={10}
            question={current.question}
            options={current.options}
            onAnswer={handleAnswer}
          />
          <ActivityToast text={toast.text} visible={toast.visible} />
        </>
      );
    }

    if (stage === "processing") {
      return <ProcessingResult onDone={handleProcessingDone} />;
    }

    if (!result.current) {
      return null;
    }

    if (stage === "result") {
      return <QuizResult result={result.current} onContinue={handleResultContinue} />;
    }

    if (stage === "diagnosis") {
      return (
        <Diagnosis
          weakestCategory={result.current.weakestCategory}
          allCategoriesMastered={result.current.allCategoriesMastered}
          onContinue={handleDiagnosisContinue}
        />
      );
    }

    if (stage === "lead") {
      return <LeadCapture onSubmit={handleLeadSubmit} onSkip={handleLeadSkip} />;
    }

    return <OfferSection onCheckout={handleCheckoutClick} />;
  }

  return (
    <Fragment>
      <FontStyles />
      {renderStage()}
    </Fragment>
  );
}
