export const config = { runtime: "edge" };

/**
 * Vercel Edge handler for the glossary / tooltips endpoint.
 *
 * GET /api/tooltips
 */
export default async function handler(_request: Request): Promise<Response> {
  const base = (
    process.env.CREATOR_SERVICE_URL ?? "https://creator-trust-service-o7x7yagetq-el.a.run.app"
  ).replace(/\/$/, "");

  try {
    const r = await fetch(`${base}/tooltips`, { headers: { accept: "application/json" } });
    if (r.status === 404 || r.status === 403) {
      return new Response(JSON.stringify({ error: "Glossary not found" }), {
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
