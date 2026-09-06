"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import { LANGUAGES, PETS, SITE } from "@/data/site";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "paying" }
  | { kind: "done"; paymentId: string }
  | { kind: "error"; message: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const TIME_SLOTS = [
  "As soon as possible",
  "10:00 – 12:00",
  "12:00 – 15:00",
  "15:00 – 18:00",
  "18:00 – 21:00",
  "21:00 – 23:00",
];

export function BookingForm() {
  const [scriptReady, setScriptReady] = useState(false);

  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(TIME_SLOTS[0]);
  const [pet, setPet] = useState<string>(PETS[0]);
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState<string>(LANGUAGES[0]);
  const [issue, setIssue] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const days = useMemo(() => {
    const out: { label: string; date: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      out.push({
        label:
          i === 0
            ? "Today"
            : i === 1
              ? "Tomorrow"
              : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
        date: d.toISOString().slice(0, 10),
      });
    }
    return out;
  }, []);

  const phoneOk = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
  const canSubmit =
    name.trim().length > 1 && phoneOk && issue.trim().length > 4 && status.kind !== "paying";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus({ kind: "paying" });

    const booking = {
      date: days[day].date,
      slot,
      pet,
      gender,
      age,
      language,
      issue: issue.trim(),
      name: name.trim(),
      phone: phone.replace(/\D/g, "").slice(-10),
      email: email.trim(),
    };

    try {
      // 1. Ask our own API to create a Razorpay order. The amount is decided
      //    server-side — never trust a price sent from the browser.
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ booking }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        bookingId?: string;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.orderId || !data.keyId) {
        throw new Error(data.error ?? "Could not start the payment. Please try again.");
      }

      if (!window.Razorpay) {
        throw new Error("Payment window failed to load. Check your connection and retry.");
      }

      // 2. Hand the order to Razorpay Checkout.
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        name: "VetConnect",
        description: "Online veterinary consultation",
        image: "/images/icon.png",
        prefill: { name: booking.name, contact: booking.phone, email: booking.email },
        notes: { bookingId: data.bookingId ?? "" },
        theme: { color: "#1f6b3a" },
        modal: {
          ondismiss: () =>
            setStatus({ kind: "error", message: "Payment cancelled. Your slot was not booked." }),
        },
        handler: async (r: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Confirm with our API, which re-checks the signature. The browser
          //    saying "paid" is not proof of anything.
          const v = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...r, bookingId: data.bookingId }),
          });
          const vd = (await v.json()) as { ok?: boolean; error?: string };
          if (v.ok && vd.ok) {
            setStatus({ kind: "done", paymentId: r.razorpay_payment_id });
          } else {
            setStatus({
              kind: "error",
              message:
                vd.error ??
                "We could not confirm the payment. If money was deducted, contact support with your payment ID.",
            });
          }
        },
      });

      rzp.open();
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="rounded-2xl bg-surface p-10 text-center shadow-sm ring-1 ring-line-soft">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
          <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="mt-6 font-display text-[26px] font-extrabold tracking-tight text-ink">
          Booking confirmed
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15.5px] leading-relaxed text-ink-muted">
          A veterinarian will call you on <strong className="text-ink">{phone}</strong>{" "}
          {slot === TIME_SLOTS[0]
            ? `within about ${SITE.connectMinutes} minutes`
            : `during your ${slot} slot`}
          . We have sent the details to your phone.
        </p>
        <p className="mt-6 font-mono text-[12px] text-ink-faint">
          Payment ID {status.paymentId}
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <Field legend="Appointment schedule" step={1}>
          <Label>Preferred day</Label>
          <ChipRow>
            {days.map((d, i) => (
              <Chip key={d.date} active={day === i} onClick={() => setDay(i)}>
                {d.label}
              </Chip>
            ))}
          </ChipRow>

          <Label className="mt-6">Preferred time</Label>
          <ChipRow>
            {TIME_SLOTS.map((t) => (
              <Chip key={t} active={slot === t} onClick={() => setSlot(t)}>
                {t}
              </Chip>
            ))}
          </ChipRow>
        </Field>

        <Field legend="Pet information" step={2}>
          <Label>Select your pet</Label>
          <ChipRow>
            {PETS.map((p) => (
              <Chip key={p} active={pet === p} onClick={() => setPet(p)}>
                {p}
              </Chip>
            ))}
          </ChipRow>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Gender</Label>
              <ChipRow>
                {["Male", "Female", "Not known"].map((g) => (
                  <Chip key={g} active={gender === g} onClick={() => setGender(g)}>
                    {g}
                  </Chip>
                ))}
              </ChipRow>
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 2.5 years"
                className={inputClass}
              />
            </div>
          </div>

          <Label className="mt-6">Consultation language</Label>
          <ChipRow>
            {LANGUAGES.map((l) => (
              <Chip key={l} active={language === l} onClick={() => setLanguage(l)}>
                {l}
              </Chip>
            ))}
          </ChipRow>

          <Label htmlFor="issue" className="mt-6">
            Describe your pet&rsquo;s issue <Req />
          </Label>
          <textarea
            id="issue"
            required
            rows={4}
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Symptoms, when they started, appetite and energy levels, anything you have already tried…"
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Field legend="Your details" step={3}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">
                Your name <Req />
              </Label>
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
              <Label htmlFor="phone">
                Mobile number <Req />
              </Label>
              <input
                id="phone"
                required
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                autoComplete="tel"
                aria-invalid={phone.length > 0 && !phoneOk}
                className={cn(
                  inputClass,
                  phone.length > 0 && !phoneOk && "ring-clay focus:ring-clay",
                )}
              />
              {phone.length > 0 && !phoneOk && (
                <p className="mt-1.5 text-[13px] text-clay">
                  Enter a valid 10-digit Indian mobile number.
                </p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <Label htmlFor="email">Email (optional)</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
            />
          </div>
        </Field>

        {status.kind === "error" && (
          <p
            role="alert"
            className="rounded-xl border-l-[3px] border-clay bg-clay-soft px-5 py-4 text-[14.5px] text-ink-soft"
          >
            {status.message}
          </p>
        )}

        <div className="rounded-2xl bg-surface p-5 shadow-lg ring-1 ring-line-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                Total payable
              </p>
              <p className="mt-1 font-display text-[28px] leading-none font-extrabold text-brand-deep">
                ₹{SITE.consultPrice}
              </p>
            </div>
            <button
              type="submit"
              disabled={!canSubmit || !scriptReady}
              className="inline-flex items-center gap-2.5 rounded-full bg-clay px-8 py-4 text-[16px] font-semibold text-white shadow-lg shadow-clay/25 transition-all hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              {status.kind === "paying" ? "Opening payment…" : `Pay ₹${SITE.consultPrice} and book`}
            </button>
          </div>
          <p className="mt-3 text-[12.5px] text-ink-faint">
            Secure payment via Razorpay — UPI, cards, net banking and wallets.
          </p>
        </div>
      </form>
    </>
  );
}

/* ---------- small presentational helpers ---------- */

const inputClass =
  "mt-2 w-full rounded-xl bg-surface px-4 py-3.5 text-[15px] text-ink shadow-sm ring-1 ring-line-soft transition-shadow placeholder:text-ink-faint focus:ring-2 focus:ring-brand focus:outline-none";

function Field({
  legend,
  step,
  children,
}: {
  legend: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft font-mono text-[12px] font-bold text-brand-deep">
          {step}
        </span>
        <span className="font-display text-[19px] font-bold tracking-tight text-ink">{legend}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted",
        className,
      )}
    >
      {children}
    </label>
  );
}

function Req() {
  return (
    <span className="text-clay" aria-hidden>
      *
    </span>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-4 py-2.5 text-[14px] font-medium transition-all",
        active
          ? "bg-clay text-white shadow-sm"
          : "bg-surface text-ink-soft ring-1 ring-line-soft hover:ring-brand/35",
      )}
    >
      {children}
    </button>
  );
}
