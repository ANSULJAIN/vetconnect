import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";

export function Verification() {
  return (
    <section className="py-28 sm:py-36">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <Pill tone="brand" className="mb-7">
              Verification
            </Pill>
            <h2 className="font-display text-[clamp(2rem,4.2vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.03em] text-balance text-ink">
              Every vet clears two rounds before they see a single case
            </h2>
            <p className="mt-6 text-[16.5px] leading-relaxed text-ink-muted">
              Anyone can build an app. What takes time — and is the reason this
              works — is a network of veterinarians whose credentials have
              actually been checked, one at a time.
            </p>

            <dl className="mt-10 space-y-6">
              {[
                [
                  "Round 1 · Documents",
                  "Government VCI registration number and a photograph of the card. Registration numbers are unique on the platform, so one licence cannot be shared.",
                ],
                [
                  "Round 2 · Interview",
                  "A fifteen-minute live interview with our operations team. Until it is passed, the account cannot receive a live case.",
                ],
              ].map(([term, desc]) => (
                <div key={term} className="border-l-2 border-brand-soft pl-5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.13em] text-brand">
                    {term}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                    {desc}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={140}>
            <VerificationCard />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function VerificationCard() {
  return (
    <div className="relative mx-auto max-w-sm">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2.5rem] bg-brand/8 blur-2xl"
      />

      <div className="relative rounded-3xl bg-surface p-7 shadow-xl shadow-ink/5 ring-1 ring-line-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-[19px] font-bold tracking-tight text-ink">
              Dr. Ravi Patil
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">MVSc · 12 years</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-brand-deep">
            <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
              <path
                d="M2.5 6.2l2.4 2.4L9.6 3.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Verified
          </span>
        </div>

        <dl className="mt-6 space-y-3.5 border-t border-line-soft pt-6">
          {[
            ["VCI number", "VCI-MH-44112"],
            ["Registration", "MH-VET-77821"],
            ["Districts", "Pune"],
            ["Interview", "Passed"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                {k}
              </dt>
              <dd className="text-[13.5px] font-medium tabular-nums text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-2xl bg-paper p-4 ring-1 ring-line-soft">
          <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-ink-faint">
            Match score for this case
          </p>
          <div className="mt-3 space-y-2.5">
            {[
              ["Distance", "4.2 km", 88],
              ["Rating", "4.8", 96],
              ["Experience", "12 yrs", 74],
            ].map(([label, val, pct]) => (
              <div key={label as string}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-ink-muted">{label}</span>
                  <span className="font-mono text-[10px] tabular-nums text-ink">
                    {val}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
