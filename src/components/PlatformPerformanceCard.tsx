import { Card, CardTitle } from "./Card";
import type { PlatformPerformanceRow } from "@/lib/types";

function Icon({ platform }: { platform: string }) {
  const common = "h-4 w-4";
  if (platform === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M23 12s0-3.5-.45-5.17a2.9 2.9 0 0 0-2.04-2.05C18.83 4.33 12 4.33 12 4.33s-6.83 0-8.51.45A2.9 2.9 0 0 0 1.45 6.83 30 30 0 0 0 1 12a30 30 0 0 0 .45 5.17 2.9 2.9 0 0 0 2.04 2.05c1.68.45 8.51.45 8.51.45s6.83 0 8.51-.45a2.9 2.9 0 0 0 2.04-2.05C23 15.5 23 12 23 12zM9.8 15.3V8.7l5.7 3.3z" />
      </svg>
    );
  }
  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const NAMES: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="tnum mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function PlatformPerformanceCard({ rows }: { rows: PlatformPerformanceRow[] }) {
  if (!rows.length) return null;
  return (
    <Card>
      <CardTitle>Platform Performance</CardTitle>
      <div className="divide-y divide-line/60">
        {rows.map((r) => {
          const connected = r.connected !== false;
          return (
            <div
              key={r.platform}
              className={`grid grid-cols-2 items-center gap-4 py-3.5 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] ${
                connected ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-line text-muted">
                  <Icon platform={r.platform} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{NAMES[r.platform] ?? r.platform}</p>
                  <p className="truncate text-xs text-muted">
                    {connected ? (r.handle ? `@${r.handle}` : "—") : "Not connected"}
                  </p>
                </div>
              </div>
              <Metric label="Followers" value={r.followers ?? "—"} />
              <Metric label="Engagement Rate" value={r.engagement_rate ?? "—"} />
              <Metric label="Avg Views" value={r.avg_views ?? "—"} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
