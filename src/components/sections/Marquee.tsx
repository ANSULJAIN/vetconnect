import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const SPECIES = [
  "Buffalo",
  "Crossbred cattle",
  "Indigenous cattle",
  "Goat",
  "Sheep",
  "Backyard poultry",
  "Draught animals",
];

const CONDITIONS = [
  "Mastitis",
  "Off feed",
  "Lameness",
  "Foot and mouth",
  "Bloat",
  "Retained placenta",
  "Milk drop",
  "Lumpy skin",
  "Parasites",
  "Calving support",
];

export function Marquee() {
  return (
    <section className="overflow-hidden py-24 sm:pt-28 sm:pb-16">
      <div className="marquee-mask space-y-4">
        <Row items={SPECIES} duration="46s" />
        <Row items={CONDITIONS} duration="62s" reverse />
      </div>

      <Container>
        <Reveal className="mx-auto mt-16 max-w-2xl text-center">
          <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.028em] text-balance text-ink">
            Built for the animals a household actually depends on
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-muted">
            Not pets. Livestock — where a week off feed is a month of lost income.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

function Row({
  items,
  duration,
  reverse,
}: {
  items: string[];
  duration: string;
  reverse?: boolean;
}) {
  /*
   * The track animates by -50%, so the first half must be at least as wide as
   * the viewport or a gap appears at the right edge on wide screens. These
   * lists are short, so each half repeats the items twice — four copies total.
   */
  const half = [...items, ...items];
  const track = [...half, ...half];

  return (
    <div className="flex w-max">
      <div
        className="marquee-track flex gap-3 pr-3"
        style={
          {
            "--marquee-duration": duration,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="whitespace-nowrap rounded-full bg-surface px-5 py-2.5 text-[15px] text-ink-soft ring-1 ring-line-soft"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
