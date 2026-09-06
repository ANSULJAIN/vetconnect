import Image from "next/image";
import { Container } from "@/components/ui/Container";

/**
 * Photo band between the service cards and the vets. Exists to break up a long
 * run of text sections and to show the animals we actually treat — the four
 * species that make up most consultations.
 */
const PETS: { src: string; alt: string; label: string }[] = [
  { src: "/images/pets/dog-2.jpg", alt: "A golden retriever", label: "Dogs" },
  { src: "/images/pets/cat-1.jpg", alt: "A ginger and white cat", label: "Cats" },
  { src: "/images/pets/dog-1.jpg", alt: "A pug", label: "Small breeds" },
  { src: "/images/pets/cat-2.jpg", alt: "A tabby cat", label: "…and exotics" },
];

export function PetBand() {
  return (
    <section className="bg-paper pb-18 sm:pb-24">
      <Container size="wide">
        <div className="rounded-3xl bg-brand-deep px-6 py-12 sm:px-10 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center">
            <div>
              <h2 className="font-display text-[27px] leading-tight font-extrabold tracking-tight text-white text-balance sm:text-[33px]">
                Whoever shares your home, we can help
              </h2>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-brand-soft/85">
                Dogs, cats, birds, rabbits, guinea pigs, turtles and fish. Ask our
                veterinarians about health, nutrition, behaviour and wellbeing —
                anything that is not an emergency.
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PETS.map((p) => (
                <li key={p.src} className="text-center">
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/15">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={900}
                      height={900}
                      sizes="(min-width: 640px) 12rem, 40vw"
                      className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 font-mono text-[11px] font-bold tracking-[0.12em] text-brand-soft/80 uppercase">
                    {p.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
