interface CarimboProps {
  pct: number;
  size?: number;
  color?: string;
  label?: string;
}

export function Carimbo({ pct, size = 96, color = "var(--green)", label }: CarimboProps) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pctClamped = Math.min(Math.max(pct, 0), 100);
  const offset = c - (pctClamped / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-3">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
            strokeDasharray="2 6"
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-bold text-fg">{Math.round(pctClamped)}%</span>
        </div>
      </div>
      {label && <span className="label-caps text-center">{label}</span>}
    </div>
  );
}
