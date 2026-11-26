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

  // Apps Script answers a POST with a redirect to the result; follow it by hand
  // (as a GET, which is what Google expects) so failures are easy to see.
  const url = env.BOOKINGS_SHEET_URL.trim();
  let step = "post";
  try {
    let res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      redirect: "manual",
    });
    const next = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && next) {
      step = "result";
      res = await fetch(next);
    }
    const text = await res.text();
    const ok = res.ok && text.includes('"ok":true');
    if (!ok) {
      console.error("sheet write failed", step, res.status, text.slice(0, 300));
      return json({ ok: false, step, status: res.status, host: safeHost(url), detail: text.slice(0, 120) }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, step, host: safeHost(url), error: String(err).slice(0, 200) }, 502);
  }
};

/** Which host the URL points at, for debugging, without revealing the secret path. */
function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "not a valid URL";
  }
}
