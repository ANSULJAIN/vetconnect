"use client";

import { useState } from "react";
import { LANGUAGES } from "@/data/site";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

const SPECIES = ["Dog", "Cat", "Rabbit", "Bird", "Cow", "Buffalo", "Cattle", "Goat", "Other"];
const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other",
];

/**
 * Vet registration. Creates a `doctors` row with status "pending"; an admin
 * checks the registration number and certificate before the vet can take
 * consultations. Files go to Supabase Storage under the vet's own folder.
 */
export function DoctorJoinForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [f, setF] = useState({
    full_name: "",
    phone: "",
    qualification: "B.V.Sc. & A.H.",
    registration_no: "",
    council_state: "Madhya Pradesh",
    experience_years: "",
    bio: "",
  });
  const [species, setSpecies] = useState<string[]>(["Dog", "Cat"]);
  const [languages, setLanguages] = useState<string[]>(["English", "Hindi"]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [cert, setCert] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const phoneOk = /^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").slice(-10));
  const ok =
    f.full_name.trim().length > 2 && phoneOk && f.qualification.trim() && f.registration_no.trim().length > 2 &&
    species.length > 0 && languages.length > 0 && cert;

  async function upload(bucket: string, file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${userId}/${bucket === "doctor-photos" ? "photo" : "certificate"}-${Date.now()}.${ext}`;
    const { error } = await supabase().storage.from(bucket).upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw new Error(`Upload failed (${file.name}). Use JPG, PNG or PDF under 5 MB.`);
    return path;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok || !cert) return;
    setBusy(true);
    setError(null);
    try {
      const certificate_path = await upload("doctor-documents", cert);
      const photo_path = photo ? await upload("doctor-photos", photo) : null;
      const { error } = await supabase().from("doctors").insert({
        id: userId,
        full_name: f.full_name.trim().startsWith("Dr") ? f.full_name.trim() : `Dr. ${f.full_name.trim()}`,
        phone: f.phone.replace(/\D/g, "").slice(-10),
        qualification: f.qualification.trim(),
        registration_no: f.registration_no.trim(),
        council_state: f.council_state,
        experience_years: f.experience_years ? Number(f.experience_years) : null,
        species,
        languages,
        bio: f.bio.trim() || null,
        certificate_path,
        photo_path,
      });
      if (error) throw new Error(error.code === "23505" ? "You have already registered." : "Could not submit. Please try again.");
      track("doctor_join_submit");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-surface p-6 shadow-lg ring-1 ring-line-soft sm:p-8">
      <h1 className="font-display text-[28px] font-extrabold tracking-tight text-ink">Join VetConnect as a veterinarian</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
        Consult pet parents online from anywhere, on your own schedule. We verify every registration before you start.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Full name *"><input value={f.full_name} onChange={set("full_name")} placeholder="Dr. Asha Rao" className={input} /></Field>
        <Field label="Mobile number *"><input value={f.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit number" className={input} /></Field>
        <Field label="Qualification *"><input value={f.qualification} onChange={set("qualification")} className={input} /></Field>
        <Field label="Years of experience"><input value={f.experience_years} onChange={set("experience_years")} inputMode="numeric" className={input} /></Field>
        <Field label="Veterinary council registration no. *"><input value={f.registration_no} onChange={set("registration_no")} className={input} /></Field>
        <Field label="State council *">
          <select value={f.council_state} onChange={set("council_state")} className={input}>
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Animals you treat *" className="mt-6">
        <Chips options={SPECIES} value={species} onToggle={(v) => toggle(species, setSpecies, v)} />
      </Field>
      <Field label="Languages you consult in *" className="mt-5">
        <Chips options={[...LANGUAGES, "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam"]} value={languages} onToggle={(v) => toggle(languages, setLanguages, v)} />
      </Field>
      <Field label="Short bio (shown to pet parents)" className="mt-5">
        <textarea value={f.bio} onChange={set("bio")} rows={3} maxLength={600} className={cn(input, "resize-y")} placeholder="Areas of experience, species you specialise in…" />
      </Field>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Registration certificate * (PDF/JPG)">
          <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setCert(e.target.files?.[0] ?? null)} className={fileInput} />
        </Field>
        <Field label="Profile photo (square, optional)">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className={fileInput} />
        </Field>
      </div>

      {error && <p role="alert" className="mt-4 text-[13.5px] text-clay">{error}</p>}

      <button type="submit" disabled={!ok || busy} className="mt-7 rounded-full bg-brand px-8 py-4 text-[16px] font-semibold text-white shadow-lg shadow-brand/25 hover:bg-vivid disabled:opacity-45">
        {busy ? "Submitting…" : "Submit for verification"}
      </button>
      <p className="mt-3 text-[12.5px] text-ink-faint">
        We usually verify within one working day. You&rsquo;ll see your status on this page.
      </p>
    </form>
  );
}

const input =
  "mt-2 w-full rounded-xl bg-surface px-4 py-3 text-[15px] text-ink ring-1 ring-line focus:ring-2 focus:ring-brand focus:outline-none";
const fileInput =
  "mt-2 block w-full text-[13.5px] text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:font-semibold file:text-brand-deep";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[12px] font-bold tracking-[0.06em] text-ink-soft uppercase">{label}</span>
      {children}
    </label>
  );
}

function Chips({ options, value, onToggle }: { options: readonly string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onToggle(o)}
          aria-pressed={value.includes(o)}
          className={cn(
            "rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-all",
            value.includes(o) ? "bg-brand text-white" : "bg-paper text-ink-soft ring-1 ring-line-soft hover:text-brand-deep",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
