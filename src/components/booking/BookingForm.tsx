"use client";

import { useState } from "react";
import { Calendar, formatLong, toISODate } from "@/components/booking/Calendar";
import { BookingConfirm, type Booking } from "@/components/booking/BookingConfirm";
import { VoiceInput } from "@/components/booking/VoiceInput";
import { Checkout, type CheckoutBooking } from "@/components/booking/Checkout";
import { supabaseReady } from "@/lib/supabase";
import { track } from "@/lib/track";
import {
  IconCake,
  IconCalendar,
  IconChat,
  IconClockSmall,
  IconGender,
  IconGlobe,
  IconPaw,
  IconUser,
  IconWhatsApp,
} from "@/components/illustrations/PetIcons";
import { LANGUAGES, PETS, SITE } from "@/data/site";
import { cn } from "@/lib/utils";

/** Each step carries its own accent so a selection reads as "this section". */
type Tone = "clay" | "brand" | "sky";

const ASAP = "As soon as possible";

/** "8:30 AM", from minutes since midnight. 1440 reads as midnight. */
function timeLabel(mins: number) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

type Slot = { start: number; short: string; label: string; night: boolean };

/** Half-hour slots while vets are on call — nothing between midnight and 8 AM. */
const SLOTS: Slot[] = Array.from(
  { length: (SITE.closeHour - SITE.openHour) * 2 },
  (_, i) => {
    const start = SITE.openHour * 60 + i * 30;
    return {
      start,
      short: timeLabel(start),
      label: `${timeLabel(start)} – ${timeLabel(start + 30)}`,
      night: start >= SITE.nightFromHour * 60,
    };
  },
);

const SLOT_GROUPS: { title: string; from: number; to: number }[] = [
  { title: "Morning", from: 0, to: 12 * 60 },
  { title: "Afternoon", from: 12 * 60, to: 17 * 60 },
  { title: "Evening", from: 17 * 60, to: SITE.nightFromHour * 60 },
  { title: "Late night", from: SITE.nightFromHour * 60, to: 24 * 60 },
];

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Late-night price for night slots, and for "as soon as possible" booked after 10 PM. */
function priceFor(slot: Slot | null) {
  const night = slot ? slot.night : nowMinutes() >= SITE.nightFromHour * 60;
  return night ? SITE.nightPrice : SITE.consultPrice;
}

/** Short, human, and unique enough to quote back over chat. */
function makeRef() {
  return `VC-${Math.random().toString(36).toUpperCase().slice(2, 6)}`;
}

