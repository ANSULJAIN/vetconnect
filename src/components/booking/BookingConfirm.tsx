"use client";

import { useEffect, useRef } from "react";
import { IconCheck, IconWhatsApp } from "@/components/illustrations/PetIcons";
import { SITE } from "@/data/site";

export type Booking = {
  ref: string;
  date: string;
  dateLong: string;
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

/**
 * Shown after the WhatsApp hand-off. It has a job beyond celebration: if the
 * browser blocked the popup, this is where the customer finds the link again.
 */
export function BookingConfirm({
  booking,
  waUrl,
  onClose,
}: {
  booking: Booking;
  waUrl: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const rows: [string, string][] = [
    ["Reference", booking.ref],
    ["When", `${booking.dateLong} · ${booking.slot}`],
    ["Pet", [booking.pet, booking.gender, booking.age].filter(Boolean).join(" · ")],
    ["Language", booking.language],
    ["Call back on", booking.phone],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-[pop_.3s_cubic-bezier(.22,1,.36,1)] w-full max-w-lg rounded-3xl bg-surface p-7 shadow-2xl sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
            <IconCheck className="h-7 w-7" />
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
              <path
                d="M5 5l10 10M15 5L5 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <h2
          id="confirm-title"
          className="mt-5 font-display text-[26px] leading-tight font-extrabold tracking-tight text-ink"
        >
          Request sent — check WhatsApp
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
          We have opened WhatsApp with your booking details.{" "}
          <strong className="font-semibold text-ink">Press send</strong> in that
          chat to confirm, and we will reply with the payment link and your
          veterinarian.
        </p>

        <dl className="mt-6 overflow-hidden rounded-2xl ring-1 ring-line-soft">
          {rows.map(([k, v], i) => (
            <div
              key={k}
              className={`flex gap-4 px-5 py-3 text-[14px] ${
                i % 2 ? "bg-surface" : "bg-paper/70"
              }`}
            >
              <dt className="w-20 shrink-0 font-semibold text-ink-muted sm:w-28">{k}</dt>
              <dd className="min-w-0 font-medium break-words text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-4 text-[15.5px] font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-vivid hover:shadow-xl hover:shadow-vivid/35"
        >
          <IconWhatsApp className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          Open WhatsApp again
        </a>

        <p className="mt-4 text-center text-[13px] leading-relaxed text-ink-faint">
          Nothing opened? Message us directly on{" "}
          <span className="font-semibold text-ink-muted">{SITE.whatsapp}</span> and
          quote {booking.ref}.
        </p>
      </div>
    </div>
  );
}
