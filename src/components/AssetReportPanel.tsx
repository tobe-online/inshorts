import { useState } from "react";
import type { AssetRow } from "@/lib/types";

const DOT: Record<string, string> = {
  GREEN: "#16a34a",
  GREY: "#c9c9c2",
  BLACK: "#111111",
};

function Section({
  title,
  children,
  inner,
}: {
  title: string;
  children: React.ReactNode;
  inner?: boolean;
}) {
  return (
    <section className={inner ? "pt-4" : "border-t border-line pt-4"}>
      <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted">{title}</h3>
      <div className="mt-2 text-sm text-ink">{children}</div>
    </section>
  );
}


function Chips({ items }: { items: string[] }) {


  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-4 text-sm">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function Claims({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, 4);
  return (
    <div>
      <ul className="space-y-2.5">
        {shown.map((raw, i) => {
          const idx = raw.indexOf(" — ");
          const claim = idx === -1 ? raw : raw.slice(0, idx);
          return (
            <li key={`${i}-${claim}`} className="text-sm text-ink">
              {claim}
            </li>
          );
        })}
      </ul>
      {items.length > 4 ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 text-xs font-medium text-good hover:underline"
        >
          {open ? "Show fewer claims" : `Show all ${items.length} claims`}
        </button>
      ) : null}
    </div>
  );
}
export default function AssetReportPanel({ asset }: { asset: AssetRow }) {

  const d = asset.decision_explainability;
  const label = (asset.trust_action ?? asset.action ?? "").toUpperCase();
  const url = asset.post_url ?? asset.url ?? "";
  const assessed = asset.assessed_at ?? d?.generated_at;

  return (

    <div className="flex flex-col gap-4 pb-6">
      <div className="space-y-2">
        {d?.final_decision_score !== undefined && d?.final_decision_score !== null ? (
          <p className="text-2xl font-semibold text-ink">
            {d.final_decision_score}
          </p>
        ) : null}

        {label ? (
          <span className="flex items-center gap-2 text-xs font-medium text-ink">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DOT[label] ?? DOT["GREY"] }}
            />
            {label}
            {d?.recommended_action ? (
              <span className="text-muted">· {d.recommended_action}</span>
            ) : null}
          </span>
        ) : null}

        {url ? (
          <a

            href={url}
            target="_blank"
            rel="noreferrer"
            className="block break-all text-xs font-medium text-good hover:underline"
          >
            {url}
          </a>
        ) : null}

        {assessed ? (
          <p className="text-xs text-muted">
            Assessed {new Date(assessed).toLocaleString("en-GB")}
          </p>
        ) : null}
      </div>

      {!d ? (
        <p className="border-t border-line pt-4 text-sm text-muted">
          No report details available yet for this asset.
        </p>
      ) : (
        <section className="border-t border-line pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink">
            Decision Explainability
          </h3>

          <div className="mt-4 space-y-4">
            {d.summary ? (
              <Section title="Summary" inner>
                <p className="leading-relaxed">{d.summary}</p>
              </Section>
            ) : null}

            {d.what_was_claimed?.length ? (
              <Section title="What was claimed" inner>
                <Claims items={d.what_was_claimed} />
              </Section>
            ) : null}

            {d.risk_drivers?.length ? (
              <Section title="Risk drivers" inner>
                <Chips items={d.risk_drivers} />
              </Section>
            ) : null}

            {d.regulatory_triggers?.length ? (
              <Section title="Regulatory triggers" inner>
                <Bullets items={d.regulatory_triggers} />
              </Section>
            ) : null}

            {d.evidence_status?.status || d.evidence_status?.reason ? (
              <Section title="Evidence status" inner>
                {d.evidence_status.status ? (
                  <span className="inline-block rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink">
                    {d.evidence_status.status}
                  </span>
                ) : null}
                {d.evidence_status.reason ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {d.evidence_status.reason}
                  </p>
                ) : null}
              </Section>
            ) : null}

            {d.revision_guidance?.length ? (
              <Section title="Revision guidance" inner>
                <Bullets items={d.revision_guidance} />
              </Section>
            ) : null}
          </div>
        </section>
      )}

    </div>
  );
}
