# Influencer Trust Profile (standalone SPA)

Renders the Basic Creator Trust Profile at `/influencers/:handle?platform=instagram|youtube`.
All numbers, labels, tones and tooltips come from the API payload — the UI holds no scoring logic.

## Run

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173/influencers/berojgarphotowala?platform=instagram
```

With `VITE_API_BASE_URL` empty the app reads local fixtures from
`public/data/<platform>/<handle>.json`, so you can develop before the API exists.

## Deploy to Vercel

1. Push this folder to a Git repo and import it in Vercel (framework preset: Vite).
2. Set `VITE_API_BASE_URL` (and `VITE_API_KEY` if needed) in Project Settings → Environment Variables.
3. `vercel.json` already rewrites all paths to `index.html` so deep links work.

## API contract

`GET {VITE_API_BASE_URL}/api/influencers?handle=<handle>&platform=<instagram|youtube>`

- `200` → profile JSON (see `src/lib/types.ts` and the fixtures in `public/data/`)
- `404` → renders the "Profile Not Available" state
- CORS must allow the Vercel origin.

If the key must stay server-side, deploy `api/profile.ts` and point
`VITE_API_BASE_URL` at your own domain root (`/api/profile?handle=...&platform=...`).

## Data source

Profiles are read from the published creator exports:

```
https://storage.googleapis.com/tobe-filebuckets/creator-exports/<handle>-<platform>-detail.json
e.g. berojgarphotowala-instagram-detail.json, amarjeet_comedy7-youtube-detail.json
```

The bucket does not send CORS headers, so the browser calls the same-origin proxy
`/api/profile?handle=<handle>&platform=<instagram|youtube>` (Vercel edge function in
`api/profile.ts`, mirrored by a Vite middleware in dev/preview). Override the upstream
with `EXPORT_BASE_URL` on the server, or bypass the proxy entirely with
`VITE_EXPORT_BASE_URL` if you host a CORS-enabled copy.

## Routes

Only one page exists: `/influencers/:handle?platform=instagram|youtube`.
Every other path, and a missing/invalid `platform`, renders a "not available" card.
The site is `noindex, nofollow`.
