"use client";

import { useState } from "react";
import { Calendar, formatLong, toISODate } from "@/components/booking/Calendar";
import { BookingConfirm, type Booking } from "@/components/booking/BookingConfirm";
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

const TIME_SLOTS = [
  "As soon as possible",
  "10:00 – 12:00",
  "12:00 – 15:00",
  "15:00 – 18:00",
  "18:00 – 21:00",
  "21:00 – 23:00",
];

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
    "",
    `Consultation ₹${SITE.consultPrice}. Please send the payment link.`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export function BookingForm() {
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [pet, setPet] = useState<string>(PETS[0]);
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [issue, setIssue] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [sent, setSent] = useState<{ booking: Booking; waUrl: string } | null>(null);

  const phoneOk = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
  const canSubmit = name.trim().length > 1 && phoneOk && issue.trim().length > 4;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const booking: Booking = {
      ref: makeRef(),
      date,
      dateLong: formatLong(date),
      slot,
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
              <div className="mt-3 flex flex-col gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSlot(t)}
                    aria-pressed={slot === t}
                    className={cn(
                      "rounded-xl px-4 py-3 text-left text-[14.5px] font-medium transition-all",
                      slot === t
                        ? "bg-clay text-white shadow-sm"
                        : "bg-surface text-ink-soft ring-1 ring-line-soft hover:text-clay hover:ring-clay/40",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-clay-soft/60 p-4">
                <p className="font-mono text-[10.5px] font-bold tracking-[0.14em] text-clay uppercase">
                  Your appointment
                </p>
                <p className="mt-1.5 font-display text-[17px] leading-snug font-bold text-ink">
                  {formatLong(date)}
                </p>
                <p className="mt-1 text-[13.5px] text-ink-muted">{slot}</p>
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
          <textarea
            id="issue"
            required
            rows={4}
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Symptoms, when they started, appetite and energy levels, anything you have already tried…"
            className={cn(inputClass, "resize-y")}
          />
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
                ₹{SITE.consultPrice}
              </p>
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="group inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 text-[16px] font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-vivid hover:shadow-xl hover:shadow-vivid/35 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
            >
              <IconWhatsApp className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Book on WhatsApp
            </button>
          </div>
          <p className="mt-3 text-[12.5px] text-ink-faint">
            We open WhatsApp with your details — press send, and we reply with the
            payment link. Nothing is charged here.
          </p>
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
