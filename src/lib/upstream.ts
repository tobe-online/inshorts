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
  platform_performance?: {
    platform?: string;
    handle?: string;
    followers?: number | null;
    posts?: number | null;
    engagementRate?: number | null;
    avgViews?: number | null;
  }[] | null;
  meta?: {
    source?: string;
    trust_profile_available?: boolean;
    unavailable_fields?: string[];
  } | null;
  /** schema_version 3 published breakdown blocks. */
  integrity?: Record<string, unknown> | null;
  evidence?: Record<string, unknown> | null;
  wow?: Record<string, unknown> | null;
  scores?: Record<string, unknown> | null;
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
  const version = o["schema_version"];
  // v2 and v3 share every block below; v3 adds integrity/evidence/wow.
  if (version !== 2 && version !== 3) return o as UpstreamProfile;
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
          raw: { ...ff, ...(ff["raw"] ?? {}) },
        }
      : null,
    content_overview: o["content_overview"] ?? null,
    languages: assessment["languages"] ?? null,
    assets: o["assets"] ?? null,
    assessment_date: assessment["date"] ?? null,
    window_days: assessment["window"]?.days ?? null,
    compliance_risk: o["compliance_risk"] ?? null,
    platform_performance: o["platform_performance"] ?? null,
    recent_trust_events: o["recent_trust_events"] ?? [],
    meta: o["meta"] ?? null,
    integrity: o["integrity"] ?? null,
    evidence: o["evidence"] ?? null,
    wow: o["wow"] ?? null,
    scores: scores ?? null,
  };
}

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

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
  return { id, label, value: Math.round(v), ...extra };
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
  const languages = (
    raw.languages?.length
      ? raw.languages
      : Object.entries(raw.language_mix ?? {}).map(([label, count]) => ({
          label,
          count: Number(count) || 0,
        }))
  ).slice().sort((a, b) => b.count - a.count);

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
      title: num(tp.q_score) !== undefined ? `Governance Quality (Q) ${Math.round(tp.q_score as number)}/100` : "Governance Quality (Q)",
      layout: "columns",
      footnote:
        "Q is the recency-weighted average of Asset Quality Scores (AQS) across all eligible assets.",
      metrics: gqMetrics,
    });
  }

  // ---- I / V / W breakdown cards ---------------------------------------
  // schema_version 3 publishes integrity/evidence/wow blocks directly; older
  // exports only carry headline scores, so the sub-components are derived.
  const integrityBlock = raw.integrity ?? null;
  const evidenceBlock = raw.evidence ?? null;
  const wowBlock = raw.wow ?? null;

  const iRows = integrityBlock ? publishedIntegrityRows(integrityBlock) : buildIntegrityRows(raw);
  sections.push({
    id: "integrity_breakdown",
    title: scoreTitle("Integrity Intelligence (I)", num(integrityBlock?.["i_score"]) ?? tp.i_score),
    layout: "bars",
    metrics: iRows,
    footnote: integrityBlock
      ? "Published sub-components from the creator trust service."
      : "Sub-components derived from the published action mix and recent trust events.",
  });

  const vRows = evidenceBlock ? publishedEvidenceRows(evidenceBlock) : buildEvidenceRows(raw, ffRaw);
  sections.push({
    id: "evidence_breakdown",
    title: scoreTitle(
      "Evidence Confidence (V)",
      num(evidenceBlock?.["v"]) ?? tp.v_score ?? averageOf(vRows),
    ),
    layout: "bars",
    metrics: vRows,
    footnote: evidenceBlock
      ? "Published sub-components from the evidence corpus."
      : "Sub-components derived from the published evidence corpus.",
  });

  const wowScore = num(raw.scores?.["wow_creative"]) ?? null;
  sections.push({
    id: "wow_breakdown",
    title: scoreTitle("WoW Creative Intelligence (W)", wowScore),
    layout: "bars",
    metrics: wowBlock ? publishedWowRows(wowBlock) : buildWowRows(raw),
    footnote: wowBlock
      ? "Creative intelligence across asset quality, resonance and delivery."
      : "Creative intelligence is not published in this export yet.",
  });

  // ---- diagnostics ----------------------------------------------------
  const cards: DiagnosticsCard[] = [];
  const int = (v: unknown) => {
    const n = num(v);
    return n === undefined ? undefined : Math.round(n);
  };
  const statValue = (v: unknown) => {
    const n = int(v);
    return n === undefined ? "NA" : n;
  };

  if (ff) {
    const efAge = num(ffRaw["newest_asset_age_days"]);
    const newest = ffRaw["newest_evidence_at"] as string | undefined;
    const efCaption = [
      newest ? `Newest asset ${formatShortDate(newest)}` : null,
      efAge !== undefined ? `${Math.round(efAge)} days old` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    const efMetrics = [
      metric("ef", "EF", ff.evidence_freshness, { caption: efCaption || undefined }),
    ].filter(Boolean) as Metric[];
    if (efMetrics.length) {
      cards.push({
        id: "evidence_freshness",
        title: "Evidence freshness",
        badge: (ffRaw["evidence_freshness_band"] as string) || undefined,
        metrics: efMetrics,
      });
    }

    const cfMetrics = [metric("cf", "CF", ff.content_freshness)].filter(Boolean) as Metric[];
    if (cfMetrics.length) {
      cards.push({
        id: "content_freshness",
        title: "Content freshness",
        badge: (ffRaw["content_freshness_band"] as string) || undefined,
        metrics: cfMetrics,
        stats: [
          { id: "originality", label: "Originality", value: statValue(ffRaw["originality"]) },
          { id: "format_diversity", label: "Format div.", value: statValue(ffRaw["format_diversity"]) },
          { id: "topic_diversity", label: "Topic div.", value: statValue(ffRaw["topic_diversity"]) },
        ],
      });
    }

    const frMetrics = [metric("fr", "FR", ff.fatigue_risk)].filter(Boolean) as Metric[];
    if (frMetrics.length) {
      const coverage = int(ffRaw["fr_diagnostic_coverage"]);
      cards.push({
        id: "fatigue_risk",
        title: "Fatigue risk",
        badge: (ffRaw["fatigue_risk_band"] as string) || "INSUFFICIENT DATA",
        metrics: frMetrics,
        stats: [
          { id: "cadence", label: "Cadence", value: statValue(ffRaw["cadence_pressure"]) },
          { id: "commercial", label: "Commercial", value: statValue(ffRaw["commercial_density"]) },
          { id: "repetition", label: "Repetition", value: statValue(ffRaw["repetition_load"]) },
          { id: "response_decay", label: "Response decay", value: statValue(ffRaw["response_decay"]) },
        ],
        footnote: coverage !== undefined ? `Coverage ${coverage}%` : undefined,
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
      score: Math.round(num(tp.bcts_governed) ?? num(tp.bcts_raw) ?? 0),
      verdict: prettyVerdict(tp.outcome ?? tp.band ?? "not assessed"),
      tone: bandTone(tp.band),
    },
    trust_profile_available: raw.meta?.trust_profile_available ?? Boolean(raw.trust_profile),
    sections: visibleSections,
    diagnostics: cards.length
      ? {
          title: "Freshness & fatigue",
          note: "Diagnostic only — not part of the trust score",
          footnote:
            "Scores and recommendations are based on ToBe Basic Phase 1 methodology (launch hypothesis) and are subject to calibration and future enhancement.",
          cards,
        }
      : undefined,
    assets: (raw.assets ?? []) as TrustProfile["assets"],
    platform_performance: buildPlatformPerformance(raw, platform),
    compliance_overview: buildComplianceOverview(raw),
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


function formatShortDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function compactNumber(value: unknown): string | undefined {
  const n = num(value);
  if (n === undefined) return undefined;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

const PLATFORM_ORDER = ["instagram", "youtube", "facebook"];

function buildPlatformPerformance(raw: UpstreamProfile, primary: Platform) {
  const rows = raw.platform_performance ?? [];
  const overview = raw.content_overview ?? {};
  return PLATFORM_ORDER.map((platform) => {
    const row = rows.find((r) => r.platform === platform);
    if (!row) return { platform, connected: false };
    const erSource =
      platform === primary && num(overview["engagement_rate_followers"]) !== undefined
        ? num(overview["engagement_rate_followers"])
        : num(row.engagementRate);
    return {
      platform,
      handle: row.handle,
      connected: true,
      followers: compactNumber(row.followers),
      engagement_rate: erSource === undefined ? undefined : `${erSource.toFixed(2)}%`,
      avg_views: compactNumber(row.avgViews ?? overview["avg_views"]),
    };
  });
}

function buildComplianceOverview(raw: UpstreamProfile): TrustProfile["compliance_overview"] {
  const cr = raw.compliance_risk;
  if (!cr) return undefined;
  const events = raw.recent_trust_events ?? [];
  const verified = num(cr["verified"]) ?? 0;
  const assessed = num(raw.trust_profile?.assets_assessed) ?? verified;
  const flags = (num(cr["non_compliant"]) ?? 0) + (num(cr["partially_compliant"]) ?? 0);
  const risky = events.filter((e) => ["S3", "S4"].includes((e.severity ?? "").toUpperCase())).length;
  return [
    { id: "verified", label: "Posts Verified", value: `${verified} / ${assessed}`, icon: "check" },
    {
      id: "compliance_score",
      label: "Compliance Score",
      value: `${Math.round(num(cr["compliance_score"]) ?? 0)}/100`,
      icon: "check",
    },
    { id: "flags", label: "Total Compliance Flags", value: String(flags), icon: "flag" },
    {
      id: "sponsored_disclosure",
      label: "Sponsored Posts with Disclosure",
      value: String(num(cr["sponsored_compliant"]) ?? 0),
      icon: "tag",
    },
    { id: "risk_content", label: "Potential Risk Content", value: String(risky), icon: "alert" },
    { id: "violations", label: "Policy Violations", value: String(events.length), icon: "alert" },
  ];
}

// ---- I / V / W helpers -------------------------------------------------

/** Titles like "Integrity Intelligence (I) 72/100", falling back to the bare label. */
function scoreTitle(label: string, score: unknown) {
  const n = num(score);
  return n === undefined ? label : `${label} ${Math.round(n)}/100`;
}

/** NA-tolerant metric: keeps the row visible with a null value when data is absent. */
function naMetric(id: string, label: string, value: number | null, extra: Partial<Metric> = {}): Metric {
  return { id, label, value: value === null ? null : Math.round(value), ...extra };
}

function averageOf(metrics: Metric[]): number | null {
  const vals = metrics.map((m) => m.value).filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

const SEVERITY_CEILING: Record<string, number> = { S1: 95, S2: 90, S3: 70, S4: 40 };

function buildIntegrityRows(raw: UpstreamProfile): Metric[] {
  const mix = (raw.trust_action_mix ?? {}) as Record<string, unknown>;
  const green = num(mix["GREEN"]) ?? num(mix["green"]) ?? 0;
  const grey = num(mix["GREY"]) ?? num(mix["grey"]) ?? 0;
  const black = num(mix["BLACK"]) ?? num(mix["black"]) ?? 0;
  const total = green + grey + black;

  const events = raw.recent_trust_events ?? [];
  const severities = events.map((e) => (e.severity ?? "").toUpperCase()).filter((s) => s in SEVERITY_CEILING);
  const worst = severities.sort((a, b) => Number(b.slice(1)) - Number(a.slice(1)))[0];
  const severityControl = events.length === 0 ? 100 : worst ? SEVERITY_CEILING[worst]! : null;

  const recurrent = events.filter((e) => e.recurrent === true).length;
  const repeatRisk = events.length ? 100 - (100 * recurrent) / events.length : 100;

  const asOf = raw.assessment_date ?? raw.trust_profile?.computed_at ?? raw.generated_at ?? null;
  const asOfMs = asOf ? new Date(asOf).getTime() : Number.NaN;
  const recent = events.filter((e) => {
    const t = e.occurred_at ? new Date(e.occurred_at).getTime() : Number.NaN;
    if (Number.isNaN(t) || Number.isNaN(asOfMs)) return false;
    return (asOfMs - t) / 86400000 <= 30;
  }).length;
  const recentStability = Number.isNaN(asOfMs) ? null : Math.max(0, 100 - recent * 5);

  return [
    naMetric("green_consistency", "Green Consistency", total ? (100 * green) / total : null, {
      caption: total ? `${green} of ${total} assets green` : undefined,
    }),
    naMetric("severity_control", "Severity Control", severityControl, {
      caption: worst ? `Worst severity ${worst}` : "No severity events",
    }),
    naMetric("repeat_risk_control", "Repeat-Risk Control", repeatRisk, {
      caption: events.length ? `${recurrent} of ${events.length} events recurrent` : undefined,
    }),
    naMetric("recent_stability", "Recent Stability", recentStability, {
      caption: recentStability === null ? undefined : `${recent} events in last 30 days`,
    }),
  ];
}

const SAMPLE_TARGET = 30;
const COVERAGE_TARGET_DAYS = 180;

function buildEvidenceRows(raw: UpstreamProfile, ffRaw: Record<string, unknown>): Metric[] {
  const corpus = (ffRaw["corpus"] ?? {}) as Record<string, unknown>;
  const assessed = num(raw.trust_profile?.assets_assessed) ?? num(corpus["asset_count"]);
  const span = num(corpus["span_days"]);
  const freshness = num(raw.freshness_fatigue?.evidence_freshness);
  const age = num(ffRaw["newest_asset_age_days"]);

  return [
    naMetric(
      "sample_adequacy",
      "Sample Adequacy",
      assessed === undefined ? null : Math.min(100, (100 * assessed) / SAMPLE_TARGET),
      { caption: assessed === undefined ? undefined : `${assessed} / ${SAMPLE_TARGET} assets` },
    ),
    naMetric(
      "temporal_coverage",
      "Temporal Coverage",
      span === undefined ? null : Math.min(100, (100 * span) / COVERAGE_TARGET_DAYS),
      { caption: span === undefined ? undefined : `${Math.round(span)} days (max ${COVERAGE_TARGET_DAYS})` },
    ),
    naMetric("evidence_freshness_v", "Evidence Freshness", freshness ?? null, {
      caption: age === undefined ? undefined : `Latest asset ${Math.round(age)} days ago`,
    }),
  ];
}

function buildWowRows(raw: UpstreamProfile): Metric[] {
  const w = ((raw as any)?.scores?.wow_components ?? {}) as Record<string, unknown>;
  const band = (v: number | null) =>
    v === null ? undefined : v >= 70 ? "Strong" : v >= 50 ? "Moderate" : "Weak";
  const row = (id: string, label: string, key: string) => {
    const v = num(w[key]) ?? null;
    return naMetric(id, label, v, { caption: band(v) });
  };
  return [
    row("asset_wow", "Asset WoW (Median)", "asset_wow"),
    row("creative_resonance", "Creative Resonance", "creative_resonance"),
    row("delivery_architecture", "Delivery Architecture", "delivery_architecture"),
  ];
}

// ---- schema_version 3: published I / V / W rows -------------------------

/** Maps a published band label ("Strong" | "Moderate" | "Weak") onto a tone. */
function labelTone(label: unknown): Tone | undefined {
  return bandTone(typeof label === "string" ? label : null);
}

function publishedIntegrityRows(block: Record<string, unknown>): Metric[] {
  const val = (key: string) => num(block[key]) ?? null;
  return [
    naMetric("green_consistency", "Green Consistency", val("green_consistency")),
    naMetric("severity_control", "Severity Control", val("severity_control")),
    naMetric("repeat_risk_control", "Repeat-Risk Control", val("repeat_risk_control")),
    naMetric("recent_stability", "Recent Stability", val("recent_stability")),
  ];
}

function publishedEvidenceRows(block: Record<string, unknown>): Metric[] {
  const assessed = num(block["assets_assessed"]);
  const ideal = num(block["ideal_corpus_size"]);
  const span = num(block["span_days"]);
  const lookback = num(block["lookback_days"]);
  const age = num(block["newest_asset_age_days"]);

  return [
    naMetric("sample_adequacy", "Sample Adequacy", num(block["sample_adequacy"]) ?? null, {
      caption:
        assessed !== undefined && ideal !== undefined
          ? `${assessed} / ${ideal} assets`
          : assessed !== undefined
            ? `${assessed} assets`
            : undefined,
    }),
    naMetric("temporal_coverage", "Temporal Coverage", num(block["temporal_coverage"]) ?? null, {
      caption:
        span !== undefined
          ? `${Math.round(span)} days${lookback !== undefined ? ` (lookback ${Math.round(lookback)})` : ""}`
          : undefined,
    }),
    naMetric("evidence_freshness_v", "Evidence Freshness", num(block["evidence_freshness"]) ?? null, {
      caption: age === undefined ? undefined : `Latest asset ${Math.round(age)} days ago`,
    }),
  ];
}

function publishedWowRows(block: Record<string, unknown>): Metric[] {
  const row = (id: string, label: string, key: string) => {
    const value = num(block[key]) ?? null;
    const bandLabel = block[`${key}_label`];
    return naMetric(id, label, value, {
      caption: typeof bandLabel === "string" ? bandLabel : undefined,
      ...(labelTone(bandLabel) ? { tone: labelTone(bandLabel)! } : {}),
    });
  };
  return [
    row("wow_median", "Asset WoW (Median)", "wow_median"),
    row("wow_resonance", "Creative Resonance", "wow_resonance"),
    row("wow_delivery", "Delivery Architecture", "wow_delivery"),
  ];
}
