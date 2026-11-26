/**
 * POST /api/lead — copies a WhatsApp booking into the "VetConnect Bookings"
 * Google Sheet (see scripts/google-sheet/Code.gs).
 *
 * The sheet's web-app URL stays here on the server (BOOKINGS_SHEET_URL), so it
 * never appears in the website's code.
 */

import { badRequest, json, type Env } from "./_shared";

const KEYS = ["ref", "date", "slot", "price", "pet", "gender", "age", "language", "issue", "name", "phone", "email", "source"] as const;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.BOOKINGS_SHEET_URL) return json({ ok: false, error: "sheet not configured" }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("invalid JSON");
  }

  const lead: Record<string, string> = {};
  for (const k of KEYS) lead[k] = String(body[k] ?? "").slice(0, 2000);
  if (!lead.ref || !/^\d{10}$/.test(lead.phone)) return badRequest("missing booking details");

  const res = await fetch(env.BOOKINGS_SHEET_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(lead),
    redirect: "follow",
  });
  const text = await res.text();
  const ok = res.ok && text.includes('"ok":true');
  if (!ok) console.error("sheet write failed", res.status, text.slice(0, 300));
  return json({ ok }, ok ? 200 : 502);
};
