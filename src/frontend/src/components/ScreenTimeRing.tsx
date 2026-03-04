interface ScreenTimeRingProps {
  usedMinutes: number;
  limitMinutes: number;
  size?: number;
  strokeWidth?: number;
}

function minutesToDisplay(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getColor(ratio: number): string {
  if (ratio >= 1) return "oklch(0.62 0.22 25)"; // red
  if (ratio >= 0.75) return "oklch(0.75 0.18 75)"; // amber
  return "oklch(0.68 0.18 145)"; // green
}

export default function ScreenTimeRing({
  usedMinutes,
  limitMinutes,
  size = 140,
  strokeWidth = 12,
}: ScreenTimeRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = limitMinutes > 0 ? Math.min(usedMinutes / limitMinutes, 1) : 0;
  const dashOffset = circumference * (1 - ratio);
  const color = getColor(ratio);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
          role="img"
          aria-label={`Screen time: ${minutesToDisplay(usedMinutes)} of ${minutesToDisplay(limitMinutes)}`}
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="oklch(var(--border))"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease",
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-foreground text-xl leading-none">
            {minutesToDisplay(usedMinutes)}
          </span>
          <span className="text-muted-foreground text-xs mt-1">used</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Limit:{" "}
          <span className="text-foreground font-medium">
            {limitMinutes > 0 ? minutesToDisplay(limitMinutes) : "Not set"}
          </span>
        </p>
        {ratio >= 1 && (
          <p className="text-xs text-destructive font-medium mt-1">
            Limit exceeded!
          </p>
        )}
        {ratio >= 0.75 && ratio < 1 && (
          <p className="text-xs text-warning font-medium mt-1">
            Approaching limit
          </p>
        )}
      </div>
    </div>
  );
}
