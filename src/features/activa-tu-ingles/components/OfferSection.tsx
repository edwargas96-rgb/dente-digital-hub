import { Check } from "lucide-react";
import { PRODUCT_CONFIG } from "../config/product";
import { CheckoutCTA } from "./CheckoutCTA";

export function OfferSection({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f4f6fb] px-6 pb-8 pt-14">
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold leading-snug text-[#0b2b6b]">
          Hay una forma más visual de aprenderlo.
        </h1>

        <div className="mt-6 rounded-2xl bg-[#0b2b6b] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {PRODUCT_CONFIG.name}
          </p>
          <p className="mt-2 text-lg font-bold leading-snug">
            Conecta palabras, frases y estructuras de forma visual y mucho más fácil de repasar.
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {PRODUCT_CONFIG.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-3 text-sm font-semibold text-[#0b2b6b]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e4fd6]/10 text-[#1e4fd6]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-[#1e4fd6]/30 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#d21f3c]">
            Bonos incluidos
          </p>
          <ul className="mt-2 space-y-1.5">
            {PRODUCT_CONFIG.bonuses.map((bonus) => (
              <li key={bonus} className="text-sm font-medium text-[#0b2b6b]/80">
                + {bonus}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-center text-lg font-extrabold text-[#0b2b6b]">
          Empieza a organizar tu inglés hoy.
        </p>
        <div className="mt-4">
          <CheckoutCTA onClick={onCheckout} price={PRODUCT_CONFIG.price} />
        </div>
      </div>
    </div>
  );
}
