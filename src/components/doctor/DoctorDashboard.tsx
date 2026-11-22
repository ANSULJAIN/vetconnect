"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RequireAuth, signOutButtonClass } from "@/components/auth/RequireAuth";
import { StatusBadge, UrgencyBadge } from "@/components/account/StatusBadge";
import { DoctorJoinForm } from "@/components/doctor/DoctorJoinForm";
import { supabase, type Consultation, type Doctor } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function DoctorArea() {
  return <RequireAuth>{({ session }) => <DoctorHome userId={session.user.id} />}</RequireAuth>;
}

function DoctorHome({ userId }: { userId: string }) {
  const [doctor, setDoctor] = useState<Doctor | null | undefined>(undefined);

  const load = useCallback(async () => {
    const { data } = await supabase().from("doctors").select("*").eq("id", userId).maybeSingle();
    setDoctor((data as Doctor) ?? null);
  }, [userId]);

  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  if (doctor === undefined) return <p className="py-20 text-center text-ink-muted">Loading…</p>;
  if (doctor === null) return <DoctorJoinForm userId={userId} onDone={load} />;
  if (doctor.status !== "verified") return <Pending doctor={doctor} />;
  return <Dashboard doctor={doctor} onChange={setDoctor} />;
}

function Pending({ doctor }: { doctor: Doctor }) {
  return (
    <div className="rounded-3xl bg-surface p-8 text-center shadow-lg ring-1 ring-line-soft">
      <StatusBadge status={doctor.status} />
      <h1 className="mt-4 font-display text-[26px] font-extrabold text-ink">
        {doctor.status === "pending" ? "Thanks — we're reviewing your registration" : "Your registration needs attention"}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
        {doctor.status === "pending"
          ? `We check ${doctor.registration_no} with the ${doctor.council_state} council and will switch on your dashboard once verified.`
          : doctor.review_note ?? "Please contact us on WhatsApp for details."}
      </p>
    </div>
  );
}

function Dashboard({ doctor, onChange }: { doctor: Doctor; onChange: (d: Doctor) => void }) {
  const sb = supabase();
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [mine, setMine] = useState<Consultation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [q, m] = await Promise.all([
      sb.from("consultations").select("*").is("doctor_id", null).eq("status", "paid").order("paid_at"),
      sb.from("consultations").select("*").eq("doctor_id", doctor.id).order("assigned_at", { ascending: false }).limit(50),
    ]);
    setQueue((q.data as Consultation[]) ?? []);
    setMine((m.data as Consultation[]) ?? []);
  }, [sb, doctor.id]);

  useEffect(() => {
    queueMicrotask(load);
    // Any change to consultations we can see (new paid case, assignment) refreshes the lists.
    const ch = sb
      .channel("doctor-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" }, (p) => {
        load();
        const row = p.new as Partial<Consultation>;
        if (document.hidden && (row.doctor_id === doctor.id || (row.status === "paid" && !row.doctor_id))) {
          document.title = "🔔 New case · VetConnect";
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              new Notification("New consultation", { body: `${row.pet_species ?? "Pet"}: ${row.issue?.slice(0, 80) ?? ""}` });
            } catch {}
          }
        }
      })
      .subscribe();
    if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission().catch(() => {});
    const onVis = () => !document.hidden && (document.title = "Doctor dashboard | VetConnect");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      sb.removeChannel(ch);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [sb, load, doctor.id]);

  async function toggleOnline() {
    const { data, error } = await sb.from("doctors").update({ is_online: !doctor.is_online }).eq("id", doctor.id).select("*").single();
    if (error) setError("Could not change status.");
    else onChange(data as Doctor);
  }

  async function claim(id: string) {
    setError(null);
    const { error } = await sb.rpc("claim_consultation", { c_id: id });
    if (error) {
      setError(error.message.includes("taken") ? "Another vet just took that case." : "Could not take the case.");
      load();
      return;
    }
    location.assign(`/chat/?c=${id}`);
  }

  const active = mine.filter((c) => c.status === "active");
  const past = mine.filter((c) => c.status === "closed");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink">{doctor.full_name}</h1>
          <p className="mt-1 text-[14px] text-ink-muted">{doctor.qualification} · {doctor.species.join(", ")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleOnline}
            aria-pressed={doctor.is_online}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-all",
              doctor.is_online ? "bg-brand text-white shadow-md shadow-brand/25" : "bg-surface text-ink-muted ring-1 ring-line",
            )}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", doctor.is_online ? "bg-white" : "bg-ink-faint")} />
            {doctor.is_online ? "Online — taking cases" : "Offline"}
          </button>
          <button type="button" onClick={() => sb.auth.signOut().then(() => location.assign("/"))} className={signOutButtonClass()}>
            Sign out
          </button>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-ink-faint">
        While you&rsquo;re online, new paid cases matching your species and languages are assigned to you automatically. Keep this tab open to get alerts.
      </p>
      {error && <p role="alert" className="mt-3 text-[13.5px] text-clay">{error}</p>}

      <Section title={`Your active chats (${active.length})`}>
        {active.length === 0 ? <Empty>No active chats.</Empty> : active.map((c) => <CaseRow key={c.id} c={c} href={`/chat/?c=${c.id}`} />)}
      </Section>

      <Section title={`Waiting for a vet (${queue.length})`}>
        {queue.length === 0 ? (
          <Empty>No one is waiting right now.</Empty>
        ) : (
          queue.map((c) => (
            <CaseRow key={c.id} c={c} action={<button type="button" onClick={() => claim(c.id)} className="rounded-full bg-clay px-4 py-2 text-[13px] font-semibold text-white">Take case</button>} />
          ))
        )}
      </Section>

      <Section title="Recently closed">
        {past.length === 0 ? <Empty>Nothing yet.</Empty> : past.slice(0, 10).map((c) => <CaseRow key={c.id} c={c} href={`/chat/?c=${c.id}`} />)}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="font-display text-[18px] font-bold text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-surface px-5 py-4 text-[14px] text-ink-muted ring-1 ring-line-soft">{children}</p>;
}

function CaseRow({ c, href, action }: { c: Consultation; href?: string; action?: React.ReactNode }) {
  const body = (
    <>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold tracking-widest text-ink-faint">{c.code}</span>
          <StatusBadge status={c.status} />
          <UrgencyBadge urgency={c.urgency} />
        </div>
        <p className="mt-1.5 font-semibold text-ink">
          {c.pet_species}{c.pet_age ? `, ${c.pet_age}` : ""} · <span className="font-normal text-ink-muted">{c.language}</span>
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13.5px] text-ink-muted">{c.intake?.summary ?? c.issue}</p>
      </div>
      {action}
    </>
  );
  const cls = "flex items-center justify-between gap-4 rounded-2xl bg-surface p-4 ring-1 ring-line-soft";
  return href ? <Link href={href} className={cn(cls, "transition-all hover:shadow-md")}>{body}</Link> : <div className={cls}>{body}</div>;
}
