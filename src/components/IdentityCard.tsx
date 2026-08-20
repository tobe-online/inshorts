import type { TrustProfile } from "@/lib/types";
import { formatDate, joinCounts } from "@/lib/format";
import ActionMixBar from "./ActionMixBar";

const FLAGS: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", AE: "🇦🇪", SG: "🇸🇬" };

function getLinkPlatform(label: string, url: string): "instagram" | "youtube" | null {
  const text = `${label} ${url}`.toLowerCase();
  if (text.includes("instagram") || text.includes("insta")) return "instagram";
  if (text.includes("youtube") || text.includes("youtu")) return "youtube";
  return null;
}

function PlatformIcon({ platform }: { platform: "instagram" | "youtube" }) {
  if (platform === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
        <path d="M23 12s0-3.5-.45-5.17a2.9 2.9 0 0 0-2.04-2.05C18.83 4.33 12 4.33 12 4.33s-6.83 0-8.51.45A2.9 2.9 0 0 0 1.45 6.83 30 30 0 0 0 1 12a30 30 0 0 0 .45 5.17 2.9 2.9 0 0 0 2.04 2.05c1.68.45 8.51.45 8.51.45s6.83 0 8.51-.45a2.9 2.9 0 0 0 2.04-2.05C23 15.5 23 12 23 12zM9.8 15.3V8.7l5.7 3.3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-0.5 text-sm font-semibold text-ink">{children}</div>
    </div>
  );
}

export default function IdentityCard({ data }: { data: TrustProfile }) {
  const { profile, assessment } = data;
  const assets = assessment.assets_assessed
    .map((a) => `${a.platform} ${a.count}`)
    .join(" · ");

  return (
    <section className="card p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="flex gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="h-20 w-16 flex-shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="h-20 w-16 flex-shrink-0 rounded-lg bg-[#eeeeea]" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-base font-semibold text-ink">
              <span className="truncate">{profile.display_name}</span>
              {profile.country_flag ? <span>{FLAGS[profile.country_flag] ?? profile.country_flag}</span> : null}
            </p>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {profile.links.map((l) => {
                const platform = getLinkPlatform(l.label, l.url);
                return (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
                  >
                    {platform === "youtube" && (
                      <span className="text-[#FF0000]">
                        <PlatformIcon platform="youtube" />
                      </span>
                    )}
                    {platform === "instagram" && (
                      <span className="text-[#E1306C]">
                        <PlatformIcon platform="instagram" />
                      </span>
                    )}
                    <span className="truncate">{l.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Field label="Assessment Date">{formatDate(assessment.date)}</Field>
          <Field label="Assets Assessed">{assets || "—"}</Field>
        </div>

        <div className="space-y-5">
          <Field label="Assessment Window">
            {formatDate(assessment.window.from)} – {formatDate(assessment.window.to)}
            <span className="ml-1 text-xs font-normal text-muted">({assessment.window.days} days)</span>
          </Field>
          <Field label="Market / Language">
            <span className="block">{joinCounts(assessment.languages)}</span>
            {assessment.languages_note ? (
              <span className="mt-0.5 block text-xs font-normal text-muted">{assessment.languages_note}</span>
            ) : null}
          </Field>
        </div>

        <div className="flex items-center border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="w-full">
            <ActionMixBar mix={assessment.action_mix} />
          </div>
        </div>
      </div>
    </section>
  );
}
