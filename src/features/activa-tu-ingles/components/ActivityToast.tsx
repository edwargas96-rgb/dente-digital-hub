/**
 * Toast discreto en la parte inferior de la pantalla, usado para dar
 * sensación de actividad. Nunca debe cubrir las alternativas ni interrumpir
 * el quiz. Ver data/activityNotifications.ts para las reglas de contenido
 * (DEVELOPMENT_MODE vs LIVE_MODE).
 */
export function ActivityToast({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-5 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <div className="rounded-full bg-[#0b2b6b]/95 px-4 py-2 text-xs font-semibold text-white shadow-lg">
        {text}
      </div>
    </div>
  );
}
