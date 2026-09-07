const COLORS = ["#1e4fd6", "#d21f3c", "#f5c518", "#0b2b6b", "#ffffff"];
const PARTICLE_COUNT = 24;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: Math.round((i / PARTICLE_COUNT) * 100 + (i % 3) * 2),
  delay: (i % 6) * 0.12,
  duration: 2.2 + (i % 5) * 0.3,
  color: COLORS[i % COLORS.length],
  rotate: (i * 47) % 360,
}));

/**
 * Confeti sutil, solo para resultados altos. Puramente decorativo (CSS),
 * no interactivo.
 */
export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute top-[-10px] h-2 w-2 rounded-sm confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(420px) rotate(360deg); opacity: 0; }
        }
        .confetti-piece {
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
