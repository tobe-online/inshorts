export type Tone = "green" | "amber" | "red" | "neutral";
export type Platform = "instagram" | "youtube";

export interface Metric {
  id: string;
  label: string;
  value: number;
  max?: number;
  tone?: Tone;
  caption?: string;
  tooltip?: string;
}

export interface Section {
  id: string;
  title: string;
  layout: "bars" | "columns";
  footnote?: string;
  tooltip?: string;
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
  badge?: string;
  tone?: Tone;
  metrics: Metric[];
}

export interface AssetRow {
  id: string;
  platform: Platform;
  url: string;
  thumbnail_url?: string;
  published_at: string;
  language?: string;
  action?: "green" | "grey" | "black";
  aqs?: number;
  wow?: number;
  summary?: string;
}

export interface TrustProfile {
  schema_version: number;
  handle: string;
  platform: Platform;
  profile: {
    display_name: string;
    country_flag?: string;
    avatar_url?: string;
    links: ProfileLink[];
  };
  assessment: {
    date: string;
    window: { from: string; to: string; days: number };
    assets_assessed: { platform: string; count: number }[];
    languages: { label: string; count: number }[];
    languages_note?: string;
    action_mix: { green: number; grey: number; black: number };
  };
  bcts: { score: number; verdict: string; tone?: Tone; tooltip?: string };
  /** False when upstream has not yet computed a trust profile for this handle. */
  trust_profile_available?: boolean;
  sections: Section[];
  diagnostics?: { title: string; note?: string; cards: DiagnosticsCard[] };
  assets?: AssetRow[];
  /** Optional flat blocks: platform reach, compliance tally, content diagnostics. */
  content_overview?: Record<string, string | number | null> | null;
  compliance_summary?: Record<string, string | number | null> | null;
  content_diagnostics?: Record<string, string | number | null> | null;
  meta?: { generated_at?: string; source?: string };
}
