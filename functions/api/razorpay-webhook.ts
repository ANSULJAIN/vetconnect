/**
 * POST /api/razorpay-webhook
 *
 * Razorpay calls this server-to-server whenever a payment is captured or fails.
 *
 * This exists because /api/verify-payment depends on the customer's browser
 * still being open. If they pay and immediately close the tab, or their phone
 * dies mid-UPI, that callback never fires — but the money still moved. The
 * webhook is the reliable record; verify-payment is only for instant feedback.
 *
 * Configure in the Razorpay dashboard:
 *   URL    https://vetconnect.co.in/api/razorpay-webhook
 *   Events payment.captured, payment.failed
 *   Secret -> set as RAZORPAY_WEBHOOK_SECRET in Cloudflare
 */

import { hmacSha256Hex, json, timingSafeEqual, type Env } from "./_shared";
import { admin, markPaid, supabaseConfigured } from "./_supabase";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !supabaseConfigured(env)) return json({ ok: false, error: "Webhook not configured." }, 503);

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) return json({ ok: false, error: "Missing signature." }, 400);

  // The signature covers the exact bytes sent, so hash the raw body before parsing.
  const raw = await request.text();
  const expected = await hmacSha256Hex(secret, raw);
  if (!timingSafeEqual(expected, signature)) {
    console.warn("webhook signature mismatch");
    return json({ ok: false, error: "Invalid signature." }, 400);
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Malformed payload." }, 400);
  }

  const payment = event.payload?.payment?.entity;
  if (payment?.order_id) {
    const db = admin(env);
    try {
      if (event.event === "payment.captured") {
        await markPaid(db, payment.order_id, payment.id ?? null);
      } else if (event.event === "payment.failed") {
        await db
          .from("payments")
          .update({ status: "failed", razorpay_payment_id: payment.id ?? null })
          .eq("razorpay_order_id", payment.order_id)
          .eq("status", "created");
      }
    } catch (err) {
      console.error("webhook processing failed", err);
      // 500 so Razorpay retries — the money moved and we must record it.
      return json({ ok: false }, 500);
    }
  }

  // 200 on a valid signature — a non-2xx makes Razorpay retry for days.
  return json({ ok: true });
};
