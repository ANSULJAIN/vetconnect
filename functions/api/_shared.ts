/**
 * Shared helpers for the payment endpoints.
 *
 * These run as Cloudflare Pages Functions — small Workers deployed alongside
 * the static site. They exist because two things must never happen in the
 * browser: holding the Razorpay secret, and deciding what a booking costs.
 */

export type Env = {
  /** Razorpay publishable key. Safe to send to the browser. */
  RAZORPAY_KEY_ID: string;
  /** Razorpay secret. Never leaves the Worker. Set as an encrypted secret. */
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  /** Supabase project URL and secret key (bypasses RLS). New projects call it
   *  SUPABASE_SECRET_KEY (sb_secret_…); older ones SUPABASE_SERVICE_ROLE_KEY. */
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  /** For the AI intake assistant. */
  ANTHROPIC_API_KEY?: string;
  /** Optional R2 bucket for voice notes. Recording is hidden when absent. */
  RECORDINGS?: R2Bucket;
};

/**
 * Prices in paise. Server-side truth — the browser shows the same numbers
 * (src/data/site.ts) but never sets them.
 */
export const DAY_PRICE_PAISE = 199_00;
export const NIGHT_PRICE_PAISE = 299_00;
const NIGHT_FROM_MINUTES = 22 * 60;

/** Minutes past midnight in India, whatever timezone the Worker runs in. */
function istMinutesNow() {
  const ist = new Date(Date.now() + 330 * 60_000);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
}

/** "10:30 PM – 11:00 PM" -> 1350. Null for "As soon as possible" or junk. */
function slotStartMinutes(label: string): number | null {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)/.exec(label);
  if (!m) return null;
  const h = (Number(m[1]) % 12) + (m[3] === "PM" ? 12 : 0);
  return h * 60 + Number(m[2]);
}

/** Night slots (10 PM onwards), and "as soon as possible" booked after 10 PM, cost more. */
export function priceForSlot(slot: string): number {
  const start = slotStartMinutes(slot) ?? istMinutesNow();
  return start >= NIGHT_FROM_MINUTES ? NIGHT_PRICE_PAISE : DAY_PRICE_PAISE;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function badRequest(message: string) {
  return json({ ok: false, error: message }, 400);
}

/** Basic-auth header for Razorpay's REST API. */
export function razorpayAuth(env: Env): string {
  return `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`;
}

/**
 * HMAC-SHA256, hex encoded. Workers have no Node crypto, so this uses WebCrypto.
 */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compare two hex strings without leaking timing information. A plain `===`
 * short-circuits on the first differing byte, which is measurable.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type Booking = {
  date: string;
  slot: string;
  pet: string;
  gender: string;
  age: string;
  language: string;
  issue: string;
  name: string;
  phone: string;
  email: string;
};

/** Reject anything that is not a plausible booking before we talk to Razorpay. */
export function validateBooking(b: unknown): { ok: true; booking: Booking } | { ok: false; error: string } {
  if (typeof b !== "object" || b === null) return { ok: false, error: "Missing booking details." };
  const r = b as Record<string, unknown>;
  const str = (k: string, max: number) => (typeof r[k] === "string" ? (r[k] as string).slice(0, max).trim() : "");

  const name = str("name", 120);
  const phone = str("phone", 15).replace(/\D/g, "").slice(-10);
  const issue = str("issue", 2000);

  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, error: "Enter a valid 10-digit mobile number." };
  if (issue.length < 5) return { ok: false, error: "Please describe your pet's issue." };

  return {
    ok: true,
    booking: {
      date: str("date", 10),
      slot: str("slot", 40),
      pet: str("pet", 40),
      gender: str("gender", 20),
      age: str("age", 40),
      language: str("language", 30),
      issue,
      name,
      phone,
      email: str("email", 160),
    },
  };
}
