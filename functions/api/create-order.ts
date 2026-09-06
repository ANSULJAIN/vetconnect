/**
 * POST /api/create-order
 *
 * Creates a Razorpay order and records a pending booking. Returns the order id
 * and the *publishable* key so the browser can open Razorpay Checkout.
 *
 * The amount is set here, from CONSULT_AMOUNT_PAISE — a price sent by the
 * browser would be trivially editable in devtools.
 */

import {
  CONSULT_AMOUNT_PAISE,
  badRequest,
  json,
  razorpayAuth,
  validateBooking,
  type Env,
} from "./_shared";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json(
      { ok: false, error: "Payments are not configured yet. Please contact support to book." },
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request.");
  }

  const parsed = validateBooking((body as { booking?: unknown })?.booking);
  if (!parsed.ok) return badRequest(parsed.error);
  const { booking } = parsed;

  const bookingId = crypto.randomUUID();
  // Razorpay caps receipt at 40 characters.
  const receipt = `vc_${bookingId.replace(/-/g, "").slice(0, 30)}`;

  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      authorization: razorpayAuth(env),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: CONSULT_AMOUNT_PAISE,
      currency: "INR",
      receipt,
      notes: {
        bookingId,
        pet: booking.pet,
        slot: `${booking.date} ${booking.slot}`,
        phone: booking.phone,
      },
    }),
  });

  if (!rzpRes.ok) {
    const detail = await rzpRes.text();
    console.error("razorpay order failed", rzpRes.status, detail);
    return json({ ok: false, error: "Could not start the payment. Please try again." }, 502);
  }

  const order = (await rzpRes.json()) as { id: string; amount: number; currency: string };

  // Persist as pending. Without a D1 binding the booking still goes through —
  // it just isn't stored, and the Razorpay dashboard is the only record.
  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO bookings
           (id, order_id, status, amount, name, phone, email, pet, gender, age,
            language, slot_date, slot_time, issue, created_at)
         VALUES (?1,?2,'pending',?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)`,
      )
        .bind(
          bookingId,
          order.id,
          CONSULT_AMOUNT_PAISE,
          booking.name,
          booking.phone,
          booking.email,
          booking.pet,
          booking.gender,
          booking.age,
          booking.language,
          booking.date,
          booking.slot,
          booking.issue,
          new Date().toISOString(),
        )
        .run();
    } catch (err) {
      // A storage failure shouldn't block the customer from paying.
      console.error("d1 insert failed", err);
    }
  }

  return json({
    ok: true,
    bookingId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
  });
};
