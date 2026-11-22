/**
 * Server-side Supabase access for the Pages Functions.
 *
 * Uses the service-role key, which bypasses row-level security, so it lives
 * only here — never in src/. Everything that decides money or trust (creating
 * a consultation at a price, marking it paid, assigning a doctor) goes through
 * this file.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "./_shared";

const secretKey = (env: Env) => env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

export function admin(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL!, secretKey(env)!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function supabaseConfigured(env: Env) {
  return Boolean(env.SUPABASE_URL && secretKey(env));
}

/** The signed-in user behind a request's `Authorization: Bearer <jwt>`, or null. */
export async function userFromRequest(request: Request, db: SupabaseClient) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/** Follow-up window after payment: the chat stays open this long. */
export const CHAT_WINDOW_HOURS = 72;

/**
 * Record a confirmed payment. Safe to call twice (verify-payment and the
 * webhook both call it, in either order): every update is conditional on the
 * row not already being paid.
 */
export async function markPaid(db: SupabaseClient, orderId: string, paymentId: string | null) {
  const now = new Date();

  const { data: payment } = await db
    .from("payments")
    .update({ status: "paid", razorpay_payment_id: paymentId, paid_at: now.toISOString() })
    .eq("razorpay_order_id", orderId)
    .neq("status", "paid")
    .select("consultation_id")
    .maybeSingle();

  // Already processed by the other path — nothing more to do.
  if (!payment) return { alreadyPaid: true as const };

  const expires = new Date(now.getTime() + CHAT_WINDOW_HOURS * 3600_000);
  const { data: consult } = await db
    .from("consultations")
    .update({ status: "paid", paid_at: now.toISOString(), chat_expires_at: expires.toISOString() })
    .eq("id", payment.consultation_id)
    .eq("status", "awaiting_payment")
    .select("*")
    .maybeSingle();

  if (!consult) return { alreadyPaid: true as const };

  // Seed the chat with the case, so the doctor starts from the full picture.
  const summary = (consult.intake as { summary?: string } | null)?.summary;
  await db.from("messages").insert({
    consultation_id: consult.id,
    sender_role: "system",
    body: [
      `Consultation ${consult.code} is paid. A veterinarian will join shortly.`,
      `Pet: ${[consult.pet_species, consult.pet_gender, consult.pet_age].filter(Boolean).join(" · ")}`,
      `Issue: ${consult.issue}`,
      summary ? `Intake summary: ${summary}` : "",
      consult.urgency === "emergency"
        ? "⚠️ Intake flagged possible emergency signs. If your pet is struggling to breathe, collapsed or bleeding heavily, go to the nearest veterinary hospital now."
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  await autoAssign(db, consult.id, consult.pet_species, consult.language);
  return { alreadyPaid: false as const, consultationId: consult.id as string };
}

/**
 * Rule-based matching: an online, verified doctor who treats this species and
 * speaks this language, with the fewest active chats. Falls back to any
 * online verified doctor. If nobody is online the consultation waits in the
 * queue, where any verified doctor can claim it.
 */
export async function autoAssign(db: SupabaseClient, consultationId: string, species: string, language: string) {
  const { data: doctors } = await db
    .from("doctors")
    .select("id, species, languages")
    .eq("status", "verified")
    .eq("is_online", true);
  if (!doctors?.length) return null;

  const { data: active } = await db
    .from("consultations")
    .select("doctor_id")
    .eq("status", "active")
    .in("doctor_id", doctors.map((d) => d.id));
  const load = new Map<string, number>();
  for (const row of active ?? []) load.set(row.doctor_id, (load.get(row.doctor_id) ?? 0) + 1);

  const score = (d: { species: string[]; languages: string[] }) =>
    (d.species.includes(species) ? 2 : 0) + (d.languages.includes(language) ? 1 : 0);

  const pick = [...doctors].sort(
    (a, b) => score(b) - score(a) || (load.get(a.id) ?? 0) - (load.get(b.id) ?? 0),
  )[0];

  const { data: assigned } = await db
    .from("consultations")
    .update({ doctor_id: pick.id, status: "active", assigned_at: new Date().toISOString() })
    .eq("id", consultationId)
    .is("doctor_id", null)
    .select("id")
    .maybeSingle();
  if (!assigned) return null;

  await db.from("messages").insert({
    consultation_id: consultationId,
    sender_role: "system",
    body: "A veterinarian has joined the chat.",
  });
  return pick.id;
}
