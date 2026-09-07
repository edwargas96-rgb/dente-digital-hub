export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="relative h-3 w-full overflow-visible rounded-full bg-[#E4E9F5]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#0B2145] via-[#1E4FD6] to-[#E4283F] transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
      <div
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#E4283F] shadow-[0_1px_4px_rgba(11,33,69,0.35)] transition-all duration-500 ease-out"
        style={{ left: `calc(${percent}% - 8px)` }}
      />
    </div>
  );
}
