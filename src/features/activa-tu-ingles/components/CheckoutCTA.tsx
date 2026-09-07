export function CheckoutCTA({ onClick, price }: { onClick: () => void; price?: string }) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className="min-h-[52px] w-full rounded-2xl bg-[#d21f3c] text-base font-bold text-white shadow-md transition-transform active:scale-[0.98]"
      >
        QUIERO ACTIVAR MI INGLÉS
      </button>
      {price ? (
        <p className="mt-2 text-center text-sm font-semibold text-[#0b2b6b]">{price}</p>
      ) : null}
      <p className="mt-2 text-center text-xs font-medium text-[#0b2b6b]/60">Acceso inmediato</p>
    </div>
  );
}
