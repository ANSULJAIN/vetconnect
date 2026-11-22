/**
 * GET /api/google/callback — Google sends the admin back here after approval.
 * Verifies the signed state, swaps the code for a refresh token, stores it
 * privately, and returns the admin to the admin page.
 */

import type { Env } from "../_shared";
import { admin, supabaseConfigured } from "../_supabase";
import { accountEmail, exchangeCode, readState, saveConnection } from "../_google";

function back(to: string, result: string) {
  const u = new URL(to);
  u.searchParams.set("google", result);
  return Response.redirect(u.toString(), 302);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const fallback = "https://admin.vetconnect.co.in/admin/";
  if (!supabaseConfigured(env) || !env.GOOGLE_CLIENT_SECRET) return back(fallback, "not_configured");

  const state = await readState(env, url.searchParams.get("state") ?? "");
  if (!state) return back(fallback, "invalid_state");
  if (url.searchParams.get("error")) return back(state.returnTo, "denied");

  const code = url.searchParams.get("code");
  if (!code) return back(state.returnTo, "no_code");

  try {
    const tokens = await exchangeCode(env, code);
    if (!tokens.refresh_token) return back(state.returnTo, "no_refresh_token");
    const account = await accountEmail(tokens.access_token);
    await saveConnection(admin(env), {
      refresh_token: tokens.refresh_token,
      account,
      connected_at: new Date().toISOString(),
    });
    return back(state.returnTo, "connected");
  } catch (err) {
    console.error("google callback failed", err);
    return back(state.returnTo, "failed");
  }
};
