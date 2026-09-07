import { useState } from "react";
import { paperBackgroundStyle } from "../utils/paperBackground";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadCapture({
  onSubmit,
  onSkip,
}: {
  onSubmit: (lead: { name: string; email: string }) => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isEmailValid) return;
    onSubmit({ name: name.trim(), email: email.trim() });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col px-6 pb-8 pt-14" style={paperBackgroundStyle}>
      <div className="flex-1">
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-[#0B2145]">
          Guarda tu resultado
        </h1>
        <p className="mt-3 font-body text-base leading-relaxed text-[#0B2145]/75">
          Te lo enviamos junto con tu plan de mejora, para que no lo pierdas.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-3.5">
          <div>
            <label
              htmlFor="lead-name"
              className="mb-1.5 block font-body text-xs font-semibold text-[#0B2145]/60"
            >
              Nombre (opcional)
            </label>
            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="min-h-[52px] w-full rounded-2xl border-2 border-[#E4E9F5] bg-white px-4 font-body text-base text-[#0B2145] outline-none focus:border-[#1E4FD6]"
            />
          </div>

          <div>
            <label
              htmlFor="lead-email"
              className="mb-1.5 block font-body text-xs font-semibold text-[#0B2145]/60"
            >
              Correo electrónico
            </label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className={[
                "min-h-[52px] w-full rounded-2xl border-2 bg-white px-4 font-body text-base text-[#0B2145] outline-none",
                touched && !isEmailValid
                  ? "border-[#E4283F]"
                  : "border-[#E4E9F5] focus:border-[#1E4FD6]",
              ].join(" ")}
            />
            {touched && !isEmailValid ? (
              <p className="mt-1.5 font-body text-xs font-semibold text-[#E4283F]">
                Ingresa un correo válido.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="min-h-[52px] w-full rounded-2xl bg-[#0B2145] font-display text-base font-bold text-white shadow-[0_4px_0_rgba(11,33,69,0.35)] transition-transform active:translate-y-0.5 active:shadow-none"
          >
            Guardar y continuar
          </button>
        </form>

        <button
          type="button"
          onClick={onSkip}
          className="mt-4 w-full text-center font-body text-sm font-semibold text-[#0B2145]/50 underline underline-offset-2"
        >
          Ahora no, continuar sin guardar
        </button>
      </div>
    </div>
  );
}
