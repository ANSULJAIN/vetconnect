"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Dose = {
  age: string;
  /** Shown in the timeline marker — the age is more use there than a count. */
  mark: string;
  name: string;
  /** Diseases the dose covers — the reason a pet owner actually cares. */
  covers: string;
  core: boolean;
};

const SCHEDULES: Record<
  "puppy" | "kitten",
  { label: string; emoji: string; doses: Dose[] }
> = {
  puppy: {
    label: "Puppies & dogs",
    emoji: "🐕",
    doses: [
      {
        age: "6–8 weeks",
        mark: "6w",
        name: "First DHPPi",
        covers: "Distemper · Hepatitis · Parvovirus · Parainfluenza",
        core: true,
      },
      {
        age: "10–12 weeks",
        mark: "10w",
        name: "DHPPi booster + Leptospirosis",
        covers: "The four above, plus Lepto — spread through rat urine and standing water",
        core: true,
      },
      {
        age: "14–16 weeks",
        mark: "14w",
        name: "Anti-rabies",
        covers: "Rabies. Legally required, and the one that protects your family too",
        core: true,
      },
      {
        age: "From 16 weeks",
        mark: "16w+",
        name: "Kennel cough (optional)",
        covers: "Bordetella — worth it if your dog boards, or meets other dogs at parks",
        core: false,
      },
      {
        age: "Every year",
        mark: "1yr",
        name: "Annual booster",
        covers: "DHPPi + Leptospirosis + rabies, to keep immunity topped up",
        core: true,
      },
    ],
  },
  kitten: {
    label: "Kittens & cats",
    emoji: "🐈",
    doses: [
      {
        age: "8–9 weeks",
        mark: "8w",
        name: "First FVRCP",
        covers: "Rhinotracheitis · Calicivirus · Panleukopenia",
        core: true,
      },
      {
        age: "12 weeks",
        mark: "12w",
        name: "FVRCP booster",
        covers: "The same three — the second dose is what makes the first work",
        core: true,
      },
      {
        age: "16 weeks",
        mark: "16w",
        name: "Anti-rabies",
        covers: "Rabies. Essential for any cat that goes outdoors",
        core: true,
      },
      {
        age: "From 9 weeks",
        mark: "9w+",
        name: "Feline leukaemia (optional)",
        covers: "FeLV — recommended for outdoor cats and multi-cat homes",
        core: false,
      },
      {
        age: "Every year",
        mark: "1yr",
        name: "Annual booster",
        covers: "FVRCP + rabies, to keep immunity topped up",
        core: true,
      },
    ],
  },
};

export function VaccineSchedule() {
  const [species, setSpecies] = useState<"puppy" | "kitten">("puppy");
  const active = SCHEDULES[species];

  return (
    <div>
      <div className="flex gap-2.5" role="tablist" aria-label="Species">
        {(Object.keys(SCHEDULES) as ("puppy" | "kitten")[]).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={species === k}
            onClick={() => setSpecies(k)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-[15px] font-semibold transition-all sm:flex-none sm:px-7",
              species === k
                ? "bg-brand text-white shadow-md shadow-brand/20"
                : "bg-surface text-ink-soft ring-1 ring-line-soft hover:ring-brand/40",
            )}
          >
            <span aria-hidden className="text-[20px] leading-none">
              {SCHEDULES[k].emoji}
            </span>
            {SCHEDULES[k].label}
          </button>
        ))}
      </div>

      {/* timeline */}
      <ol className="relative mt-9 flex flex-col gap-0 pl-1">
        {active.doses.map((d, i) => (
          <li key={`${species}-${i}`} className="group/dose relative flex gap-5 pb-7 last:pb-0">
            {/* rail */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "z-10 flex h-13 w-13 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ring-4 ring-paper-deep/50 transition-transform duration-300 group-hover/dose:scale-110",
                  d.core
                    ? "bg-brand text-white shadow-md shadow-brand/25"
                    : "bg-surface text-clay ring-1 ring-clay/30",
                )}
              >
                {d.mark}
              </span>
              {i < active.doses.length - 1 && (
                <span aria-hidden className="w-[2px] flex-1 bg-line" />
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-paper-deep px-3 py-1 font-mono text-[11px] font-bold tracking-wide text-ink-soft">
                  {d.age}
                </span>
                {!d.core && (
                  <span className="rounded-full bg-clay-soft px-3 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-clay uppercase">
                    Optional
                  </span>
                )}
              </div>
              <h3 className="mt-2.5 font-display text-[18px] font-bold tracking-tight text-ink">
                {d.name}
              </h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{d.covers}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
