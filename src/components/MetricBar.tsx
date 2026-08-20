import type { Metric } from "@/lib/types";
import { toneHex } from "@/lib/tone";
import { pct } from "@/lib/format";
import InfoTip from "./InfoTip";

/** Label left, value right, full-width track underneath. */
export default function MetricBar({ metric, barTone }: { metric: Metric; barTone?: string | undefined }) {
  const max = metric.max ?? 100;
  const color = barTone ?? toneHex(metric.tone ?? "neutral");
  const na = metric.value === null;

  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-1.5 text-sm text-ink">
          {metric.label}
          <InfoTip text={metric.tooltip} />
        </span>
        {na ? (
          <span className="tnum text-sm font-semibold text-muted">NA</span>
        ) : (
          <span className="tnum text-sm font-semibold text-ink">
            {metric.value}
            <span className="ml-0.5 text-xs font-normal text-muted">/{max}</span>
          </span>
        )}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#eeeeea]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${na ? 0 : pct(metric.value ?? 0, max)}%`, backgroundColor: color }}
        />
      </div>
      {metric.caption ? <p className="mt-1.5 text-xs text-muted">{metric.caption}</p> : null}
    </div>
  );
}
