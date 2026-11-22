"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StatusBadge, UrgencyBadge } from "@/components/account/StatusBadge";
import { supabase, type Consultation, type Doctor, type Profile } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Tab = "consultations" | "doctors" | "funnel";

export function AdminArea() {
  return (
    <RequireAuth>
      {({ profile }) =>
        profile?.role === "admin" ? (
          <AdminPanel />
        ) : (
          <p className="py-20 text-center text-ink-muted">This page is for VetConnect admins.</p>
        )
      }
    </RequireAuth>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState<Tab>("consultations");
  return (
    <div>
      <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink">Admin</h1>
      <div className="mt-5 flex gap-2">
        {(["consultations", "doctors", "funnel"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-2 text-[14px] font-semibold capitalize",
              tab === t ? "bg-ink text-white" : "bg-surface text-ink-soft ring-1 ring-line",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "consultations" && <Consultations />}
        {tab === "doctors" && <Doctors />}
        {tab === "funnel" && <Funnel />}
      </div>
    </div>
  );
}

/* ---------------- consultations ---------------- */

function Consultations() {
  const sb = supabase();
  const [rows, setRows] = useState<Consultation[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, d] = await Promise.all([
      sb.from("consultations").select("*").neq("status", "awaiting_payment").order("created_at", { ascending: false }).limit(100),
      sb.from("doctors").select("*").eq("status", "verified").order("full_name"),
    ]);
    setRows((c.data as Consultation[]) ?? []);
    setDoctors((d.data as Doctor[]) ?? []);
  }, [sb]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function assign(cId: string, dId: string) {
    const { error } = await sb.rpc("assign_consultation", { c_id: cId, d_id: dId });
    setMsg(error ? `Could not assign: ${error.message}` : "Assigned.");
    load();
  }

  const name = (id: string | null) => doctors.find((d) => d.id === id)?.full_name ?? "—";
  const waiting = rows.filter((r) => r.status === "paid").length;

  return (
    <div>
      <p className="text-[14px] text-ink-muted">
        {rows.length} recent paid consultations · <strong className="text-clay">{waiting} waiting for a vet</strong>
      </p>
      {msg && <p className="mt-2 text-[13.5px] text-brand-deep">{msg}</p>}
      <div className="mt-4 flex flex-col gap-2.5">
        {rows.map((c) => (
          <div key={c.id} className="rounded-2xl bg-surface p-4 ring-1 ring-line-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold tracking-widest text-ink-faint">{c.code}</span>
              <StatusBadge status={c.status} />
              <UrgencyBadge urgency={c.urgency} />
              <span className="ml-auto text-[12px] text-ink-faint">₹{c.price_paise / 100} · {new Date(c.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            <p className="mt-1.5 text-[14px] text-ink">
              <strong>{c.customer_name}</strong> ({c.customer_phone}) · {c.pet_species} · {c.language}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[13.5px] text-ink-muted">{c.intake?.summary ?? c.issue}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-ink-muted">Vet: {name(c.doctor_id)}</span>
              {["paid", "active"].includes(c.status) && (
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && assign(c.id, e.target.value)}
                  className="rounded-lg bg-paper px-2 py-1.5 ring-1 ring-line"
                >
                  <option value="">{c.doctor_id ? "Reassign to…" : "Assign to…"}</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}{d.is_online ? " (online)" : ""}
                    </option>
                  ))}
                </select>
              )}
              <Link href={`/chat/?c=${c.id}`} className="font-semibold text-brand underline">Open chat</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- doctors ---------------- */

function Doctors() {
  const sb = supabase();
  const [rows, setRows] = useState<(Doctor & { email?: string | null })[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await sb.from("doctors").select("*").order("created_at", { ascending: false });
    const docs = (data as Doctor[]) ?? [];
    const { data: profiles } = await sb.from("profiles").select("id, email").in("id", docs.map((d) => d.id));
    const email = new Map((profiles as Pick<Profile, "id" | "email">[] | null)?.map((p) => [p.id, p.email]) ?? []);
    // Pending first.
    docs.sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));
    setRows(docs.map((d) => ({ ...d, email: email.get(d.id) })));
  }, [sb]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  async function review(id: string, status: Doctor["status"]) {
    const note = status === "rejected" ? prompt("Reason shown to the vet (optional):") ?? null : null;
    const { error } = await sb.rpc("review_doctor", { d_id: id, new_status: status, note });
    setMsg(error ? `Failed: ${error.message}` : `Marked ${status}.`);
    load();
  }

  async function openCert(path: string | null) {
    if (!path) return;
    const { data } = await sb.storage.from("doctor-documents").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div>
      {msg && <p className="mb-3 text-[13.5px] text-brand-deep">{msg}</p>}
      {rows.length === 0 && <p className="text-ink-muted">No registrations yet. Share vetconnect.co.in/doctor/ with vets.</p>}
      <div className="flex flex-col gap-2.5">
        {rows.map((d) => (
          <div key={d.id} className="rounded-2xl bg-surface p-4 ring-1 ring-line-soft">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-ink">{d.full_name}</strong>
              <StatusBadge status={d.status} />
              {d.is_online && <span className="text-[12px] font-semibold text-brand">● online</span>}
            </div>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              {d.qualification} · Reg. {d.registration_no} ({d.council_state}) · {d.experience_years ?? "?"} yrs · {d.phone} · {d.email ?? ""}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-faint">{d.species.join(", ")} · {d.languages.join(", ")}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
              <button type="button" onClick={() => openCert(d.certificate_path)} className="rounded-full px-3 py-1.5 font-semibold text-ink-soft ring-1 ring-line">
                View certificate
              </button>
              {d.status !== "verified" && (
                <button type="button" onClick={() => review(d.id, "verified")} className="rounded-full bg-brand px-3 py-1.5 font-semibold text-white">
                  Approve
                </button>
              )}
              {d.status === "pending" && (
                <button type="button" onClick={() => review(d.id, "rejected")} className="rounded-full px-3 py-1.5 font-semibold text-clay ring-1 ring-clay/40">
                  Reject
                </button>
              )}
              {d.status === "verified" && (
                <button type="button" onClick={() => review(d.id, "suspended")} className="rounded-full px-3 py-1.5 font-semibold text-clay ring-1 ring-clay/40">
                  Suspend
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- funnel ---------------- */

const STEPS: [string, string][] = [
  ["page_view", "Visited a page"],
  ["booking_start", "Filled the booking form"],
  ["intake_start", "Started AI intake"],
  ["intake_done", "Finished AI intake"],
  ["login_done", "Signed in"],
  ["pay_click", "Pressed Pay"],
  ["payment_success", "Paid"],
  ["chat_message", "Sent a chat message"],
  ["whatsapp_click", "Chose WhatsApp instead"],
];

function Funnel() {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<{ name: string; visitors: number; events: number }[] | null>(null);

  useEffect(() => {
    supabase()
      .rpc("funnel", { days })
      .then(({ data }) => setRows((data as { name: string; visitors: number; events: number }[]) ?? []));
  }, [days]);

  const by = new Map(rows?.map((r) => [r.name, r]) ?? []);
  const top = by.get("page_view")?.visitors || 1;

  return (
    <div>
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button key={d} type="button" onClick={() => setDays(d)} className={cn("rounded-full px-3 py-1.5 text-[13px] font-semibold", days === d ? "bg-ink text-white" : "bg-surface ring-1 ring-line")}>
            {d} days
          </button>
        ))}
      </div>
      {rows === null ? (
        <p className="mt-4 text-ink-muted">Loading…</p>
      ) : (
        <table className="mt-5 w-full text-[14px]">
          <thead>
            <tr className="text-left text-[12px] tracking-wide text-ink-faint uppercase">
              <th className="py-2">Step</th>
              <th className="py-2 text-right">Visitors</th>
              <th className="py-2 text-right">% of visitors</th>
            </tr>
          </thead>
          <tbody>
            {STEPS.map(([key, label]) => {
              const v = Number(by.get(key)?.visitors ?? 0);
              return (
                <tr key={key} className="border-t border-line-soft">
                  <td className="py-2.5 text-ink">{label}</td>
                  <td className="py-2.5 text-right font-mono">{v}</td>
                  <td className="py-2.5 text-right font-mono text-ink-muted">{((v / top) * 100).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
