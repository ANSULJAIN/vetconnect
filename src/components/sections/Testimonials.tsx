import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import { IconStar } from "@/components/illustrations/PetIcons";
import { TESTIMONIALS, type Testimonial } from "@/data/content";

export function Testimonials() {
  return (
    <section className="bg-paper-deep/60 py-18 sm:py-24">
      <Container size="wide">
        <h2 className="text-center font-display text-[30px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[38px]">
          What pet parents say about us
        </h2>

        <Carousel label="Customer reviews" className="mt-12">
          {TESTIMONIALS.map((t, i) => (
            <Review key={i} item={t} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

function Review({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl bg-surface p-7 shadow-sm ring-1 ring-line-soft">
      <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStar key={i} className="h-4 w-4 text-clay" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 border-t border-line-soft pt-4">
        <p className="font-display text-[15px] font-bold text-ink">{item.name}</p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
          {item.role}
        </p>
      </figcaption>
    </figure>
  );
}
