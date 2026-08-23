import { Container } from "@/components/ui/Container";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/sections/PhoneMockup";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      {/* soft radial ground */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px]
                   bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--color-brand-wash),transparent_70%)]"
      />

      <Container className="relative">
        <div className="flex flex-col items-center text-center">
          <Pill className="mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Piloting in Pune district
          </Pill>

          <h1
            className="font-display text-[clamp(2.65rem,7.2vw,5.4rem)] font-bold leading-[0.98]
                       tracking-[-0.035em] text-balance text-ink"
          >
            A verified vet
            <br />
            at the farm gate,
            <br />
            <span className="text-brand">the same day.</span>
          </h1>

          <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink-muted sm:text-[19px]">
            India has one field veterinarian for every 19,000 animals. VetConnect
            triages in minutes and dispatches in hours — so a sick animal is seen
            before the loss compounds.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button href="#how">See how it works</Button>
            <Button href="#vets" variant="ghost">
              Join as a veterinarian
            </Button>
          </div>
        </div>

        <PhoneMockup />
      </Container>
    </section>
  );
}
