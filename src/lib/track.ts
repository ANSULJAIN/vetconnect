"use client";

import { supabase, supabaseReady } from "@/lib/supabase";

/**
 * Funnel tracking.
 *
 * Every browser gets a random visitor id on first visit (kept in
 * localStorage). Events carry it, and once someone signs in they also carry
 * the user id — so a visit from Instagram can be followed through to a paid
 * consultation. No personal data goes in events.
 *
 * Events: page_view, booking_start, intake_start, intake_done, intake_skip,
 * pay_click, login_done, payment_success, payment_failed, whatsapp_click,
 * chat_message, doctor_join_submit.
 */

const KEY = "vc_vid";

export function visitorId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

/** First-touch source, kept so later events still know where the visit came from. */
function source(): Record<string, string> {
  try {
    const stored = sessionStorage.getItem("vc_src");
    if (stored) return JSON.parse(stored);
    const p = new URLSearchParams(location.search);
    const src: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
      const v = p.get(k);
      if (v) src[k] = v.slice(0, 60);
    }
    if (document.referrer && !document.referrer.includes(location.host)) {
      src.ref = new URL(document.referrer).host;
    }
    sessionStorage.setItem("vc_src", JSON.stringify(src));
    return src;
  } catch {
    return {};
  }
}

export async function track(name: string, props: Record<string, unknown> = {}) {
  if (!supabaseReady) return;
  try {
    const sb = supabase();
    const { data } = await sb.auth.getSession();
    await sb.from("events").insert({
      visitor_id: visitorId(),
      user_id: data.session?.user.id ?? null,
      name,
      path: location.pathname.slice(0, 200),
      props: { ...source(), ...props },
    });
  } catch {
    // Tracking must never break the page.
  }
}
