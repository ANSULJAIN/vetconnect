"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Local YYYY-MM-DD. Deliberately not toISOString(), which shifts by timezone. */
export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function formatLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Month-grid date picker. Bookings are only taken for the next 60 days, so
 * anything outside that window is disabled rather than hidden — a greyed-out
 * date explains itself; a missing one doesn't.
 */
export function Calendar({
  value,
  onChange,
  maxDaysAhead = 60,
}: {
  value: string;
  onChange: (iso: string) => void;
  maxDaysAhead?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = new Date(today);
  last.setDate(last.getDate() + maxDaysAhead);

  const [view, setView] = useState(() => {
    const [y, m] = value.split("-").map(Number);
    return value ? new Date(y, m - 1, 1) : new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const canGoBack = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoForward = new Date(year, month, 1) < new Date(last.getFullYear(), last.getMonth(), 1);

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line-soft sm:p-5">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setView(new Date(year, month - 1, 1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper disabled:pointer-events-none disabled:opacity-25"
        >
          <Chevron className="h-4 w-4 rotate-180" />
        </button>

        <p className="font-display text-[16px] font-bold tracking-tight text-ink">
          {MONTHS[month]} {year}
        </p>

        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper disabled:pointer-events-none disabled:opacity-25"
        >
          <Chevron className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            aria-hidden
            className="pb-1 text-center text-[11px] font-bold tracking-wide text-ink-faint"
          >
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;

          const date = new Date(year, month, day);
          const iso = toISODate(date);
          const disabled = date < today || date > last;
          const selected = iso === value;
          const isToday = iso === toISODate(today);

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              aria-pressed={selected}
              aria-label={formatLong(iso)}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-[14px] font-medium tabular-nums transition-all",
                disabled && "cursor-not-allowed text-ink-faint/35",
                !disabled && !selected && "text-ink-soft hover:bg-clay-soft hover:text-clay",
                selected && "bg-clay font-bold text-white shadow-sm",
              )}
            >
              {day}
              {isToday && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-clay" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <path
        d="m6 3 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
