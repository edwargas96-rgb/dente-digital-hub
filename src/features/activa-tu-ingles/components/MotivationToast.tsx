/**
 * Mensaje breve entre preguntas (500-900ms). Solo motiva, nunca indica si
 * la respuesta anterior fue correcta o incorrecta.
 */
export function MotivationToast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0B2145] px-6 text-center">
      <p className="font-display text-2xl font-bold text-white">{message}</p>
    </div>
  );
}
