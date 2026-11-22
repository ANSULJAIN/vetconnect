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
    // Raw request first: shows exactly what Supabase says about the key.
    const key = (env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
    const raw = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, { headers: { apikey: key } });
    const rawBody = raw.ok ? "" : (await raw.text()).slice(0, 160);
    result.supabase_secret_raw = raw.ok ? "ok" : `error: HTTP ${raw.status} ${rawBody}`;
    // Shape only (never the value): helps spot a wrong or truncated paste.
    result.supabase_secret_shape = `${key.slice(0, 10)}… length ${key.length}${key !== (env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? "") ? " (had spaces)" : ""}`;
    try {
      const { error, status } = await admin(env).from("profiles").select("id").limit(1);
      result.supabase_secret = error ? `error: HTTP ${status} ${error.message.slice(0, 120)}` : "ok";
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

  // Recent activity, no personal data: status and timing of the last few records.
  let recent: unknown = null;
  if (result.supabase_secret === "ok") {
    const db = admin(env);
    const [c, p] = await Promise.all([
      db.from("consultations").select("code, status, price_paise, created_at, paid_at, doctor_id").order("created_at", { ascending: false }).limit(5),
      db.from("payments").select("status, amount_paise, created_at, paid_at, razorpay_payment_id").order("created_at", { ascending: false }).limit(5),
    ]);
    recent = {
      consultations: (c.data ?? []).map((r) => ({ ...r, doctor_id: r.doctor_id ? "assigned" : null })),
      payments: (p.data ?? []).map((r) => ({ ...r, razorpay_payment_id: r.razorpay_payment_id ? "present" : null })),
    };
  }

  const allOk = Object.entries(result)
    .filter(([k]) => !k.endsWith("_shape"))
    .every(([, v]) => v.startsWith("ok") || v === "set");
  return json({ ok: allOk, ...result, recent }, allOk ? 200 : 503);
};
