import { Check, ShieldCheck, Star } from "lucide-react";
import { PRODUCT_CONFIG, SOCIAL_PROOF } from "../config/product";
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

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_2px_0_rgba(11,33,69,0.05)]">
          <div className="flex shrink-0 text-[#F6C445]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <p className="font-body text-xs font-semibold text-[#0B2145]/70">
            {SOCIAL_PROOF.rating} · {SOCIAL_PROOF.studentsLabel}
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

        <div className="mt-6 space-y-3">
          {SOCIAL_PROOF.testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-white p-4 shadow-[0_2px_0_rgba(11,33,69,0.05)]"
            >
              <p className="font-body text-sm italic leading-relaxed text-[#0B2145]/80">
                "{t.quote}"
              </p>
              <p className="mt-2 font-display text-xs font-bold text-[#0B2145]">
                {t.name}{" "}
                <span className="font-body font-normal text-[#0B2145]/50">· {t.country}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_2px_0_rgba(11,33,69,0.05)]">
          <ShieldCheck className="h-8 w-8 shrink-0 text-[#1E4FD6]" />
          <p className="font-body text-sm font-semibold text-[#0B2145]">
            {PRODUCT_CONFIG.guarantee}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="font-body text-lg font-semibold text-[#0B2145]/40 line-through">
            {PRODUCT_CONFIG.originalPrice}
          </span>
          <span className="font-display text-3xl font-extrabold text-[#E4283F]">
            {PRODUCT_CONFIG.price}
          </span>
        </div>
        <p className="mb-4 text-center font-body text-xs font-semibold text-[#0B2145]/55">
          {PRODUCT_CONFIG.priceNote}
        </p>

        <p className="text-center font-display text-lg font-extrabold text-[#0B2145]">
          Empieza a organizar tu inglés hoy.
        </p>
        <div className="mt-4">
          <CheckoutCTA onClick={onCheckout} />
        </div>
      </div>
    </div>
  );
}
