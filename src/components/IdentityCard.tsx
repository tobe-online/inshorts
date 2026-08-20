import type { TrustProfile } from "@/lib/types";
import { formatDate, joinCounts } from "@/lib/format";
import ActionMixBar from "./ActionMixBar";

const FLAGS: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", AE: "🇦🇪", SG: "🇸🇬" };

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
            <div className="mt-1.5 flex flex-col gap-1">
              {profile.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  {l.label}
                </a>
              ))}
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
