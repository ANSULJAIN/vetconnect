/**
 * Admin-only: connect the VetConnect Google account that owns Meet rooms.
 *
 *   GET  /api/google/connect  -> { configured, connected, account }
 *   POST /api/google/connect  -> { url }  (open it to approve in Google)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { json, type Env } from "../_shared";
import { admin, isAdmin, supabaseConfigured, userFromRequest } from "../_supabase";
import { authUrl, googleConfigured, loadConnection, makeState } from "../_google";

async function requireAdmin(
  request: Request,
  env: Env,
): Promise<{ error: Response; db?: never } | { db: SupabaseClient; error?: never }> {
  if (!supabaseConfigured(env)) return { error: json({ ok: false, error: "Not configured." }, 503) };
  const auth = await userFromRequest(request, env);
  if (!auth.user) return { error: json({ ok: false, error: "Please sign in." }, 401) };
  const db = admin(env);
  if (!(await isAdmin(db, auth.user.id))) return { error: json({ ok: false, error: "Admins only." }, 403) };
  return { db };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const r = await requireAdmin(request, env);
  if (r.error) return r.error;
  const stored = await loadConnection(r.db);
  return json({ ok: true, configured: googleConfigured(env), connected: Boolean(stored), account: stored?.account ?? null });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const r = await requireAdmin(request, env);
  if (r.error) return r.error;
  if (!googleConfigured(env)) {
    return json({ ok: false, error: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Cloudflare first." }, 503);
  }
  const body = (await request.json().catch(() => ({}))) as { returnTo?: string };
  const state = await makeState(env, body.returnTo ?? "https://admin.vetconnect.co.in/admin/");
  return json({ ok: true, url: authUrl(env, state) });
};
