import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";
import { IconTriage, IconRoute, IconRx } from "@/components/illustrations/Icons";

const STEPS = [
  {
    n: "01",
    icon: IconTriage,
    tier: "Tier 1 — minutes",
    title: "Triage, remotely",
    body: "The farmer sends photographs, video and symptoms. An online consultant reviews and either resolves it there — advice, dosage, over-the-counter medicine — or escalates it.",
    highlight: "Most cases never need a vet to travel.",
  },
  {
    n: "02",
    icon: IconRoute,
    tier: "Tier 2 — hours",
    title: "Dispatch, locally",
    body: "Escalated cases are auto-assigned to the single best-matched local vet — scored on distance, rating and experience. Thirty minutes to accept, or it opens to a district claim pool.",
    highlight: "No case is ever left unanswered.",
  },
  {
    n: "03",
    icon: IconRx,
    tier: "Closure",
    title: "Close the loop",
    body: "The vet closes with a prescription photograph and reports travel and treatment cost. Payment is settled through the platform, and the farmer rates the visit a day later.",
    highlight: "Every visit leaves a verifiable record.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-ink py-28 text-paper sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96
                   bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(31,107,58,0.35),transparent_70%)]"
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Pill className="mb-7 bg-white/10 text-paper/70 ring-white/15">
            How it works
          </Pill>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance">
            Most sick animals don&rsquo;t need a vet to travel.
            <br className="hidden sm:block" /> They need a vet to look.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-paper/60">
            Triage is what makes one veterinarian able to cover a district
            instead of a village.
          </p>
        </Reveal>

        <ol className="mt-20 space-y-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 120}>
              <div className="group grid gap-6 rounded-3xl bg-white/[0.045] p-8 ring-1 ring-white/10 transition-colors duration-500 hover:bg-white/[0.07] sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-10 sm:p-10">
                <div className="flex items-center gap-5 sm:flex-col sm:items-start sm:gap-6">
                  <span className="font-mono text-[12px] tabular-nums text-brand-soft/70">
                    {s.n}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/25 text-brand-soft">
                    <s.icon className="h-6 w-6" />
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-soft/60">
                    {s.tier}
                  </p>
                  <h3 className="mt-2.5 font-display text-[25px] font-bold tracking-tight sm:text-[29px]">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-paper/60">
                    {s.body}
                  </p>
                </div>

                <p className="text-balance text-[14px] leading-snug text-brand-soft sm:max-w-[13rem] sm:text-right">
                  {s.highlight}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
