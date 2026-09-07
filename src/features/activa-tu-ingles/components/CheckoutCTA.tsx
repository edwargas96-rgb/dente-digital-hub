export function CheckoutCTA({ onClick, price }: { onClick: () => void; price?: string }) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className="min-h-[56px] w-full rounded-2xl bg-[#E4283F] font-display text-base font-extrabold tracking-wide text-white shadow-[0_5px_0_#8f1327] transition-transform active:translate-y-1 active:shadow-none"
      >
        QUIERO ACTIVAR MI INGLÉS
      </button>
      {price ? (
        <p className="mt-2 text-center font-body text-sm font-semibold text-[#0B2145]">{price}</p>
      ) : null}
      <p className="mt-2 text-center font-body text-xs font-medium text-[#0B2145]/55">
        Acceso inmediato
      </p>
    </div>
  );
}
