import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Buffalo } from "@/components/illustrations/Buffalo";

export function CTA() {
  return (
    <section id="contact" className="relative overflow-hidden py-28 sm:py-36">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-8 py-20 text-center sm:px-16 sm:py-28">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0
                         bg-[radial-gradient(ellipse_60%_70%_at_50%_120%,rgba(31,107,58,0.45),transparent_70%)]"
            />

            <Buffalo
              aria-hidden="true"
              className="pointer-events-none absolute bottom-8 right-8 hidden h-32 w-auto text-white/[0.07] sm:block sm:h-40"
            />

            <div className="relative">
              <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.1rem,5.4vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-balance text-paper">
                An animal seen today is
                <br className="hidden sm:block" /> a season not lost.
              </h2>
              <p className="mx-auto mt-7 max-w-lg text-[17px] leading-relaxed text-paper/60">
                We are onboarding veterinarians and dairy cooperative partners
                for the Pune district pilot.
              </p>

              <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  href="mailto:hello@vetconnect.in"
                  className="bg-paper text-ink hover:bg-brand-soft hover:text-brand-deep"
                >
                  Talk to us
                </Button>
                <Button
                  href="#vets"
                  variant="ghost"
                  className="text-paper ring-white/20 hover:bg-white/10 hover:ring-white/35"
                >
                  Join as a veterinarian
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
