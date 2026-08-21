# Influencer Trust Profile (standalone SPA)

Renders the Basic Creator Trust Profile at `/influencers/:handle?platform=instagram|youtube`.
All numbers, labels, tones and tooltips come from the API payload — the UI holds no scoring logic.

## Run

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173/influencers/berojgarphotowala?platform=instagram
```

With `VITE_CREATOR_SERVICE_URL` empty the app reads local fixtures from
`public/data/<platform>/<handle>.json`, so you can develop before the API exists.

## Deploy to Vercel

1. Push this folder to a Git repo and import it in Vercel (framework preset: Vite).
2. Set `VITE_CREATOR_SERVICE_URL` (and `VITE_API_KEY` if needed) in Project Settings → Environment Variables.
3. `vercel.json` already rewrites all paths to `index.html` so deep links work.

## API contract

`GET {VITE_CREATOR_SERVICE_URL}/creator-trust-profile?handle=<handle>&platform=<instagram|youtube>`

- `200` → profile JSON (see `src/lib/types.ts` and the fixtures in `public/data/`)
- `404` → renders the "Profile Not Available" state
- CORS must allow the Vercel origin.

If the key must stay server-side, deploy `api/profile.ts` and point
`VITE_CREATOR_SERVICE_URL` at your own domain root (`/api/profile?handle=...&platform=...`).

## Data source

Profiles are read from the Creator Trust Service:

```
https://creator-trust-service-o7x7yagetq-el.a.run.app/creator-trust-profile?handle=<handle>&platform=<instagram|youtube>
e.g. handle=berojgarphotowala&platform=instagram
```

The service supports CORS, so the browser can call it directly. A same-origin proxy
`/api/profile?handle=<handle>&platform=<instagram|youtube>` (Vercel edge function in
`api/profile.ts`, mirrored by a Vite middleware in dev/preview) is still available.
Override the upstream with `CREATOR_SERVICE_URL` on the server, or bypass the proxy entirely with
`VITE_CREATOR_SERVICE_URL` if you host a CORS-enabled copy.

## Routes

Only one page exists: `/influencers/:handle?platform=instagram|youtube`.
Every other path, and a missing/invalid `platform`, renders a "not available" card.
The site is `noindex, nofollow`.
