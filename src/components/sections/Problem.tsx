import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";
import { IconSearch, IconClock, IconBadge } from "@/components/illustrations/Icons";

const FAILURES = [
  {
    icon: IconSearch,
    title: "Discovery",
    body: "There is no directory of who is qualified, nearby, and free right now. The farmer starts by asking a neighbour.",
  },
  {
    icon: IconClock,
    title: "Latency",
    body: "The government helpline is free but queue-based and largely working-hours. Animals get sick at five in the morning.",
  },
  {
    icon: IconBadge,
    title: "Trust",
    body: "No way to verify credentials at the gate. Unqualified practitioners fill the vacuum, and the farmer carries the loss.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="py-28 sm:py-36">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <Pill tone="clay" className="mb-7">
            The problem
          </Pill>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance text-ink">
            A buffalo is a household&rsquo;s working capital. When it stops
            milking, the family&rsquo;s income stops.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-ink-muted">
            The shortage is real, but it isn&rsquo;t the whole story. Three
            separate things break before a vet ever reaches the animal.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {FAILURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 110}>
              <article className="group h-full rounded-3xl bg-surface p-8 ring-1 ring-line-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5 hover:ring-line">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-wash text-brand transition-colors duration-500 group-hover:bg-brand group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-[21px] font-bold tracking-tight text-ink">
                  {f.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {f.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
