import type { Platform, TrustProfile } from "./types";
import { adaptUpstream, isUpstreamPayload, normaliseUnified } from "./upstream";

/** Empty = use the same-origin /api/profile proxy (dev middleware or Vercel edge function). */
const BASE = (import.meta.env.VITE_EXPORT_BASE_URL ?? "").trim().replace(/\/$/, "");

export class ProfileNotFoundError extends Error {}

/**
 * Exports are published as static JSON keyed by `<handle>-<platform>-detail.json`,
 * e.g. berojgarphotowala-instagram-detail.json. The bucket sends no CORS headers, so the
 * request goes through the same-origin /api/profile proxy unless an explicitly
 * CORS-enabled base URL is configured.
 */
function endpoint(handle: string, platform: Platform) {
  if (BASE) return `${BASE}/${encodeURIComponent(`${handle}-${platform}-detail`)}.json`;
  return `/api/profile?handle=${encodeURIComponent(handle)}&platform=${platform}`;
}

async function load(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal });
  if (res.status === 404 || res.status === 403) throw new ProfileNotFoundError("Profile not found");
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/** Fetches the published export for a handle + platform. */
export async function fetchProfile(
  handle: string,
  platform: Platform,
  signal?: AbortSignal,
): Promise<TrustProfile> {
  const url = endpoint(handle, platform);
  let json: unknown;

  try {
    json = await load(url, signal);
  } catch (err) {
    if (err instanceof ProfileNotFoundError) throw err;
    // Offline / dev safety net: bundled fixtures in public/data.
    console.warn(`[trust-profile] export fetch failed (${url}); trying local fixture`);
    json = await load(`/data/${platform}/${handle}.json`, signal);
  }

  const normalised = normaliseUnified(json);
  if (isUpstreamPayload(normalised)) return adaptUpstream(normalised, platform);

  const view = json as TrustProfile;
  if (!view || !view.profile || !view.bcts) throw new Error("Malformed profile payload");
  return view;
}
