export function ScoreCircle({ percent, level }: { percent: number; level: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#dbe4f5" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#activaGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="activaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e4fd6" />
            <stop offset="100%" stopColor="#d21f3c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-[#0b2b6b]">{percent}%</span>
        <span className="mt-1 max-w-[7.5rem] text-center text-[11px] font-bold uppercase tracking-wide text-[#d21f3c]">
          {level}
        </span>
      </div>
    </div>
  );
}
