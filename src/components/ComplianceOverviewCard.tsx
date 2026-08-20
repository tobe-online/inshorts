import { Card, CardTitle } from "./Card";
import type { ComplianceOverviewRow } from "@/lib/types";

function RowIcon({ kind }: { kind: ComplianceOverviewRow["icon"] }) {
  const p = { className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;
  if (kind === "flag")
    return (
      <svg viewBox="0 0 24 24" {...p} aria-hidden>
        <path d="M5 21V4m0 0h11l-1.5 3.5L16 11H5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "alert")
    return (
      <svg viewBox="0 0 24 24" {...p} aria-hidden>
        <path d="M12 4l9 16H3l9-16z" strokeLinejoin="round" />
        <path d="M12 10v4M12 17.2v.1" strokeLinecap="round" />
      </svg>
    );
  if (kind === "tag")
    return (
      <svg viewBox="0 0 24 24" {...p} aria-hidden>
        <path d="M4 13V5a1 1 0 0 1 1-1h8l7 7-9 9-7-7z" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...p} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.2l2.4 2.3 4.6-4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ComplianceOverviewCard({ rows }: { rows: ComplianceOverviewRow[] }) {
  if (!rows.length) return null;
  return (
    <Card>
      <CardTitle>Compliance &amp; Risk Overview</CardTitle>
      <dl className="divide-y divide-line/60">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 py-3">
            <dt className="flex items-center gap-2.5 text-sm text-ink">
              <span className="text-muted">
                <RowIcon kind={r.icon} />
              </span>
              {r.label}
            </dt>
            <dd className="tnum text-right text-sm font-semibold text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
