import { Reveal } from "@/components/ui/Reveal";
import { Buffalo } from "@/components/illustrations/Buffalo";

/**
 * The hero device. Built entirely in markup rather than as an image so it stays
 * sharp at any density and can be edited without a design tool.
 */
export function PhoneMockup() {
  return (
    <Reveal className="relative mt-20 flex justify-center" delay={120}>
      {/* floating cards, desktop only */}
      <FloatingCard
        className="left-0 top-16 hidden xl:flex"
        label="Case raised"
        value="Buffalo · off feed 2 days"
        meta="Haveli taluka · 06:12"
      />
      <FloatingCard
        className="right-0 top-52 hidden xl:flex"
        label="Vet accepted"
        value="Dr. Ravi Patil"
        meta="4.2 km away · 11 min"
        accent
      />

      <div className="relative">
        {/* glow */}
        <div
          aria-hidden="true"
          className="absolute -inset-x-16 -inset-y-10 rounded-[4rem] bg-brand/8 blur-3xl"
        />

        {/* device */}
        <div
          className="relative w-[290px] rounded-[2.75rem] bg-ink p-2.5 shadow-2xl
                     shadow-ink/25 sm:w-[320px]"
        >
          <div className="relative overflow-hidden rounded-[2.25rem] bg-paper">
            {/* notch */}
            <div className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" />

            {/* screen */}
            <div className="px-5 pb-7 pt-12">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                Consultant queue
              </p>

              {/* case card */}
              <div className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-line-soft">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-clay-soft px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-clay">
                    Urgent
                  </span>
                  <span className="font-mono text-[9px] text-ink-faint">06:12</span>
                </div>
                <p className="mt-2.5 text-[14px] font-semibold text-ink">Suresh Kale</p>
                <p className="text-[11px] text-ink-muted">Buffalo · Haveli</p>

                {/* symptom image stand-in */}
                <div className="mt-3 flex h-24 items-center justify-center rounded-xl bg-brand-wash ring-1 ring-brand-soft">
                  <Buffalo className="h-16 w-auto text-brand/45" />
                </div>

                <p className="mt-3 text-[11px] leading-snug text-ink-soft">
                  Not eating since yesterday evening. Reduced milk, mild fever.
                </p>
              </div>

              {/* triage actions */}
              <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-brand px-3.5 py-2.5 text-[11px] font-medium text-white">
                  Resolve remotely
                </div>
                <div className="rounded-xl bg-surface px-3.5 py-2.5 text-[11px] font-medium text-ink ring-1 ring-line-soft">
                  Needs a visit — dispatch
                </div>
              </div>

              {/* match strip */}
              <div className="mt-4 rounded-2xl bg-ink p-3.5">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-paper/50">
                  Best match
                </p>
                <p className="mt-1.5 text-[12px] font-semibold text-paper">
                  Dr. Ravi Patil
                </p>
                <div className="mt-2.5 flex gap-1">
                  {[
                    ["Distance", "w-[86%]"],
                    ["Rating", "w-[94%]"],
                    ["Experience", "w-[72%]"],
                  ].map(([label, w]) => (
                    <div key={label} className="flex-1">
                      <div className="h-1 rounded-full bg-paper/15">
                        <div className={`h-1 rounded-full bg-brand-soft ${w}`} />
                      </div>
                      <p className="mt-1 font-mono text-[7px] text-paper/40">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function FloatingCard({
  className,
  label,
  value,
  meta,
  accent,
}: {
  className?: string;
  label: string;
  value: string;
  meta: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`absolute w-56 flex-col rounded-2xl bg-surface/90 p-4 shadow-xl
                  shadow-ink/5 ring-1 ring-line-soft backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${accent ? "bg-brand" : "bg-clay"}`}
        />
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </p>
      </div>
      <p className="mt-2 text-[13px] font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{meta}</p>
    </div>
  );
}
