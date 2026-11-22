/**
 * Google Meet via the Google Calendar API.
 *
 * One VetConnect Google account owns every meeting. An admin connects it once
 * (/api/google/connect -> Google consent -> /api/google/callback); the
 * long-lived refresh token is stored in public.integrations, which only the
 * backend's secret key can read.
 *
 * For each consultation we create a calendar event "now" with a Meet room,
 * inviting the vet and the pet parent, so both can join without knocking.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { hmacSha256Hex, timingSafeEqual, type Env } from "./_shared";

export const GOOGLE_REDIRECT = "https://vetconnect.co.in/api/google/callback";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";
const INTEGRATION = "google_meet";

export function googleConfigured(env: Env) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

/* ---- signed OAuth "state": stops anyone forging the callback ---- */

export async function makeState(env: Env, returnTo: string) {
  const payload = btoa(JSON.stringify({ t: Date.now(), r: returnTo }));
  const sig = await hmacSha256Hex(env.GOOGLE_CLIENT_SECRET!, payload);
  return `${payload}.${sig}`;
}

export async function readState(env: Env, state: string): Promise<{ returnTo: string } | null> {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = await hmacSha256Hex(env.GOOGLE_CLIENT_SECRET!, payload);
  if (!timingSafeEqual(expected, sig)) return null;
  try {
    const { t, r } = JSON.parse(atob(payload)) as { t: number; r: string };
    if (Date.now() - t > 15 * 60_000) return null; // 15-minute window
    const allowed = /^https:\/\/(admin\.)?vetconnect\.co\.in\//.test(r) || /^https:\/\/[a-z0-9-]+\.vetconnect-5e9\.pages\.dev\//.test(r);
    return { returnTo: allowed ? r : "https://admin.vetconnect.co.in/admin/" };
  } catch {
    return null;
  }
}

export function authUrl(env: Env, state: string) {
  const q = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // returns a refresh token
    prompt: "consent", // always return it, even on reconnect
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

/* ---- tokens ---- */

type Stored = { refresh_token: string; account?: string; connected_at: string };

export async function exchangeCode(env: Env, code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: GOOGLE_REDIRECT,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as { access_token: string; refresh_token?: string };
}

export async function saveConnection(db: SupabaseClient, data: Stored) {
  const { error } = await db
    .from("integrations")
    .upsert({ name: INTEGRATION, data, updated_at: new Date().toISOString() });
  if (error) throw new Error(`could not save Google connection: ${error.message}`);
}

export async function loadConnection(db: SupabaseClient): Promise<Stored | null> {
  const { data } = await db.from("integrations").select("data").eq("name", INTEGRATION).maybeSingle();
  return (data?.data as Stored) ?? null;
}

async function accessToken(env: Env, stored: Stored) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      refresh_token: stored.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    // 400 invalid_grant = access revoked or expired: an admin must reconnect.
    throw new Error(`google_reconnect_needed: ${res.status}`);
  }
  return ((await res.json()) as { access_token: string }).access_token;
}

/** The connected account's email (its primary calendar id). */
export async function accountEmail(token: string) {
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary", {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) return undefined;
  return ((await res.json()) as { id?: string }).id;
}

/* ---- create a meeting ---- */

export async function createMeet(
  env: Env,
  stored: Stored,
  opts: { code: string; summary: string; attendees: string[] },
): Promise<string> {
  const token = await accessToken(env, stored);
  const start = new Date();
  const end = new Date(start.getTime() + 45 * 60_000);

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        summary: `VetConnect consultation ${opts.code}`,
        description: `${opts.summary}\n\nJoin from the VetConnect chat, or with the Meet link in this invite.`,
        start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
        end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
        attendees: opts.attendees.filter(Boolean).map((email) => ({ email })),
        // The vet and the pet parent don't see each other's email addresses.
        guestsCanSeeOtherGuests: false,
        guestsCanInviteOthers: false,
        conferenceData: {
          createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`calendar event failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  const ev = (await res.json()) as { hangoutLink?: string };
  if (!ev.hangoutLink) throw new Error("Google did not return a Meet link");
  return ev.hangoutLink;
}
