import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { IconWallet, IconRoute, IconBadge } from "@/components/illustrations/Icons";

const POINTS = [
  {
    icon: IconRoute,
    title: "Cases routed to you, not auctioned",
    body: "One vet is offered a case at a time, chosen on distance, rating and experience. You are not bidding against colleagues.",
  },
  {
    icon: IconWallet,
    title: "You keep 90%",
    body: "You report travel and treatment cost at closure. The platform takes ten percent. The arithmetic is visible before you accept.",
  },
  {
    icon: IconBadge,
    title: "Dispatch that shows its working",
    body: "Every offer stores the score that produced it. If you want to know why a case went elsewhere, we can show you the numbers.",
  },
];

export function ForVets() {
  return (
    <section id="vets" className="bg-surface py-28 sm:py-36">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <Pill tone="brand" className="mb-7">
              For veterinarians
            </Pill>
            <h2 className="font-display text-[clamp(2rem,4.2vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.03em] text-balance text-ink">
              You are the scarce resource. We built for that.
            </h2>
            <p className="mt-6 text-[16.5px] leading-relaxed text-ink-muted">
              Practising vets already have a patient book and a full day. This
              only works if a case we send is worth taking — so routing
              efficiency, earnings and dispute handling are the product, not the
              support queue.
            </p>
            <div className="mt-9">
              <Button href="#contact">Register your interest</Button>
            </div>
          </Reveal>

          <div className="space-y-4">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 110}>
                <article className="flex gap-5 rounded-3xl bg-paper p-7 ring-1 ring-line-soft">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-brand ring-1 ring-line-soft">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-[18px] font-bold tracking-tight text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-muted">
                      {p.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
