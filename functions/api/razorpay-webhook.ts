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

type WebhookEnv = Env & { RAZORPAY_WEBHOOK_SECRET: string };

export const onRequestPost: PagesFunction<WebhookEnv> = async ({ request, env }) => {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return json({ ok: false, error: "Webhook not configured." }, 503);

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) return json({ ok: false, error: "Missing signature." }, 400);

  // The signature covers the exact bytes sent, so hash the raw body before parsing.
  const raw = await request.text();
  const expected = await hmacSha256Hex(secret, raw);
  if (!timingSafeEqual(expected, signature)) {
    console.warn("webhook signature mismatch");
    return json({ ok: false, error: "Invalid signature." }, 400);
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; notes?: Record<string, string> } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Malformed payload." }, 400);
  }

  const payment = event.payload?.payment?.entity;
  const bookingId = payment?.notes?.bookingId;

  if (env.DB && payment?.order_id) {
    const status =
      event.event === "payment.captured"
        ? "paid"
        : event.event === "payment.failed"
          ? "failed"
          : null;

    if (status) {
      try {
        // Match on order_id so this works even if notes were stripped.
        await env.DB.prepare(
          `UPDATE bookings
              SET status = ?1, payment_id = ?2, paid_at = ?3
            WHERE order_id = ?4 AND status != 'paid'`,
        )
          .bind(status, payment.id ?? null, new Date().toISOString(), payment.order_id)
          .run();
      } catch (err) {
        console.error("webhook d1 update failed", err, bookingId);
      }
    }
  }

  // Always 200 on a valid signature — a non-2xx makes Razorpay retry for days.
  return json({ ok: true });
};
