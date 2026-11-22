"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireAuth, signOutButtonClass } from "@/components/auth/RequireAuth";
import { StatusBadge } from "@/components/account/StatusBadge";
import { supabase, type Consultation, type Profile } from "@/lib/supabase";

export function AccountView() {
  return <RequireAuth>{({ session, profile }) => <Account userId={session.user.id} email={session.user.email ?? ""} profile={profile} />}</RequireAuth>;
}

function Account({ userId, email, profile }: { userId: string; email: string; profile: Profile | null }) {
  const [rows, setRows] = useState<Consultation[] | null>(null);

  useEffect(() => {
    supabase()
      .from("consultations")
      .select("*")
      .eq("customer_id", userId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Consultation[]) ?? []));
  }, [userId]);

  const visible = rows?.filter((r) => r.status !== "awaiting_payment") ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-ink">
            {profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-1 text-[14px] text-ink-muted">{email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile?.role === "admin" && (
            <Link href="/admin/" className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-white">
              Admin
            </Link>
          )}
          <Link href="/doctor/" className="rounded-full bg-surface px-4 py-2 text-[13.5px] font-semibold text-brand-deep ring-1 ring-line">
            {profile?.role === "doctor" ? "Doctor dashboard" : "Are you a vet?"}
          </Link>
          <button type="button" onClick={() => supabase().auth.signOut().then(() => location.assign("/"))} className={signOutButtonClass()}>
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-[20px] font-bold text-ink">Your consultations</h2>
        <Link href="/consult/" className="rounded-full bg-clay px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-clay/90">
          New consultation
        </Link>
      </div>

      {rows === null ? (
        <p className="mt-6 text-ink-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-surface p-6 text-[15px] text-ink-muted ring-1 ring-line-soft">
          No consultations yet. When you book and pay, your chat with the vet appears here.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {visible.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/?c=${c.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-5 ring-1 ring-line-soft transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-deep/10"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold tracking-widest text-ink-faint">{c.code}</p>
                  <p className="mt-1 font-semibold text-ink">
                    {c.pet_species}
                    {c.pet_age ? ` · ${c.pet_age}` : ""} — <span className="font-normal text-ink-muted">{c.issue.slice(0, 70)}{c.issue.length > 70 ? "…" : ""}</span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-ink-faint">{new Date(c.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
