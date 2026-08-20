import type { DiagnosticsCard, TrustProfile } from "@/lib/types";
import { Card } from "./Card";
import MetricBar from "./MetricBar";
import StatGrid from "./StatGrid";

function DiagCard({ card }: { card: DiagnosticsCard }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-ink">{card.title}</h3>
        {card.badge ? (
          <span className="rounded-md border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {card.badge}
          </span>
        ) : null}
      </div>
      {card.metrics.map((m) => (
        <MetricBar key={m.id} metric={m} />
      ))}
      {card.stats?.length ? <StatGrid stats={card.stats} columns={card.stats.length > 3 ? 2 : 3} /> : null}
      {card.footnote ? <p className="mt-4 text-xs text-muted">{card.footnote}</p> : null}
    </Card>
  );
}

export default function DiagnosticsSection({
  diagnostics,
}: {
  diagnostics: NonNullable<TrustProfile["diagnostics"]>;
}) {
  const left = diagnostics.cards.filter((c) => c.id !== "fatigue_risk");
  const right = diagnostics.cards.filter((c) => c.id === "fatigue_risk");

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-[15px] font-semibold text-ink">{diagnostics.title}</h2>
        {diagnostics.note ? <p className="text-xs text-muted">{diagnostics.note}</p> : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          {left.map((c) => (
            <DiagCard key={c.id} card={c} />
          ))}
        </div>
        <div className="space-y-5">
          {right.map((c) => (
            <DiagCard key={c.id} card={c} />
          ))}
        </div>
      </div>

      {diagnostics.footnote ? <p className="pt-1 text-xs text-muted">{diagnostics.footnote}</p> : null}
    </section>
  );
}
