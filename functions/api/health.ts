/**
 * GET /api/health
 *
 * Checks that each configured key actually works, without revealing any of
 * them. Used during setup and after changing keys in Cloudflare.
 */

import { json, razorpayAuth, type Env } from "./_shared";
import { admin, supabaseConfigured } from "./_supabase";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const result: Record<string, string> = {};

  // Supabase secret key: can it read the database (bypassing RLS)?
  if (!supabaseConfigured(env)) {
    result.supabase_secret = "missing";
  } else {
    try {
      const { error } = await admin(env).from("profiles").select("id", { count: "exact", head: true });
      result.supabase_secret = error ? `error: ${error.message.slice(0, 120)}` : "ok";
    } catch (e) {
      result.supabase_secret = `error: ${String(e).slice(0, 120)}`;
    }
  }

  // Public key: does Supabase Auth accept it?
  const pub = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY;
  if (!env.SUPABASE_URL || !pub) {
    result.supabase_public = "missing";
  } else {
    const r = await fetch(`${env.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: pub } });
    result.supabase_public = r.ok ? "ok" : `error: HTTP ${r.status}`;
  }

  // Razorpay key id + secret: does Razorpay accept the pair?
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    result.razorpay = "missing";
  } else {
    const r = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: { authorization: razorpayAuth(env) },
    });
    result.razorpay = r.ok ? `ok (${env.RAZORPAY_KEY_ID.startsWith("rzp_live_") ? "live" : "test"} mode)` : `error: HTTP ${r.status}`;
  }

  result.razorpay_webhook_secret = env.RAZORPAY_WEBHOOK_SECRET ? "set" : "missing";

  const allOk = Object.values(result).every((v) => v.startsWith("ok") || v === "set");
  return json({ ok: allOk, ...result }, allOk ? 200 : 503);
};
