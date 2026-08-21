export type Tone = "green" | "amber" | "red" | "neutral";
export type Platform = "instagram" | "youtube";

export interface Metric {
  id: string;
  label: string;
  /** `null` renders as "NA" with an empty track. */
  value: number | null;
  max?: number | undefined;
  tone?: Tone | undefined;
  caption?: string | undefined;
  tooltip?: string | undefined;
}

export interface Section {
  id: string;
  title: string;
  layout: "bars" | "columns";
  footnote?: string | undefined;
  tooltip?: string | undefined;
  metrics: Metric[];
}

export interface ProfileLink {
  type: "instagram" | "youtube" | "website";
  label: string;
  url: string;
}

export interface DiagnosticsCard {
  id: string;
  title: string;
  badge?: string | undefined;
  tone?: Tone | undefined;
  metrics: Metric[];
  /** Small uppercase label + big numeral sub-metrics rendered under the bar. */
  stats?: { id: string; label: string; value: string | number; tooltip?: string | undefined }[] | undefined;
  footnote?: string | undefined;
}

export interface PlatformPerformanceRow {
  platform: string;
  handle?: string | undefined;
  connected?: boolean | undefined;
  followers?: string | undefined;
  engagement_rate?: string | undefined;
  avg_views?: string | undefined;
}

export interface ComplianceOverviewRow {
  id: string;
  label: string;
  value: string;
  icon: "check" | "flag" | "alert" | "tag";
}

export interface AssetDecisionExplainability {
  summary?: string | undefined;
  what_was_claimed?: string[] | undefined;
  entities_of_concern?: string[] | undefined;
  evidence_status?: { status?: string | undefined; reason?: string | undefined } | undefined;
  regulatory_triggers?: string[] | undefined;
  risk_drivers?: string[] | undefined;
  revision_guidance?: string[] | undefined;
  classification?: string | undefined;
  recommended_action?: string | undefined;
  final_decision_score?: number | undefined;
  category?: string | undefined;
  subcategory_label?: string | undefined;
  generated_at?: string | undefined;
}

export interface AssetRow {
  id: string;
  platform: Platform;
  adhoc_post_id?: string | undefined;
  url?: string | undefined;
  /** Upstream field name for the post permalink. */
  post_url?: string | undefined;
  thumbnail_url?: string | undefined;
  published_at?: string | undefined;
  assessed_at?: string | undefined;
  language?: string | undefined;
  action?: "green" | "grey" | "black" | undefined;
  /** Upstream trust action, e.g. "GREEN" | "GREY" | "BLACK". */
  trust_action?: string | undefined;
  aqs?: number | undefined;
  wow?: number | undefined;
  summary?: string | undefined;
  /** Per-asset report payload from the Creator Trust Service. */
  decision_explainability?: AssetDecisionExplainability | undefined;
}



export interface TrustProfile {
  schema_version: number;
  handle: string;
  platform: Platform;
  profile: {
    display_name: string;
    country_flag?: string | undefined;
    avatar_url?: string | undefined;
    links: ProfileLink[];
  };
  assessment: {
    date: string;
    window: { from: string; to: string; days: number };
    assets_assessed: { platform: string; count: number }[];
    languages: { label: string; count: number }[];
    languages_note?: string | undefined;
    action_mix: { green: number; grey: number; black: number };
  };
  bcts: { score: number; verdict: string; tone?: Tone | undefined; tooltip?: string | undefined };
  /** False when upstream has not yet computed a trust profile for this handle. */
  trust_profile_available?: boolean | undefined;
  sections: Section[];
  diagnostics?:
    | { title: string; note?: string | undefined; footnote?: string | undefined; cards: DiagnosticsCard[] }
    | undefined;
  platform_performance?: PlatformPerformanceRow[] | undefined;
  compliance_overview?: ComplianceOverviewRow[] | undefined;
  assets?: AssetRow[] | undefined;
  /** Optional flat blocks: platform reach, compliance tally, content diagnostics. */
  content_overview?: Record<string, string | number | null> | null | undefined;
  compliance_summary?: Record<string, string | number | null> | null | undefined;
  content_diagnostics?: Record<string, string | number | null> | null | undefined;
  meta?: { generated_at?: string | undefined; source?: string | undefined } | undefined;
}

/** Glossary (tooltips) payload from the Creator Trust Service. */
export interface GlossaryItem {
  label: string;
  text: string;
  field_path?: string | string[] | null | undefined;
}

export interface GlossarySection {
  id: string;
  title: string;
  footnote?: string | null | undefined;
  items: GlossaryItem[];
}

export interface GlossaryPayload {
  constants?: Record<string, number | string | null> | null | undefined;
  sections: GlossarySection[];
}
