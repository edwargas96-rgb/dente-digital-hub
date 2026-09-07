export function ScoreCircle({ percent }: { percent: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E4E9F5" strokeWidth="12" />
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
            <stop offset="0%" stopColor="#1E4FD6" />
            <stop offset="100%" stopColor="#E4283F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-extrabold text-[#0B2145]">{percent}%</span>
      </div>
    </div>
  );
}
