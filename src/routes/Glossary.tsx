import { useCallback, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { GlossaryPayload, GlossarySection } from "@/lib/types";
import { fetchGlossary } from "@/lib/api";
import { Card, CardTitle } from "@/components/Card";
import EmptyState from "@/components/EmptyState";

/** Only internal profile paths are allowed as a back target. */
function safeBack(from?: string) {
  return from && from.startsWith("/influencers/") ? from : "/";
}

function prettyLabel(label: string) {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bBcts\b/i, "BCTS");
}

export default function Glossary() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") ?? undefined;
  const back = safeBack(from);

  const [data, setData] = useState<GlossaryPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    setStatus("loading");
    setData(null);
    fetchGlossary(ac.signal)
      .then((json) => {
        setData(json);
        setStatus("ready");
      })
      .catch(() => {
        if (ac.signal.aborted) return;
        setStatus("error");
      });
    return () => ac.abort();
  }, [nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    document.title = "Glossary — Creator Trust Profile | ToBe";
  }, []);

  const c = data?.constants ?? null;

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to={back}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        {back === "/" ? "Back" : "Back to profile"}
      </Link>

      <h1 className="mt-4 text-xl font-semibold text-ink">Glossary</h1>
      <p className="mt-1.5 text-sm text-muted">
        What each metric in the Basic Creator Trust Profile means and how it is derived.
      </p>

      {c && (c["LOOKBACK_DAYS"] || c["MIN_ASSETS"] || c["CORPUS_SIZE"]) ? (
        <p className="mt-3 text-xs text-muted">
          Assessment window:{" "}
          {[
            c["LOOKBACK_DAYS"] ? `${c["LOOKBACK_DAYS"]}-day lookback` : null,
            c["CORPUS_SIZE"] ? `corpus size ${c["CORPUS_SIZE"]}` : null,
            c["MIN_ASSETS"] ? `minimum ${c["MIN_ASSETS"]} assessed assets` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}

      <div className="mt-6">
        {status === "loading" && (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-40 animate-pulse p-5" />
            ))}
          </div>
        )}

        {status === "error" && (
          <EmptyState
            title="Glossary Not Available"
            body="Something went wrong while loading the glossary. Please try again."
            onRetry={retry}
          />
        )}

        {status === "ready" && data && (
          <div className="space-y-5">
            {data.sections.map((section) => (
              <SectionBlock key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SectionBlock({ section }: { section: GlossarySection }) {
  const overview = section.items.filter((i) => i.label.toLowerCase() === "overview");
  const terms = section.items.filter((i) => i.label.toLowerCase() !== "overview");

  return (
    <Card>
      <CardTitle>{section.title}</CardTitle>

      {overview.map((i, idx) => (
        <p key={idx} className="-mt-2 mb-4 text-sm leading-relaxed text-muted">
          {i.text}
        </p>
      ))}

      <dl className="divide-y divide-line">
        {terms.map((item, idx) => (
          <div key={`${item.label}-${idx}`} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr] sm:gap-5">
            <dt className="text-sm font-semibold text-ink">{prettyLabel(item.label)}</dt>
            <dd className="text-sm leading-relaxed text-muted">{item.text}</dd>
          </div>
        ))}
      </dl>

      {section.footnote ? (
        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">{section.footnote}</p>
      ) : null}
    </Card>
  );
}
