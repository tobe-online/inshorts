Influencer Trust Profile — Vite + Vercel package

A local, Vite-based single-page application that mirrors the creator trust profile pages built in the Lovable project. It is designed to run locally with `npm run dev` and to be deployed on Vercel.

Project structure
- `api/profile.ts` — Vercel Edge handler that proxies `/api/profile` to the Creator Trust Service.
- `api/tooltips.ts` — Vercel Edge handler that proxies `/api/tooltips` to the glossary endpoint.
- `src/routes/InfluencerProfile.tsx` — Creator profile page (`/influencers/:handle`).
- `src/routes/Glossary.tsx` — Glossary page (`/glossary`).
- `src/components/` — Reusable profile components, including the asset score-report side panel.
- `src/lib/` — Types, formatter helpers, upstream adapter, and API client.
- `public/data/` — Bundled JSON fixtures for offline dev fallback.

Environment variables
Create a `.env` file from `.env.example`:

VITE_CREATOR_SERVICE_URL=https://creator-trust-service-o7x7yagetq-el.a.run.app

For Vercel (server-side edge handlers), set the same value as:
CREATOR_SERVICE_URL=https://creator-trust-service-o7x7yagetq-el.a.run.app

Local development

npm install
npm run dev

Open http://localhost:5173/influencers/mai.saurav?platform=instagram

Build

npm run build

Preview the production build with `npm run preview`.

Vercel deployment
1. Push the project to a Git repository.
2. Import the project in Vercel and use the framework preset “Vite”.
3. Add the environment variable `CREATOR_SERVICE_URL` in the Vercel dashboard.
4. Deploy. The `api/` folder is served automatically as Vercel Edge functions via `vercel.json`.

Notes
- The same-origin proxies (`/api/profile` and `/api/tooltips`) are used for local dev and Vercel to avoid CORS.
- The Vite dev server also proxies these paths to the service configured in `VITE_CREATOR_SERVICE_URL`.
- The side panel close button and backdrop click rely on the custom `src/components/ui/sheet.tsx` implementation.
