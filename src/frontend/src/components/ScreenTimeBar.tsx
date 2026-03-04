interface ScreenTimeBarProps {
  usedMinutes: number;
  limitMinutes: number;
  usedLabel?: string;
  limitLabel?: string;
}

function minutesToDisplay(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ScreenTimeBar({
  usedMinutes,
  limitMinutes,
  usedLabel,
  limitLabel,
}: ScreenTimeBarProps) {
  const ratio = limitMinutes > 0 ? Math.min(usedMinutes / limitMinutes, 1) : 0;
  const percentage = Math.round(ratio * 100);

  let barColor = "bg-[oklch(0.68_0.18_145)]"; // green
  if (ratio >= 1)
    barColor = "bg-[oklch(0.62_0.22_25)]"; // red
  else if (ratio >= 0.75) barColor = "bg-[oklch(0.75_0.18_75)]"; // amber

  const displayUsed = usedLabel ?? minutesToDisplay(usedMinutes);
  const displayLimit =
    limitLabel ??
    (limitMinutes > 0 ? minutesToDisplay(limitMinutes) : "No limit");

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">Screen time</span>
        <span className="text-xs font-medium text-foreground">
          {displayUsed} / {displayLimit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
