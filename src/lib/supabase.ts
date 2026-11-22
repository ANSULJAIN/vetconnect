"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client. The URL and anon key are public by design — every
 * table is protected by row-level security (supabase/migrations). The
 * service-role key never appears in src/.
 *
 * Baked in at build time from the Cloudflare Pages build environment.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// New projects call it the publishable key; older ones the anon key. Either works.
const ANON =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseReady = Boolean(URL && ANON);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!supabaseReady) throw new Error("Supabase is not configured");
  client ??= createClient(URL, ANON, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export type Role = "customer" | "doctor" | "admin";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  email: string | null;
};

export type Consultation = {
  id: string;
  code: string;
  customer_id: string;
  doctor_id: string | null;
  status: "awaiting_payment" | "paid" | "active" | "closed" | "cancelled";
  customer_name: string;
  customer_phone: string;
  pet_species: string;
  pet_gender: string | null;
  pet_age: string | null;
  language: string;
  issue: string;
  slot_date: string | null;
  slot_label: string | null;
  price_paise: number;
  intake: { summary?: string; urgency?: string; category?: string; red_flags?: string[] } | null;
  urgency: "routine" | "soon" | "emergency" | null;
  created_at: string;
  paid_at: string | null;
  closed_at: string | null;
  chat_expires_at: string | null;
  meet_link: string | null;
};

export type Doctor = {
  id: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  full_name: string;
  phone: string;
  qualification: string;
  registration_no: string;
  council_state: string;
  experience_years: number | null;
  species: string[];
  languages: string[];
  bio: string | null;
  photo_path: string | null;
  certificate_path: string | null;
  is_online: boolean;
  review_note: string | null;
  created_at: string;
};

export type Message = {
  id: number;
  consultation_id: string;
  sender_id: string | null;
  sender_role: "customer" | "doctor" | "system";
  body: string | null;
  attachment_path: string | null;
  created_at: string;
};

/** Access token for calling our own /api functions as the signed-in user. */
export async function accessToken(): Promise<string | null> {
  if (!supabaseReady) return null;
  const { data } = await supabase().auth.getSession();
  return data.session?.access_token ?? null;
}
