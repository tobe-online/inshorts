import type { Metric } from "@/lib/types";
import { toneHex } from "@/lib/tone";
import { pct } from "@/lib/format";
import InfoTip from "./InfoTip";

/** Big numeral + bar, used for the "columns" section layout. */
export default function ScoreStat({ metric }: { metric: Metric }) {
  const max = metric.max ?? 100;
  const color = toneHex(metric.tone, metric.value);

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        {metric.label}
        <InfoTip text={metric.tooltip} />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="tnum text-3xl font-semibold leading-none text-ink">{metric.value}</span>
        <span className="text-xs text-muted">/{max}</span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#eeeeea]">
        <div className="h-full rounded-full" style={{ width: `${pct(metric.value, max)}%`, backgroundColor: color }} />
      </div>
      {metric.caption ? <p className="mt-1.5 text-xs text-muted">{metric.caption}</p> : null}
    </div>
  );
}
