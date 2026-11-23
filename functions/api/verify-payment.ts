/**
 * POST /api/verify-payment
 *
 * Confirms a payment reported by the browser. Razorpay signs
 * `order_id|payment_id` with our secret; recomputing that HMAC is the only
 * proof that a payment actually happened. A client claiming success proves
 * nothing — anyone can POST to this endpoint.
 */

import {
  badRequest,
  hmacSha256Hex,
  json,
  timingSafeEqual,
  type Env,
} from "./_shared";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    return json({ ok: false, error: "Payments are not configured." }, 503);
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    bookingId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request.");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return badRequest("Missing payment details.");
  }

  const expected = await hmacSha256Hex(
    env.RAZORPAY_KEY_SECRET,
    `${razorpay_order_id}|${razorpay_payment_id}`,
  );

  if (!timingSafeEqual(expected, razorpay_signature)) {
    console.warn("signature mismatch for order", razorpay_order_id);
    return json({ ok: false, error: "Payment could not be verified." }, 400);
  }

  if (env.DB && bookingId) {
    try {
      await env.DB.prepare(
        `UPDATE bookings
            SET status = 'paid', payment_id = ?1, paid_at = ?2
          WHERE id = ?3 AND order_id = ?4`,
      )
        .bind(razorpay_payment_id, new Date().toISOString(), bookingId, razorpay_order_id)
        .run();
    } catch (err) {
      // The money is taken and verified; log and still confirm to the customer.
      console.error("d1 update failed", err);
    }
  }

  return json({ ok: true, paymentId: razorpay_payment_id });
};
