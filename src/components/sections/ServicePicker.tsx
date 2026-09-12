import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { IconHouse, IconSyringe } from "@/components/illustrations/PetIcons";
import { IconStethoscope } from "@/components/illustrations/Icons";
import { SITE } from "@/data/site";

/**
 * The three things VetConnect sells, directly under the hero.
 *
 * Home visits and vaccinations previously existed only in the nav — which on a
 * phone means behind a hamburger, where nobody looks. This is the only place
 * they are visible without tapping first.
 */
const SERVICES = [
  {
    href: "/consult",
    image: "/images/pets/owner-dog.jpg",
    Icon: IconStethoscope,
    title: "Consult a vet online",
    body: "Describe the problem, and a verified vet calls you back — usually within 15 minutes.",
    meta: `₹${SITE.consultPrice}`,
    metaNote: "per consultation",
    tone: "clay" as const,
  },
  {
    href: "/home-visit",
    image: "/images/pets/vet-mask.jpg",
    Icon: IconHouse,
    title: "Home vet visit",
    body: "Examination, treatment and sample collection at your door. No carrier, no car journey.",
    meta: "At your door",
    metaNote: "selected cities",
    tone: "brand" as const,
  },
  {
    href: "/vaccinations",
    image: "/images/pets/vet-exam.jpg",
    Icon: IconSyringe,
    title: "Vaccinations at home",
    body: "Core and booster shots given at home, with a signed card for boarding and travel.",
    meta: "Signed card",
    metaNote: "same visit",
    tone: "brand" as const,
  },
];

const TONE = {
  clay: { chip: "bg-clay text-white", ring: "hover:ring-clay/40" },
  brand: { chip: "bg-brand text-white", ring: "hover:ring-vivid/40" },
};

export function ServicePicker() {
  return (
    <section className="bg-paper py-14 sm:py-18">
      <Container size="wide">
        <h2 className="text-center font-display text-[26px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[33px]">
          How would you like to see a vet?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-[15.5px] leading-relaxed text-ink-muted">
          Three ways to get your pet seen. Start online, or have a veterinarian
          come to you.
        </p>

        <ul className="mt-9 grid gap-5 md:grid-cols-3">
          {SERVICES.map(({ href, image, Icon, title, body, meta, metaNote, tone }) => (
            <li key={href}>
              <Link
                href={href}
                className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-line-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-deep/10 ${TONE[tone].ring}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={image}
                    alt=""
                    width={900}
                    height={900}
                    sizes="(min-width: 768px) 22rem, 92vw"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={`absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-md ${TONE[tone].chip}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[18px] font-bold tracking-tight text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-muted">{body}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3.5">
                    <span>
                      <span className="block font-display text-[16px] leading-none font-extrabold text-brand-deep">
                        {meta}
                      </span>
                      <span className="mt-1 block text-[11.5px] text-ink-faint">{metaNote}</span>
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-ink-soft transition-all duration-300 group-hover:bg-vivid group-hover:text-white">
                      <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5">
                        <path
                          d="M2 8h11M9 4l4 4-4 4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
