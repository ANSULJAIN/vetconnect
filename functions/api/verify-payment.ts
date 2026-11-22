/**
 * POST /api/verify-payment
 *
 * Confirms a payment reported by the browser. Razorpay signs
 * `order_id|payment_id` with our secret; recomputing that HMAC is the only
 * proof that a payment actually happened. A client claiming success proves
 * nothing — anyone can POST to this endpoint.
 *
 * On success the consultation flips to paid, the chat opens, and a doctor is
 * auto-assigned if one is online. The webhook does the same thing if the
 * customer's browser never gets here.
 */

import { badRequest, hmacSha256Hex, json, timingSafeEqual, type Env } from "./_shared";
import { admin, markPaid, supabaseConfigured } from "./_supabase";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RAZORPAY_KEY_SECRET || !supabaseConfigured(env)) {
    return json({ ok: false, error: "Payments are not configured." }, 503);
  }

  let body: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request.");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return badRequest("Missing payment details.");
  }

  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
  if (!timingSafeEqual(expected, razorpay_signature)) {
    console.warn("signature mismatch for order", razorpay_order_id);
    return json({ ok: false, error: "Payment could not be verified." }, 400);
  }

  const db = admin(env);
  await markPaid(db, razorpay_order_id, razorpay_payment_id);

  const { data } = await db
    .from("payments")
    .select("consultation_id")
    .eq("razorpay_order_id", razorpay_order_id)
    .maybeSingle();

  return json({ ok: true, consultationId: data?.consultation_id ?? null });
};
