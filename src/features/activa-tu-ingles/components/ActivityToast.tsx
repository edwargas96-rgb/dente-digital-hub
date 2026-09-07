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
      <div className="flex items-center gap-2 rounded-full bg-[#0B2145] px-4 py-2.5 font-body text-xs font-semibold text-white shadow-[0_6px_16px_rgba(11,33,69,0.35)]">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F6C445]" />
        {text}
      </div>
    </div>
  );
}
