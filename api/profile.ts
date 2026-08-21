/**
 * Vercel Edge handler for the Creator Trust Service proxy.
 *
 * GET /api/profile?handle=berojgarphotowala&platform=instagram
 */
export default async function handler(request: Request): Promise<Response> {
  const base = (
    process.env.CREATOR_SERVICE_URL ?? "https://creator-trust-service-o7x7yagetq-el.a.run.app"
  ).replace(/\/$/, "");

  const url = new URL(request.url);
  const handle = (url.searchParams.get("handle") ?? "").trim();
  const platform = (url.searchParams.get("platform") ?? "").trim();

  if (!handle || (platform !== "instagram" && platform !== "youtube")) {
    return new Response(
      JSON.stringify({ error: "handle and platform (instagram|youtube) are required" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const upstream = `${base}/creator-trust-profile?handle=${encodeURIComponent(handle)}&platform=${platform}`;

  try {
    const r = await fetch(upstream, { headers: { accept: "application/json" } });
    if (r.status === 404 || r.status === 403) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    if (!r.ok) {
      return new Response(JSON.stringify({ error: `Upstream error (${r.status})` }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    const text = await r.text();
    return new Response(text, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=300, s-maxage=900",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Upstream request failed" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
