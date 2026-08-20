import type { Section } from "@/lib/types";
import { Card, CardTitle } from "./Card";
import MetricBar from "./MetricBar";
import ScoreStat from "./ScoreStat";

/**
 * Renders any section from the payload. `bars` = stacked label/value/bar rows,
 * `columns` = large numerals side by side. Unknown ids still render.
 */
export default function SectionCard({ section, barTone }: { section: Section; barTone?: string | undefined }) {
  return (
    <Card>
      <CardTitle tooltip={section.tooltip}>{section.title}</CardTitle>

      {section.layout === "columns" ? (
        <div
          className={`grid gap-6 ${
            section.metrics.length <= 2 ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4"
          }`}
        >
          {section.metrics.map((m) => (
            <ScoreStat key={m.id} metric={m} />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-line/60">
          {section.metrics.map((m) => (
            <MetricBar key={m.id} metric={m} barTone={barTone} />
          ))}
        </div>
      )}

      {section.footnote ? <p className="mt-5 text-xs leading-relaxed text-muted">{section.footnote}</p> : null}
    </Card>
  );
}
