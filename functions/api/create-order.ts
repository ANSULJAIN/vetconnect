/**
 * POST /api/create-order
 *
 * Signed-in customers only (Authorization: Bearer <supabase access token>).
 *
 * 1. Validates the booking and works out the price on the server.
 * 2. Creates the consultation (status awaiting_payment) — the future chat room.
 * 3. Creates a Razorpay order and records it in `payments`.
 *
 * Returns the order id and the publishable key so the browser can open
 * Razorpay Checkout. The chat opens only once the payment is confirmed by
 * /api/verify-payment or the webhook.
 */

import { badRequest, json, priceForSlot, razorpayAuth, testPricePaise, validateBooking, type Env } from "./_shared";
import { admin, supabaseConfigured, userFromRequest } from "./_supabase";

type Intake = {
  summary?: string;
  urgency?: "routine" | "soon" | "emergency";
  category?: string;
  red_flags?: string[];
};

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return `VC-${[...bytes].map((b) => alphabet[b % alphabet.length]).join("")}`;
}

/** Keep only the intake fields we expect, at sane sizes. */
function cleanIntake(raw: unknown): Intake | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const urgency = ["routine", "soon", "emergency"].includes(r.urgency as string)
    ? (r.urgency as Intake["urgency"])
    : undefined;
  return {
    summary: typeof r.summary === "string" ? r.summary.slice(0, 1500) : undefined,
    urgency,
    category: typeof r.category === "string" ? r.category.slice(0, 60) : undefined,
    red_flags: Array.isArray(r.red_flags)
      ? r.red_flags.filter((x): x is string => typeof x === "string").slice(0, 8).map((x) => x.slice(0, 120))
      : undefined,
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET || !supabaseConfigured(env)) {
    return json(
      { ok: false, error: "Online payment is not set up yet. Please book on WhatsApp for now." },
      503,
    );
  }

  const db = admin(env);
  const auth = await userFromRequest(request, env);
  if (!auth.user) {
    return json({ ok: false, error: "Please sign in again to continue.", reason: auth.reason }, 401);
  }
  const user = auth.user;

  let body: { booking?: unknown; intake?: unknown; visitorId?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request.");
  }

  const parsed = validateBooking(body.booking);
  if (!parsed.ok) return badRequest(parsed.error);
  const b = parsed.booking;
  const intake = cleanIntake(body.intake);
  const amount = testPricePaise(env, request) ?? priceForSlot(b.slot);

  // Keep the profile's name and phone current — the doctor sees them.
  await db.from("profiles").update({ full_name: b.name, phone: b.phone }).eq("id", user.id);

  // Insert the consultation, retrying on the (rare) code collision.
  let consult: { id: string; code: string } | null = null;
  for (let attempt = 0; attempt < 4 && !consult; attempt++) {
    const { data, error } = await db
      .from("consultations")
      .insert({
        code: makeCode(),
        customer_id: user.id,
        customer_name: b.name,
        customer_phone: b.phone,
        pet_species: b.pet || "Other",
        pet_gender: b.gender || null,
        pet_age: b.age || null,
        language: b.language || "English",
        issue: b.issue,
        slot_date: /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : null,
        slot_label: b.slot || null,
        price_paise: amount,
        intake,
        urgency: intake?.urgency ?? null,
        visitor_id: typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : null,
      })
      .select("id, code")
      .single();
    if (data) consult = data;
    else if (error?.code !== "23505") {
      console.error("consultation insert failed", error);
      return json({ ok: false, error: "Could not save your booking. Please try again." }, 500);
    }
  }
  if (!consult) return json({ ok: false, error: "Please try again." }, 500);

  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { authorization: razorpayAuth(env), "content-type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: consult.code, // Razorpay caps receipt at 40 chars
      notes: { consultationId: consult.id, code: consult.code, pet: b.pet, slot: `${b.date} ${b.slot}` },
    }),
  });

  if (!rzpRes.ok) {
    console.error("razorpay order failed", rzpRes.status, await rzpRes.text());
    await db.from("consultations").update({ status: "cancelled" }).eq("id", consult.id);
    return json({ ok: false, error: "Could not start the payment. Please try again." }, 502);
  }
  const order = (await rzpRes.json()) as { id: string; amount: number; currency: string };

  await db.from("payments").insert({
    consultation_id: consult.id,
    razorpay_order_id: order.id,
    amount_paise: order.amount,
  });

  return json({
    ok: true,
    consultationId: consult.id,
    code: consult.code,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
    prefill: { name: b.name, contact: b.phone, email: user.email ?? "" },
  });
};
