/**
 * Vercel Edge proxy for the published creator exports.
 * The GCS bucket does not send CORS headers, so the browser cannot read it directly;
 * this function fetches server-side and returns the JSON with permissive CORS.
 *
 * GET /api/profile?handle=berojgarphotowala&platform=instagram
 */
export const config = { runtime: "edge" };

const BASE = (
  process.env.EXPORT_BASE_URL ??
  "https://storage.googleapis.com/tobe-filebuckets/creator-exports"
).replace(/\/$/, "");

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const handle = (url.searchParams.get("handle") ?? "").trim();
  const platform = (url.searchParams.get("platform") ?? "").trim();

  if (!handle || (platform !== "instagram" && platform !== "youtube")) {
    return json({ error: "handle and platform (instagram|youtube) are required" }, 400);
  }

  const upstream = `${BASE}/${encodeURIComponent(`${handle}-${platform}-detail`)}.json`;
  const res = await fetch(upstream, { headers: { accept: "application/json" } });
  if (res.status === 404 || res.status === 403) return json({ error: "Profile not found" }, 404);
  if (!res.ok) return json({ error: `Upstream error (${res.status})` }, 502);

  return new Response(await res.text(), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300, s-maxage=900",
    },
  });
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
