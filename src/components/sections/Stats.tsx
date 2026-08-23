import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const STATS = [
  {
    value: "536.8M",
    label: "livestock in India",
    source: "20th Livestock Census",
  },
  {
    value: "28,328",
    label: "field vets in public service",
    source: "Parliament reply, 2022",
  },
  {
    value: "1 : 19,000",
    label: "vets to animals",
    source: "Derived",
  },
  {
    value: "₹13,200cr",
    label: "lost yearly to disease",
    source: "Peer-reviewed estimate",
  },
];

export function Stats() {
  return (
    <section className="border-y border-line-soft bg-surface py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.value} delay={i * 90}>
              <p className="font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-bold leading-none tracking-tight tabular-nums text-brand">
                {stat.value}
              </p>
              <p className="mt-3 text-[15px] leading-snug text-ink">{stat.label}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                {stat.source}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
