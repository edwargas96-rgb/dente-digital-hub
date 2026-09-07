/**
 * Mensaje breve entre preguntas (500-900ms). Solo motiva, nunca indica si
 * la respuesta anterior fue correcta o incorrecta.
 */
export function MotivationToast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0b2b6b] px-6 text-center">
      <p className="text-xl font-bold text-white">{message}</p>
    </div>
  );
}
