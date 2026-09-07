export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#dbe4f5]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#0b2b6b] to-[#1e4fd6] transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
