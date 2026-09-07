/**
 * Bandeiras em SVG inline — substituem os emojis 🇧🇷/🇺🇸, que quebram
 * (aparecem como "BR"/"US") no Windows e em vários Androids.
 */

export function FlagBR({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="Brasil"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <rect width="28" height="20" rx="2.5" fill="#0a7d3c" />
      <polygon points="14,2.4 25.6,10 14,17.6 2.4,10" fill="#f1c40f" />
      <circle cx="14" cy="10" r="4.3" fill="#0b2b6b" />
    </svg>
  );
}

export function FlagAR({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="Argentina"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <clipPath id="ar-clip">
        <rect width="28" height="20" rx="2.5" />
      </clipPath>
      <g clipPath="url(#ar-clip)">
        <rect width="28" height="20" fill="#74acdf" />
        <rect y="6.67" width="28" height="6.67" fill="#fff" />
        <circle cx="14" cy="10" r="2.1" fill="#f6b40e" stroke="#85340a" strokeWidth="0.3" />
      </g>
    </svg>
  );
}

export function FlagCO({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="Colombia"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <clipPath id="co-clip">
        <rect width="28" height="20" rx="2.5" />
      </clipPath>
      <g clipPath="url(#co-clip)">
        <rect width="28" height="10" fill="#fcd116" />
        <rect y="10" width="28" height="5" fill="#003893" />
        <rect y="15" width="28" height="5" fill="#ce1126" />
      </g>
    </svg>
  );
}

export function FlagMX({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="México"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <clipPath id="mx-clip">
        <rect width="28" height="20" rx="2.5" />
      </clipPath>
      <g clipPath="url(#mx-clip)">
        <rect width="28" height="20" fill="#fff" />
        <rect width="9.34" height="20" fill="#006847" />
        <rect x="18.66" width="9.34" height="20" fill="#ce1126" />
        <circle cx="14" cy="10" r="2.4" fill="#8a5a2b" />
      </g>
    </svg>
  );
}

export function FlagVE({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="Venezuela"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <clipPath id="ve-clip">
        <rect width="28" height="20" rx="2.5" />
      </clipPath>
      <g clipPath="url(#ve-clip)">
        <rect width="28" height="6.67" fill="#fcd116" />
        <rect y="6.67" width="28" height="6.67" fill="#003893" />
        <rect y="13.33" width="28" height="6.67" fill="#cf142b" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <circle key={i} cx={9.5 + i * 1.6} cy="10" r="0.62" fill="#fff" />
        ))}
      </g>
    </svg>
  );
}

export function FlagPE({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="Perú"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <clipPath id="pe-clip">
        <rect width="28" height="20" rx="2.5" />
      </clipPath>
      <g clipPath="url(#pe-clip)">
        <rect width="28" height="20" fill="#fff" />
        <rect width="9.34" height="20" fill="#d91023" />
        <rect x="18.66" width="9.34" height="20" fill="#d91023" />
      </g>
    </svg>
  );
}

export function FlagCL({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="Chile"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <clipPath id="cl-clip">
        <rect width="28" height="20" rx="2.5" />
      </clipPath>
      <g clipPath="url(#cl-clip)">
        <rect width="28" height="10" fill="#fff" />
        <rect y="10" width="28" height="10" fill="#d52b1e" />
        <rect width="9.34" height="10" fill="#0039a6" />
        <path
          d="M4.67 3.2l0.62 1.9h2l-1.62 1.18 0.62 1.9-1.62-1.18-1.62 1.18 0.62-1.9-1.62-1.18h2z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

export function FlagUS({ className = "" }: { className?: string }) {
  const stripes = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg
      viewBox="0 0 28 20"
      width="1.3em"
      height="0.92em"
      role="img"
      aria-label="Estados Unidos"
      className={"inline-block shrink-0 align-[-0.15em] " + className}
    >
      <defs>
        <clipPath id="us-flag-clip">
          <rect width="28" height="20" rx="2.5" />
        </clipPath>
      </defs>
      <g clipPath="url(#us-flag-clip)">
        <rect width="28" height="20" fill="#fff" />
        {stripes.map((i) => (
          <rect key={i} y={i * 2.86} width="28" height="1.43" fill="#b22234" />
        ))}
        <rect width="12.5" height="10.77" fill="#3c3b6e" />
      </g>
    </svg>
  );
}
