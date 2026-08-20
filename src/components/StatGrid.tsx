import InfoTip from "./InfoTip";

export interface Stat {
  id: string;
  label: string;
  value: string | number;
  tooltip?: string | undefined;
}

/** Small uppercase label with a large numeral underneath (diagnostics sub-metrics). */
export default function StatGrid({ stats, columns = 3 }: { stats: Stat[]; columns?: 2 | 3 | undefined }) {
  if (!stats.length) return null;
  const cols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <div className={`mt-4 grid grid-cols-2 gap-4 ${cols}`}>
      {stats.map((s) => (
        <div key={s.id}>
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {s.label}
            <InfoTip text={s.tooltip} />
          </p>
          <p className="tnum mt-1 text-xl font-semibold text-ink">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
