import type { Tone } from "./types";

export const TONE_HEX: Record<Tone, string> = {
  green: "#16a34a",
  amber: "#f59e0b",
  red: "#dc2626",
  neutral: "#111111",
};

/** Payload tone wins. Fallback threshold is only used when the API omits `tone`. */
export function resolveTone(value: number, tone?: Tone, fallback: Tone = "neutral"): Tone {
  if (tone) return tone;
  if (fallback !== "neutral") return fallback;
  if (!Number.isFinite(value)) return "neutral";
  return "neutral";
}

export function thresholdTone(value: number): Tone {
  if (!Number.isFinite(value)) return "neutral";
  if (value >= 80) return "green";
  if (value >= 60) return "amber";
  return "red";
}

export function toneHex(tone?: Tone, value?: number): string {
  if (tone) return TONE_HEX[tone];
  if (typeof value === "number") return TONE_HEX[thresholdTone(value)];
  return TONE_HEX.neutral;
}
