/**
 * Adapter: maps the upstream creator-trust-service domain model
 * (GET /creator-trust-profile?handle=&platform=) onto the view model this app renders.
 * Anything upstream does not send is simply omitted, so cards disappear instead of breaking.
 */
import type { DiagnosticsCard, Metric, Platform, Section, TrustProfile, Tone } from "./types";

export interface UpstreamProfile {
  key?: string;
  generated_at?: string;
  profile_url?: string;
  identity?: {
    handle?: string;
    platform?: string;
    full_name?: string;
    biography?: string;
    profile_image_url?: string;
    is_verified?: boolean;
    display_name?: string;
    avatar_url?: string;
    country_flag?: string;
    links?: { type?: string; label?: string; url?: string }[];
    linked_accounts?: { platform?: string; handle?: string; followers?: number; media?: number }[];
  };
  trust_profile?: {
    bcts_governed?: number | null;
    bcts_raw?: number | null;
    band?: string | null;
    outcome?: string | null;
    q_score?: number | null;
    i_score?: number | null;
    v_score?: number | null;
    governance_quality?: {
      truth?: number | null;
      context?: number | null;
      disclosure?: number | null;
      responsibility?: number | null;
    } | null;
    assets_assessed?: number | null;
    black_assets?: number | null;
    computed_at?: string | null;
  } | null;
  trust_action_mix?: Record<string, number> | null;
  language_mix?: Record<string, number> | null;
  freshness_fatigue?: {
    evidence_freshness?: number | null;
    content_freshness?: number | null;
    fatigue_risk?: number | null;
    raw?: Record<string, unknown> | null;
  } | null;
  content_overview?: Record<string, number | null> | null;
  languages?: { label: string; count: number }[] | null;
  assets?: any[] | null;
  assessment_date?: string | null;
  window_days?: number | null;
  compliance_risk?: Record<string, number | null> | null;
  meta?: {
    source?: string;
    trust_profile_available?: boolean;
    unavailable_fields?: string[];
  } | null;
  recent_trust_events?: {
    occurred_at?: string;
    severity?: string;
    rule_code?: string;
    recurrent?: boolean;
    summary?: string | null;
  }[];
}

export function isUpstreamPayload(json: unknown): json is UpstreamProfile {
  if (!json || typeof json !== "object") return false;
  const o = json as Record<string, unknown>;
  return "identity" in o || "trust_profile" in o || "bcts_governed" in o;
}

/**
 * Unified schema_version 2 files (creator-trust-unified-v2-<platform>.json) keep every
 * upstream key but regroup the scores. Fold them back onto the upstream shape so a single
 * adapter handles both. `meta.unavailable_fields` is preserved and used to hide cards.
 */
export function normaliseUnified(json: unknown): UpstreamProfile {
  const o = (json ?? {}) as Record<string, any>;
  if (o["schema_version"] !== 2) return o as UpstreamProfile;
  const bcts = o["bcts"] ?? {};
  const scores = o["scores"] ?? {};
  const gc = scores["governance_components"] ?? {};
  const assessment = o["assessment"] ?? {};
  const ff = o["freshness_fatigue"];
  const hasTrust = o["meta"]?.trust_profile_available ?? bcts.score != null;
  return {
    key: o["key"],
    generated_at: o["generated_at"],
    profile_url: o["profile_url"],
    identity: o["identity"],
    trust_profile: hasTrust
      ? {
          bcts_governed: bcts.score ?? null,
          bcts_raw: bcts.score_raw ?? null,
          band: bcts.band ?? null,
          outcome: bcts.verdict ?? null,
          q_score: scores["governance_quality"] ?? null,
          i_score: scores["integrity_intelligence"] ?? null,
          v_score: scores["evidence_confidence"] ?? null,
          governance_quality: {
            truth: gc["truth"] ?? null,
            context: gc["compliance"] ?? null,
            disclosure: gc["disclosure"] ?? null,
            responsibility: gc["responsible"] ?? null,
          },
          assets_assessed: assessment["assets_assessed"] ?? null,
          black_assets: assessment["black_assets"] ?? null,
          computed_at: assessment["computed_at"] ?? null,
        }
      : null,
    trust_action_mix: assessment["trust_action_mix"] ?? null,
    language_mix: assessment["language_mix"] ?? null,
    freshness_fatigue: ff
      ? {
          evidence_freshness: ff["evidence_freshness"] ?? null,
          content_freshness: ff["content_freshness"] ?? null,
          fatigue_risk: ff["fatigue_risk"] ?? null,
          raw: ff["raw"] ?? ff,
        }
      : null,
    content_overview: o["content_overview"] ?? null,
    languages: assessment["languages"] ?? null,
    assets: o["assets"] ?? null,
    assessment_date: assessment["date"] ?? null,
    window_days: assessment["window"]?.days ?? null,
    compliance_risk: o["compliance_risk"] ?? null,
    recent_trust_events: o["recent_trust_events"] ?? [],
    meta: o["meta"] ?? null,
  };
}

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;
const round = (v: number) => Math.round(v * 10) / 10;

