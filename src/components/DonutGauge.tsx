import { toneHex } from "@/lib/tone";
import type { Tone } from "@/lib/types";

interface Props {
  value: number;
  max?: number | undefined;
  verdict?: string | undefined;
  tone?: Tone | undefined;
  size?: number | undefined;
}

export default function DonutGauge({ value, max = 100, verdict, tone, size = 176 }: Props) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = Math.max(0, Math.min(1, value / max));
  const color = toneHex(tone, value);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eeeeea" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - ratio)}
            style={{ transition: "stroke-dashoffset 700ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="flex items-baseline">
            <span className="tnum text-4xl font-semibold leading-none text-ink">{value}</span>
            <span className="ml-0.5 text-sm text-muted">/{max}</span>
          </div>
          {verdict ? (
            <p className="mt-2 text-[10px] font-semibold uppercase leading-tight tracking-wide" style={{ color }}>
              {verdict}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