function buildMessage(b: Booking) {
  return [
    `*VetConnect booking · ${b.ref}*`,
    "",
    `*When:* ${b.dateLong} · ${b.slot}`,
    `*Pet:* ${[b.pet, b.gender, b.age].filter(Boolean).join(" · ")}`,
    `*Language:* ${b.language}`,
    "",
    `*Issue:* ${b.issue}`,
    "",
    `*Name:* ${b.name}`,
    `*Phone:* ${b.phone}`,
    b.email ? `*Email:* ${b.email}` : "",
    b.voiceUrl ? `*Voice note:* ${b.voiceUrl}` : "",
    "",
    `Consultation ₹${b.price}. Please send the payment link.`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export function BookingForm() {
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [slot, setSlot] = useState(ASAP);

  // A slot that has already started today can't be booked.
  const isToday = date === toISODate(new Date());
  const isPast = (start: number) => isToday && start <= nowMinutes();
  const picked = SLOTS.find((s) => s.label === slot && !isPast(s.start)) ?? null;
  const effectiveSlot = picked ? picked.label : ASAP;
  const price = priceFor(picked);
  const [pet, setPet] = useState<string>(PETS[0]);
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [issue, setIssue] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [sent, setSent] = useState<{ booking: Booking; waUrl: string } | null>(null);
  const [checkout, setCheckout] = useState<CheckoutBooking | null>(null);

  const phoneOk = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
  const canSubmit = name.trim().length > 1 && phoneOk && issue.trim().length > 4;

  function details(): CheckoutBooking {
    return {
      date,
      dateLong: formatLong(date),
      slot: effectiveSlot,
      price,
      pet,
      gender,
      age: age.trim(),
      language,
      issue: issue.trim(),
      name: name.trim(),
      phone: phone.replace(/\D/g, "").slice(-10),
      email: email.trim(),
    };
  }

  /** Primary path once accounts are live: AI intake -> sign in -> pay -> chat. */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (!supabaseReady) return bookOnWhatsApp();
    track("booking_start", { pet, price });
    setCheckout(details());
  }

  function bookOnWhatsApp() {
    if (!canSubmit) return;
    track("whatsapp_click", { pet, price });
    setCheckout(null);

    const booking: Booking = {
      ref: makeRef(),
      date,
      dateLong: formatLong(date),
      slot: effectiveSlot,
      price,
      pet,
      gender,
      age: age.trim(),
      language,
      issue: issue.trim(),
      name: name.trim(),
      phone: phone.replace(/\D/g, "").slice(-10),
      email: email.trim(),
    };

    const waUrl = `https://wa.me/${SITE.whatsappDigits}?text=${encodeURIComponent(
      buildMessage(booking),
    )}`;

    // Opened before the modal renders, so it still counts as a user gesture
    // and is far less likely to be blocked.
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSent({ booking, waUrl });
  }

  return (
    <>
      {checkout && (
        <Checkout booking={checkout} onClose={() => setCheckout(null)} onWhatsApp={bookOnWhatsApp} />
      )}
      {sent && (
        <BookingConfirm
          booking={sent.booking}
          waUrl={sent.waUrl}
          onClose={() => setSent(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-11">
        {/* ---------- 1 · schedule ---------- */}
        <Section icon={IconCalendar} title="Appointment schedule" tone="clay">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
            <div>
              <SubLabel icon={IconCalendar} tone="clay">
                Appointment date
              </SubLabel>
              <div className="mt-3">
                <Calendar value={date} onChange={setDate} />
              </div>
            </div>

            <div>
              <SubLabel icon={IconClockSmall} tone="clay">
                Preferred time
              </SubLabel>
              <div className="mt-3">
                <SlotButton
                  label={ASAP}
                  active={effectiveSlot === ASAP}
                  onClick={() => setSlot(ASAP)}
                  className="w-full"
                />
              </div>
              {SLOT_GROUPS.map((g) => {
                const slots = SLOTS.filter((s) => s.start >= g.from && s.start < g.to);
                if (slots.length === 0) return null;
                const night = g.from >= SITE.nightFromHour * 60;
                return (
                  <div key={g.title} className="mt-4">
                    <p className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.08em] text-ink-muted uppercase">
                      {g.title}
                      {night && (
                        <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[10.5px] tracking-normal text-clay normal-case">
                          ₹{SITE.nightPrice}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <SlotButton
                          key={s.label}
                          label={s.short}
                          title={s.label}
                          active={effectiveSlot === s.label}
                          disabled={isPast(s.start)}
                          onClick={() => setSlot(s.label)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
                Vets are available 8 AM to midnight. Calls from 10 PM are ₹
                {SITE.nightPrice}.
              </p>

              <div className="mt-4 rounded-xl bg-clay-soft/60 p-4">
                <p className="font-mono text-[10.5px] font-bold tracking-[0.14em] text-clay uppercase">
                  Your appointment
                </p>
                <p className="mt-1.5 font-display text-[17px] leading-snug font-bold text-ink">
                  {formatLong(date)}
                </p>
                <p className="mt-1 text-[13.5px] text-ink-muted">{effectiveSlot}</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ---------- 2 · pet ---------- */}
        <Section icon={IconPaw} title="Pet information" tone="brand">
          <SubLabel icon={IconPaw} tone="brand">
            Select your pet
          </SubLabel>
          <ChipRow>
            {PETS.map((p) => (
              <Chip key={p} tone="brand" active={pet === p} onClick={() => setPet(p)}>
                {p}
              </Chip>
            ))}
          </ChipRow>

          <div className="mt-7 grid gap-7 sm:grid-cols-2">
            <div>
              <SubLabel icon={IconGender} tone="brand">
                Gender
              </SubLabel>
              <ChipRow>
                {["Male", "Female", "Not known"].map((g) => (
                  <Chip key={g} tone="brand" active={gender === g} onClick={() => setGender(g)}>
                    {g}
                  </Chip>
                ))}
              </ChipRow>
            </div>
            <div>
              <SubLabel icon={IconCake} tone="brand" htmlFor="age">
                Age
              </SubLabel>
              <input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 2.5 years"
                className={inputClass}
              />
            </div>
          </div>

          <SubLabel icon={IconGlobe} tone="sky" className="mt-7">
            Consultation language
          </SubLabel>
          <ChipRow>
            {LANGUAGES.map((l) => (
              <Chip key={l} tone="sky" active={language === l} onClick={() => setLanguage(l)}>
                {l}
              </Chip>
            ))}
          </ChipRow>

          <SubLabel icon={IconChat} tone="brand" htmlFor="issue" className="mt-7">
            Describe your pet&rsquo;s issue <Req />
          </SubLabel>
          <VoiceInput
            language={language}
            onTranscript={(text) =>
              setIssue((prev) => (prev ? `${prev.trimEnd()} ${text}` : text))
            }
          >
            <textarea
              id="issue"
              required
              rows={4}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Symptoms, when they started, appetite and energy levels, anything you have already tried… or tap the mic and speak."
              className={cn(inputClass, "block resize-none pb-14")}
            />
          </VoiceInput>
        </Section>

        {/* ---------- 3 · you ---------- */}
        <Section icon={IconUser} title="Your details" tone="brand">
          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <SubLabel icon={IconUser} tone="brand" htmlFor="name">
                Your name <Req />
              </SubLabel>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div>
              <SubLabel icon={IconChat} tone="brand" htmlFor="phone">
                Mobile number <Req />
              </SubLabel>
              <input
                id="phone"
                required
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                autoComplete="tel"
                aria-invalid={phone.length > 0 && !phoneOk}
                className={cn(inputClass, phone.length > 0 && !phoneOk && "ring-clay focus:ring-clay")}
              />
              {phone.length > 0 && !phoneOk && (
                <p className="mt-1.5 text-[13px] text-clay">
                  Enter a valid 10-digit Indian mobile number.
                </p>
              )}
            </div>
          </div>
          <div className="mt-7">
            <SubLabel icon={IconChat} tone="brand" htmlFor="email">
              Email <span className="font-normal text-ink-faint">(optional)</span>
            </SubLabel>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
            />
          </div>
        </Section>


        <div className="rounded-2xl bg-surface p-5 shadow-lg ring-1 ring-line-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold tracking-[0.06em] text-ink-muted uppercase">
                Consultation
              </p>
              <p className="mt-1 font-display text-[28px] leading-none font-extrabold text-brand-deep">
                ₹{price}
              </p>
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="group inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 text-[16px] font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-vivid hover:shadow-xl hover:shadow-vivid/35 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
            >
              {supabaseReady ? (
                <>Continue — ₹{price}</>
              ) : (
                <>
                  <IconWhatsApp className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  Book on WhatsApp
                </>
              )}
            </button>
          </div>
          {supabaseReady ? (
            <p className="mt-3 text-[12.5px] text-ink-faint">
              Sign in, pay securely, and chat with your vet right here.{" "}
              <button
                type="button"
                onClick={bookOnWhatsApp}
                disabled={!canSubmit}
                className="font-semibold text-brand underline underline-offset-2 disabled:opacity-50"
              >
                Prefer WhatsApp?
              </button>
            </p>
          ) : (
            <p className="mt-3 text-[12.5px] text-ink-faint">
              We open WhatsApp with your details — press send, and we reply with the
              payment link. Nothing is charged here.
            </p>
          )}
        </div>
      </form>
    </>
  );
}

/* ---------- presentational helpers ---------- */

const inputClass =
  "mt-2.5 w-full rounded-xl bg-surface px-4 py-3.5 text-[15px] text-ink shadow-sm ring-1 ring-line-soft transition-shadow placeholder:text-ink-faint focus:ring-2 focus:ring-brand focus:outline-none";

const TONE = {
  clay: {
    icon: "text-clay",
    chipOn: "bg-clay text-white shadow-sm",
    chipHover: "hover:ring-clay/40 hover:text-clay",
  },
  brand: {
    icon: "text-brand",
    chipOn: "bg-brand text-white shadow-sm",
    chipHover: "hover:ring-brand/40 hover:text-brand-deep",
  },
  sky: {
    icon: "text-sky",
    chipOn: "bg-sky text-white shadow-sm",
    chipHover: "hover:ring-sky/40 hover:text-sky",
  },
} as const;

type IconType = (p: { className?: string }) => React.ReactElement;

/** Section heading: coloured icon, dark uppercase title, full-width rule. */
function Section({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: IconType;
  title: string;
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-5 w-full">
        <span className="flex items-center gap-2.5 border-b border-line pb-3">
          <Icon className={cn("h-5 w-5 shrink-0", TONE[tone].icon)} />
          <span className="text-[15px] font-extrabold tracking-[0.05em] text-ink uppercase">
            {title}
          </span>
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

/** Field label: small coloured icon, bold dark uppercase text. */
function SubLabel({
  icon: Icon,
  tone,
  children,
  htmlFor,
  className,
}: {
  icon: IconType;
  tone: Tone;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag
      {...(htmlFor ? { htmlFor } : {})}
      className={cn("flex items-center gap-2", className)}
    >
      <Icon className={cn("h-4 w-4 shrink-0", TONE[tone].icon)} />
      <span className="text-[12px] font-bold tracking-[0.08em] text-ink-soft uppercase">
        {children}
      </span>
    </Tag>
  );
}

function Req() {
  return (
    <span className="text-clay" aria-hidden>
      {" "}
      *
    </span>
  );
}

function SlotButton({
  label,
  title,
  active,
  disabled,
  onClick,
  className,
}: {
  label: string;
  title?: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "rounded-xl px-3 py-2.5 text-center text-[13.5px] font-medium whitespace-nowrap transition-all",
        active
          ? "bg-clay text-white shadow-sm"
          : "bg-surface text-ink-soft ring-1 ring-line-soft hover:text-clay hover:ring-clay/40",
        disabled && "pointer-events-none opacity-40 line-through",
        className,
      )}
    >
      {label}
    </button>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  children,
  active,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone: Tone;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-4 py-2.5 text-[14px] font-medium transition-all",
        active
          ? TONE[tone].chipOn
          : cn("bg-surface text-ink-soft ring-1 ring-line-soft", TONE[tone].chipHover),
      )}
    >
      {children}
    </button>
  );
}
