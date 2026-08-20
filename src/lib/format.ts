export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function pct(value: number, max = 100): number {
  if (!Number.isFinite(value) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function joinCounts(items: { label: string; count: number }[], limit = 4): string {
  if (!items.length) return "—";
  const head = items.slice(0, limit).map((i) => `${i.label} ${i.count}`);
  return head.join(" · ") + (items.length > limit ? " · …" : "");
}
