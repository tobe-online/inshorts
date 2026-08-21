import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { Platform, TrustProfile } from "@/lib/types";
import { ProfileNotFoundError, fetchProfile } from "@/lib/api";
import { Card, CardTitle } from "@/components/Card";
import DonutGauge from "@/components/DonutGauge";
import SectionCard from "@/components/SectionCard";
import IdentityCard from "@/components/IdentityCard";
import DiagnosticsSection from "@/components/DiagnosticsSection";
import PlatformPerformanceCard from "@/components/PlatformPerformanceCard";
import ComplianceOverviewCard from "@/components/ComplianceOverviewCard";
import ProfileSkeleton from "@/components/ProfileSkeleton";
import EmptyState from "@/components/EmptyState";
import AssetsTable from "@/components/AssetsTable";

const PLATFORMS: Platform[] = ["instagram", "youtube"];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InfluencerProfile() {
  const { handle = "" } = useParams();
  const [search] = useSearchParams();
  const raw = search.get("platform");
  const platform = (PLATFORMS.includes(raw as Platform) ? (raw as Platform) : null) as Platform | null;

  const [data, setData] = useState<TrustProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound" | "error">("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!handle || !platform) {
      setStatus("notfound");
      setData(null);
      return;
    }
    const ac = new AbortController();
    setStatus("loading");
    setData(null);

    fetchProfile(handle, platform, ac.signal)
      .then((json) => {
        setData(json);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setStatus(err instanceof ProfileNotFoundError ? "notfound" : "error");
      });

    return () => ac.abort();
  }, [handle, platform, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    document.title = data
      ? `${data.profile.display_name} — Basic Creator Trust Profile`
      : "Basic Creator Trust Profile — ToBe";
  }, [data]);

  const [summary, ...detail] = splitSections(data);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="flex items-center gap-2.5 text-xl font-semibold text-ink">
        <span className="text-good">
          <ShieldIcon />
        </span>
        Basic Creator Trust Profile
      </h1>

      <div className="mt-6">
        {status === "loading" && <ProfileSkeleton />}

        {status === "notfound" && (
          <EmptyState
            title="Profile Not Available"
            body={
              platform
                ? `We could not find a trust profile for @${handle} on ${platform}.`
                : "Add ?platform=instagram or ?platform=youtube to this profile URL."
            }
          />
        )}

        {status === "error" && (
          <EmptyState
            title="Profile Not Available"
            body="Something went wrong while loading this profile. Please try again."
            onRetry={retry}
          />
        )}

        {status === "ready" && data && (
          <div className="space-y-5">
            {data.trust_profile_available === false && (
              <div className="card border-line px-4 py-3 text-sm text-muted">
                Trust profile not yet computed for @{data.handle} on {data.platform}. Showing
                identity and content data only.
              </div>
            )}

            <IdentityCard data={data} />

            {data.trust_profile_available === false ? (
              <div className="grid gap-5 lg:grid-cols-3">
                {data.sections.map((s) => (
                  <SectionCard key={s.id} section={s} />
                ))}
              </div>
            ) : (
            <>
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1.6fr]">
              <Card className="flex flex-col">
                <CardTitle tooltip={data.bcts.tooltip}>Basic Creator Trust Score (BCTS)</CardTitle>
                <div className="flex flex-1 items-center justify-center">
                  <DonutGauge
                    value={data.bcts.score}
                    verdict={data.bcts.verdict}
                    tone={data.bcts.tone}
                  />
                </div>
              </Card>

              {summary ? <SectionCard section={summary} barTone="#16a34a" /> : <div />}
              {detail[0] ? <SectionCard section={detail[0]} /> : <div />}
            </div>

            {detail.length > 1 && (
              <div className="grid gap-5 lg:grid-cols-3">
                {detail.slice(1).map((s) => (
                  <SectionCard key={s.id} section={s} />
                ))}
              </div>
            )}
            </>
            )}

            {data.diagnostics ? <DiagnosticsSection diagnostics={data.diagnostics} /> : null}

{(data.platform_performance?.length || data.compliance_overview?.length) && (
              <div className="grid gap-5 lg:grid-cols-2">
                {data.platform_performance?.length ? (
                  <PlatformPerformanceCard rows={data.platform_performance} />
                ) : null}
                {data.compliance_overview?.length ? (
                  <ComplianceOverviewCard rows={data.compliance_overview} />
                ) : null}
              </div>
            )}

            {data.assets?.length ? <AssetsTable assets={data.assets} /> : null}

            {data.meta?.generated_at ? (
              <p className="pt-2 text-xs text-muted">
                Generated {new Date(data.meta.generated_at).toLocaleString("en-GB")}
                {data.meta.source ? ` · ${data.meta.source}` : ""}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}

/** Sections render in payload order: first goes beside the gauge, the rest fill the grids. */
function splitSections(data: TrustProfile | null) {
  return data?.sections ?? [];
}
