import { Check } from "lucide-react";
import { PRODUCT_CONFIG } from "../config/product";
import { CheckoutCTA } from "./CheckoutCTA";
import { paperBackgroundStyle } from "../utils/paperBackground";

export function OfferSection({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div className="flex min-h-[100dvh] flex-col px-6 pb-8 pt-14" style={paperBackgroundStyle}>
      <div className="flex-1">
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-[#0B2145]">
          Hay una forma más visual de aprenderlo.
        </h1>

        <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#0B2145] p-5">
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, #E4283F 0px, #E4283F 2px, transparent 2px, transparent 26px)",
            }}
            aria-hidden="true"
          />
          <p className="relative font-display text-xs font-bold uppercase tracking-wider text-[#F6C445]">
            {PRODUCT_CONFIG.name}
          </p>
          <p className="relative mt-2 font-body text-lg font-bold leading-snug text-white">
            Conecta palabras, frases y estructuras de forma visual y mucho más fácil de repasar.
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {PRODUCT_CONFIG.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 font-body text-sm font-semibold text-[#0B2145] shadow-[0_2px_0_rgba(11,33,69,0.05)]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E4283F]/10 text-[#E4283F]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-[#F6C445] bg-[#FFF9E6] p-4">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-[#8a6b00]">
            Bonos incluidos
          </p>
          <ul className="mt-2 space-y-1.5">
            {PRODUCT_CONFIG.bonuses.map((bonus) => (
              <li key={bonus} className="font-body text-sm font-medium text-[#6b5300]">
                + {bonus}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-center font-display text-lg font-extrabold text-[#0B2145]">
          Empieza a organizar tu inglés hoy.
        </p>
        <div className="mt-4">
          <CheckoutCTA onClick={onCheckout} price={PRODUCT_CONFIG.price} />
        </div>
      </div>
    </div>
  );
}
