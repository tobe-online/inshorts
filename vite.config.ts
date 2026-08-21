import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serviceBase = (env.VITE_CREATOR_SERVICE_URL ?? "https://creator-trust-service-o7x7yagetq-el.a.run.app").replace(/\/$/, "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/profile": {
          target: serviceBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/profile/, "/creator-trust-profile"),
        },
        "/api/tooltips": {
          target: serviceBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tooltips/, "/tooltips"),
        },
      },
    },
  };
});
