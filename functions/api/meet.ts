/**
 * POST /api/meet  { consultationId }
 *
 * The assigned vet (or an admin) asks for a Google Meet room for this
 * consultation. Created once and reused; posted into the chat so the pet
 * parent sees "Join video call", and emailed by Google as an invite.
 *
 * 503 { reason: "not_connected" } when Google isn't set up — the chat then
 * falls back to the vet pasting their own Meet link.
 */

import { badRequest, json, type Env } from "./_shared";
import { admin, isAdmin, supabaseConfigured, userFromRequest } from "./_supabase";
import { createMeet, googleConfigured, loadConnection } from "./_google";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!supabaseConfigured(env)) return json({ ok: false, error: "Not configured." }, 503);
  const auth = await userFromRequest(request, env);
  if (!auth.user) return json({ ok: false, error: "Please sign in again." }, 401);

  const body = (await request.json().catch(() => ({}))) as { consultationId?: string };
  if (!body.consultationId) return badRequest("Missing consultation.");

  const db = admin(env);
  const { data: c } = await db
    .from("consultations")
    .select("id, code, status, doctor_id, customer_id, pet_species, pet_age, issue, meet_link, chat_expires_at")
    .eq("id", body.consultationId)
    .maybeSingle();
  if (!c) return json({ ok: false, error: "Consultation not found." }, 404);

  const allowed = c.doctor_id === auth.user.id || (await isAdmin(db, auth.user.id));
  if (!allowed) return json({ ok: false, error: "Only the assigned vet can start a video call." }, 403);
  if (c.status !== "active" || (c.chat_expires_at && new Date(c.chat_expires_at) < new Date())) {
    return json({ ok: false, error: "This consultation is closed." }, 409);
  }

  // Already created: reuse it.
  if (c.meet_link) return json({ ok: true, link: c.meet_link, reused: true });

  const stored = googleConfigured(env) ? await loadConnection(db) : null;
  if (!stored) return json({ ok: false, reason: "not_connected", error: "Google Meet isn't connected yet." }, 503);

  // Invite the vet and the pet parent by the emails they sign in with.
  const { data: people } = await db.from("profiles").select("id, email").in("id", [c.doctor_id, c.customer_id]);
  const attendees = (people ?? []).map((p) => p.email as string).filter(Boolean);

  let link: string;
  try {
    link = await createMeet(env, stored, {
      code: c.code,
      summary: `${c.pet_species}${c.pet_age ? `, ${c.pet_age}` : ""} — ${String(c.issue).slice(0, 200)}`,
      attendees,
    });
  } catch (err) {
    console.error("meet creation failed", err);
    const reconnect = String(err).includes("google_reconnect_needed");
    return json(
      { ok: false, reason: reconnect ? "not_connected" : "google_error", error: reconnect ? "Google needs reconnecting by an admin." : "Could not create the meeting. Try again." },
      reconnect ? 503 : 502,
    );
  }

  // Save only if nobody beat us to it, then announce in the chat.
  const { data: saved } = await db
    .from("consultations")
    .update({ meet_link: link })
    .eq("id", c.id)
    .is("meet_link", null)
    .select("meet_link")
    .maybeSingle();
  const finalLink = saved?.meet_link ?? (await db.from("consultations").select("meet_link").eq("id", c.id).single()).data?.meet_link ?? link;

  if (saved) {
    await db.from("messages").insert({
      consultation_id: c.id,
      sender_role: "system",
      body: `🎥 Video call ready — tap to join:\n${finalLink}`,
    });
  }
  return json({ ok: true, link: finalLink });
};
