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
