import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";

const TARGETS = [
  ["Cases resolved remotely, no visit", "≥ 50%"],
  ["Dispatch offers accepted within 30 min", "≥ 70%"],
  ["Median time from case raised to vet at gate", "< 4 hrs"],
  ["Farmers raising a second case within 90 days", "≥ 40%"],
  ["Incremental monthly earnings, active vets", "≥ ₹15,000"],
  ["Disputes on closure amounts", "< 2%"],
];

export function Pilot() {
  return (
    <section id="pilot" className="py-28 sm:py-36">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <Pill tone="clay" className="mb-7">
            The pilot
          </Pill>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance text-ink">
            Six months. Three talukas. Sixty vets.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-ink-muted">
            Three contiguous talukas in Pune district — not thirty scattered
            villages. In a dispatch business, density is the product.
          </p>
        </Reveal>

        <Reveal className="mt-16" delay={120}>
          <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-line-soft">
            <div className="border-b border-line-soft px-7 py-5 sm:px-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                What we committed to before starting
              </p>
            </div>
            <dl>
              {TARGETS.map(([metric, target], i) => (
                <div
                  key={metric}
                  className={`flex items-baseline justify-between gap-6 px-7 py-5 sm:px-9 ${
                    i !== TARGETS.length - 1 ? "border-b border-line-soft" : ""
                  }`}
                >
                  <dt className="text-[15px] leading-snug text-ink-soft">{metric}</dt>
                  <dd className="shrink-0 font-mono text-[15px] font-medium tabular-nums text-brand">
                    {target}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal className="mt-10" delay={200}>
          <div className="mx-auto max-w-2xl rounded-3xl bg-clay-soft px-8 py-7 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-clay">
              And what would make us stop
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
              Repeat rate below 20% at month five, or fewer than thirty vets
              still active at month six. Either means the loop doesn&rsquo;t
              hold — and we would rather learn that now than later.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
