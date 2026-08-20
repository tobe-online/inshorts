import { Card, CardTitle } from "./Card";

export type Facts = Record<string, string | number | null | undefined>;

const LABELS: Record<string, string> = {
  followers: "Followers",
  subscribers: "Subscribers",
  engagement_rate: "Engagement rate",
  avg_views: "Avg. views",
  posts_per_week: "Posts / week",
  videos_per_week: "Videos / week",
  compliance_score: "Compliance score",
  verified_count: "Verified",
  compliant_count: "Compliant",
  needs_review_count: "Needs review",
  non_compliant_count: "Non-compliant",
  sponsored_count: "Sponsored",
  content_freshness: "Content freshness",
  originality_score: "Originality score",
  topic_diversity: "Topic diversity",
};

function label(key: string) {
  return LABELS[key] ?? key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function format(value: string | number) {
  return typeof value === "number" ? value.toLocaleString("en-GB") : value;
}

/** Renders a flat key/value block (content overview, compliance summary, diagnostics). */
export default function FactsCard({ title, facts }: { title: string; facts: Facts }) {
  const rows = Object.entries(facts).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!rows.length) return null;

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <dl className="divide-y divide-line/60">
        {rows.map(([key, value]) => (
          <div key={key} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-sm text-muted">{label(key)}</dt>
            <dd className="text-right text-sm font-semibold tabular-nums text-ink">
              {format(value as string | number)}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