function bandTone(band?: string | null): Tone | undefined {
  switch ((band ?? "").toLowerCase()) {
    case "excellent":
    case "strong":
      return "green";
    case "moderate":
    case "mixed":
      return "amber";
    case "weak":
    case "poor":
      return "red";
    default:
      return undefined;
  }
}

function metric(id: string, label: string, value: unknown, extra: Partial<Metric> = {}): Metric | null {
  const v = num(value);
  if (v === undefined) return null;
  return { id, label, value: round(v), ...extra };
}

export function adaptUpstream(raw: UpstreamProfile, fallbackPlatform: Platform): TrustProfile {
  const id = raw.identity ?? {};
  const tp = raw.trust_profile ?? {};
  const gq = tp.governance_quality ?? {};
  const ff = raw.freshness_fatigue ?? null;
  const ffRaw = (ff?.raw ?? {}) as Record<string, unknown>;
  const platform: Platform = (id.platform === "youtube" ? "youtube" : fallbackPlatform) as Platform;
  const handle = id.handle ?? "";

  const explicitLinks = (id.links ?? [])
    .filter((l) => l.url)
    .map((l) => ({
      type: (l.type === "youtube" ? "youtube" : l.type === "instagram" ? "instagram" : "website") as
        | "instagram"
        | "youtube"
        | "website",
      label: l.label ?? l.url!,
      url: l.url!,
    }));

  const derivedLinks = (id.linked_accounts ?? [])
    .filter((a) => a.platform === "instagram" || a.platform === "youtube")
    .map((a) => ({
      type: a.platform as "instagram" | "youtube",
      label: a.platform === "youtube" ? `YouTube @${a.handle ?? handle}` : `Instagram @${a.handle ?? handle}`,
      url:
        a.platform === "youtube"
          ? `https://www.youtube.com/@${a.handle ?? handle}`
          : `https://www.instagram.com/${a.handle ?? handle}/`,
    }));

  const links = explicitLinks.length ? explicitLinks : derivedLinks;

  const mix = raw.trust_action_mix ?? {};
  const languages =
    raw.languages?.length
      ? raw.languages
      : Object.entries(raw.language_mix ?? {}).map(([label, count]) => ({
          label,
          count: Number(count) || 0,
        }));

  const co = raw.compliance_risk ?? {};
  const overview = raw.content_overview ?? {};

  // ---- sections -------------------------------------------------------
  const sections: Section[] = [];

  const core = [
    metric("governance_quality", "Governance Quality", tp.q_score, { tone: "green" }),
    metric("integrity_intelligence", "Integrity Intelligence", tp.i_score, { tone: "green" }),
    metric("evidence_confidence", "Evidence Confidence", tp.v_score, { tone: "green" }),
  ].filter(Boolean) as Metric[];
  if (core.length) {
    sections.push({ id: "core_trust_components", title: "Core Trust Components", layout: "bars", metrics: core });
  }

  const gqMetrics = [
    metric("truth", "Truth & Substantiation (T)", gq.truth),
    metric("compliance", "External Compliance (C)", gq.context),
    metric("disclosure", "Disclosure & Transparency (D)", gq.disclosure),
    metric("responsible", "Responsible Communication (R)", gq.responsibility),
  ].filter(Boolean) as Metric[];
  if (gqMetrics.length) {
    sections.push({
      id: "governance_quality",
      title: num(tp.q_score) !== undefined ? `Governance Quality (Q) ${round(tp.q_score as number)}/100` : "Governance Quality (Q)",
      layout: "columns",
      footnote:
        "Q is the recency-weighted average of Asset Quality Scores (AQS) across all eligible assets.",
      metrics: gqMetrics,
    });
  }

  const complianceMetrics = [
    metric("compliance_score", "Compliance Score", co["compliance_score"], {
      caption: `${num(co["compliant"]) ?? 0} compliant · ${num(co["partially_compliant"]) ?? 0} partial · ${num(co["non_compliant"]) ?? 0} non-compliant`,
    }),
    metric("verified_assets", "Assets Verified", co["verified"], {
      max: num(co["verified"]) || 100,
      caption: `${num(co["sponsored"]) ?? 0} sponsored · ${num(co["sponsored_compliant"]) ?? 0} sponsored compliant`,
    }),
  ].filter(Boolean) as Metric[];
  if (complianceMetrics.length) {
    sections.push({ id: "compliance_risk", title: "Compliance & Risk", layout: "bars", metrics: complianceMetrics });
  }

  const reach = [
    metric("engagement_followers", "Engagement Rate (followers)", overview["engagement_rate_followers"], {
      max: 10,
      caption: `${num(overview["followers"]) ?? 0} followers`,
    }),
    metric("engagement_views", "Engagement Rate (views)", overview["engagement_rate_views"], { max: 10 }),
    metric("posts_per_week", "Posts per Week", overview["posts_per_week"], {
      max: 7,
      caption: `${num(overview["posts_tracked"]) ?? 0} posts tracked of ${num(overview["media_count"]) ?? 0}`,
    }),
  ].filter(Boolean) as Metric[];
  if (reach.length) {
    sections.push({ id: "content_overview", title: "Content & Reach", layout: "bars", metrics: reach });
  }

  // ---- diagnostics ----------------------------------------------------
  const cards: DiagnosticsCard[] = [];
  if (ff) {
    const efAge = num(ffRaw["newest_asset_age_days"]);
    const efMetrics = [
      metric("ef", "EF", ff.evidence_freshness, {
        caption: efAge !== undefined ? `Newest asset ${round(efAge)} days old` : undefined,
      }),
    ].filter(Boolean) as Metric[];
    if (efMetrics.length) {
      cards.push({
        id: "evidence_freshness",
        title: "Evidence freshness",
        badge: (ffRaw["evidence_freshness_band"] as string) || undefined,
        metrics: efMetrics,
      });
    }

    const cfMetrics = [
      metric("cf", "CF", ff.content_freshness),
      metric("originality", "ORIGINALITY", ffRaw["originality"]),
      metric("topic_diversity", "TOPIC DIVERSITY", ffRaw["topic_diversity"]),
    ].filter(Boolean) as Metric[];
    if (cfMetrics.length) {
      cards.push({
        id: "content_freshness",
        title: "Content freshness",
        badge: (ffRaw["content_freshness_band"] as string) || undefined,
        metrics: cfMetrics,
      });
    }

    const frMetrics = [
      metric("fr", "FR", ff.fatigue_risk),
      metric("cadence", "CADENCE", ffRaw["cadence_pressure"]),
      metric("commercial", "COMMERCIAL", ffRaw["commercial_density"]),
      metric("repetition", "REPETITION", ffRaw["repetition_load"]),
    ].filter(Boolean) as Metric[];
    if (frMetrics.length) {
      cards.push({
        id: "fatigue_risk",
        title: "Fatigue risk",
        badge: (ffRaw["fatigue_risk_band"] as string) || "INSUFFICIENT DATA",
        metrics: frMetrics,
      });
    }
  }

  // Respect the explicit unavailability list emitted by the unified schema.
  const hidden = new Set(raw.meta?.unavailable_fields ?? []);
  const hiddenMetricIds = new Set<string>();
  if (hidden.has("scores.evidence_confidence")) hiddenMetricIds.add("evidence_confidence");
  if (hidden.has("scores.governance_quality")) hiddenMetricIds.add("governance_quality");
  if (hidden.has("scores.integrity_intelligence")) hiddenMetricIds.add("integrity_intelligence");
  const visibleSections = sections
    .map((s) => ({ ...s, metrics: s.metrics.filter((m) => !hiddenMetricIds.has(m.id)) }))
    .filter((s) => s.metrics.length > 0);

  const corpus = (ffRaw["corpus"] ?? {}) as Record<string, number>;
  const assessmentDate = raw.assessment_date ?? tp.computed_at ?? raw.generated_at ?? "";
  const windowDays =
    num(raw.window_days) ?? num(corpus["span_days"]) ?? num(corpus["lookback_days"]) ?? 0;
  const to = assessmentDate ? assessmentDate.slice(0, 10) : "";
  const from =
    to && windowDays
      ? new Date(new Date(to).getTime() - windowDays * 86400000).toISOString().slice(0, 10)
      : "";

  return {
    schema_version: 1,
    handle,
    platform,
    profile: {
      display_name: id.display_name || id.full_name || handle,
      // Exports sometimes bake the flag emoji into the name; avoid showing it twice.
      country_flag: hasFlagEmoji(id.display_name || id.full_name || "") ? undefined : id.country_flag,
      avatar_url: id.avatar_url || id.profile_image_url || undefined,
      links,
    },
    assessment: {
      date: to,
      window: { from, to, days: windowDays },
      assets_assessed: [{ platform, count: num(tp.assets_assessed) ?? num(overview["posts_tracked"]) ?? 0 }],
      languages,
      languages_note: languages.length ? `${languages.length} language(s) across assessed assets` : undefined,
      action_mix: {
        green: Number(mix["GREEN"] ?? 0),
        grey: Number(mix["GREY"] ?? 0),
        black: Number(mix["BLACK"] ?? tp.black_assets ?? 0),
      },
    },
    bcts: {
      score: round(num(tp.bcts_governed) ?? num(tp.bcts_raw) ?? 0),
      verdict: prettyVerdict(tp.outcome ?? tp.band ?? "not assessed"),
      tone: bandTone(tp.band),
    },
    trust_profile_available: raw.meta?.trust_profile_available ?? Boolean(raw.trust_profile),
    sections: visibleSections,
    diagnostics: cards.length
      ? { title: "Freshness & fatigue", note: "Diagnostic only — not part of the trust score", cards }
      : undefined,
    assets: (raw.assets ?? []) as TrustProfile["assets"],
    meta: { generated_at: raw.generated_at, source: "creator-trust-service" },
  };
}

/** "SUITABLE_WITH_CONTROLS" -> "SUITABLE WITH CONTROLS" */
function prettyVerdict(value: string) {
  return value.replace(/[_-]+/g, " ").trim().toUpperCase();
}

function hasFlagEmoji(value: string) {
  return /[\u{1F1E6}-\u{1F1FF}]/u.test(value);
}
