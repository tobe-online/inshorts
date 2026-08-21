import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const SERVICE_BASE = (
  process.env.CREATOR_SERVICE_URL ?? "https://creator-trust-service-o7x7yagetq-el.a.run.app"
).replace(/\/$/, "");

/** Mirrors api/profile.ts during `vite dev` / `vite preview` so the service's CORS works. */
function exportProxy(): Plugin {
  const middleware = async (req: any, res: any, next: any) => {
    if (!req.url?.startsWith("/api/profile")) return next();
    const url = new URL(req.url, "http://localhost");
    const handle = (url.searchParams.get("handle") ?? "").trim();
    const platform = (url.searchParams.get("platform") ?? "").trim();
    const send = (status: number, body: string) => {
      res.statusCode = status;
      res.setHeader("content-type", "application/json");
      res.end(body);
    };
    if (!handle || (platform !== "instagram" && platform !== "youtube")) {
      return send(400, JSON.stringify({ error: "handle and platform are required" }));
    }
    try {
      const upstream = await fetch(
        `${SERVICE_BASE}/creator-trust-profile?handle=${encodeURIComponent(handle)}&platform=${platform}`,
      );
      if (upstream.status === 404 || upstream.status === 403) {
        return send(404, JSON.stringify({ error: "Profile not found" }));
      }
      if (!upstream.ok) return send(502, JSON.stringify({ error: "Upstream error" }));
      return send(200, await upstream.text());
    } catch {
      return send(502, JSON.stringify({ error: "Upstream unreachable" }));
    }
  };
  return {
    name: "export-proxy",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), exportProxy()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
