import type { TrustProfile } from "@/lib/types";
import { Card } from "./Card";
import MetricBar from "./MetricBar";

export default function DiagnosticsSection({ diagnostics }: { diagnostics: NonNullable<TrustProfile["diagnostics"]> }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-[15px] font-semibold text-ink">{diagnostics.title}</h2>
        {diagnostics.note ? <p className="text-xs text-muted">{diagnostics.note}</p> : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {diagnostics.cards.map((c) => (
          <Card key={c.id}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-ink">{c.title}</h3>
              {c.badge ? (
                <span className="rounded-md border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {c.badge}
                </span>
              ) : null}
            </div>
            <div className="divide-y divide-line/60">
              {c.metrics.map((m) => (
                <MetricBar key={m.id} metric={m} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
