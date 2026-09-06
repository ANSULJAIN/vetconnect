import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { VaccineSchedule } from "@/components/sections/VaccineSchedule";
import { SITE } from "@/data/site";
import {
  IconCheck,
  IconPlane,
  IconRupee,
  IconShield,
  IconSyringe,
  IconWhatsApp,
} from "@/components/illustrations/PetIcons";

export const metadata: Metadata = {
  title: "Pet vaccinations at home",
  description:
    "Core and booster vaccinations for dogs and cats, given at home by a verified veterinarian, with a signed vaccination record.",
};

const WHY = [
  {
    Icon: IconShield,
    title: "The diseases are still here",
    body: "Parvovirus and distemper remain common in Indian cities, and both are frequently fatal in unvaccinated puppies.",
  },
  {
    Icon: IconRupee,
    title: "Cheaper than treating it",
    body: "A course of core vaccines costs a fraction of treating the illness it prevents — and parvo treatment often fails anyway.",
  },
  {
    Icon: IconPlane,
    title: "You will be asked for it",
    body: "Boarding kennels, groomers, apartment societies, pet insurance and any form of travel all require an up-to-date record.",
  },
  {
    Icon: IconSyringe,
    title: "Rabies protects you too",
    body: "India accounts for a large share of the world's rabies deaths. Vaccinating your pet is a household safety measure.",
  },
];

const INCLUDED = [
  "A pre-vaccination health check — a sick pet should not be vaccinated that day",
  "The vaccine itself, from cold-chain-maintained stock",
  "A signed vaccination card, accepted for boarding, travel and society records",
  "A reminder before the next dose is due",
  "Guidance on what is normal afterwards, and what is not",
];

export default function VaccinationsPage() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden bg-brand-wash">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='%231f6b3a'%3E%3Cellipse cx='24' cy='27' rx='3.4' ry='4.3'/%3E%3Cellipse cx='32' cy='23.5' rx='3.4' ry='4.5'/%3E%3Cellipse cx='40' cy='27' rx='3.4' ry='4.3'/%3E%3Cpath d='M32 33c-4.8 0-8.5 3.4-8.5 7.3 0 2.9 2.2 4.8 5 4.8 1.4 0 2.4-.5 3.5-.5s2.1.5 3.5.5c2.8 0 5-1.9 5-4.8 0-3.9-3.7-7.3-8.5-7.3Z'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "64px 64px",
          }}
        />
        <Container size="wide" className="relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            {/* Pill, not a label: it states the offer and lights up on hover. */}
            <a
              href={`https://wa.me/${SITE.whatsappDigits}`}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-white to-brand-soft/70 py-1.5 pr-5 pl-1.5 shadow-md shadow-brand-deep/10 ring-1 ring-brand/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-vivid/25 hover:ring-vivid/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white transition-colors duration-300 group-hover:bg-vivid">
                <IconSyringe className="h-4 w-4" />
              </span>
              <span className="text-[14px] font-semibold text-brand-deep transition-colors duration-300 group-hover:text-vivid">
                No carrier. No car. No clinic.
              </span>
            </a>
            <h1 className="mt-5 font-display text-[34px] leading-[1.08] font-extrabold tracking-tight text-ink text-balance sm:text-[46px]">
              Vaccinations, without the carrier and the car journey
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-muted">
              A verified veterinarian comes to you. Your pet stays calm in its own
              home, and you get a signed vaccination record you can use for
              boarding, travel and society paperwork.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${SITE.whatsappDigits}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-4 text-[15.5px] font-semibold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-deep"
              >
                <IconWhatsApp className="h-4.5 w-4.5" />
                Book on WhatsApp
              </a>
              <Link
                href="/consult"
                className="inline-flex items-center rounded-full bg-surface px-7 py-4 text-[15.5px] font-semibold text-ink ring-1 ring-line transition-colors hover:ring-brand/40"
              >
                Ask a vet first — ₹{SITE.consultPrice}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div
              className="relative aspect-square overflow-hidden shadow-xl shadow-brand-deep/10"
              style={{ borderRadius: "54% 46% 43% 57% / 48% 44% 56% 52%" }}
            >
              <Image
                src="/images/pets/vet-exam.jpg"
                alt="A veterinarian examining a dog"
                width={900}
                height={900}
                priority
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Reads as a stamped card rather than a caption — hence the tilt,
                the seal and the ruled paper texture. */}
            <div className="group absolute right-0 bottom-2 -rotate-3 rounded-xl bg-brand-deep px-5 py-4 shadow-xl shadow-brand-deep/30 transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:bg-vivid sm:right-2">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.13]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 7px)",
                }}
              />
              <div className="relative flex items-center gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25">
                  <IconShield className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-[16px] leading-tight font-extrabold text-white">
                    Signed card
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-tight text-brand-soft/85">
                    before we leave
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- why ---------- */}
      <section className="bg-paper py-16 sm:py-20">
        <Container size="wide">
          <h2 className="text-center font-display text-[28px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[34px]">
            Why it matters more than people think
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {WHY.map(({ Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line-soft"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-bold tracking-tight text-ink">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------- schedule ---------- */}
      <section className="bg-paper-deep/50 py-16 sm:py-20">
        <Container size="narrow">
          <h2 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[34px]">
            The schedule, and what each dose protects against
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-muted">
            Pick your pet to see the course. Numbered doses are core; the rest
            depend on how your pet lives.
          </p>
          <div className="mt-9">
            <VaccineSchedule />
          </div>

          <p className="mt-9 rounded-xl border-l-[3px] border-clay bg-clay-soft px-5 py-4 text-[14px] leading-relaxed text-ink-soft">
            <strong className="font-semibold text-clay">This is a guide, not a prescription.</strong>{" "}
            Timing shifts with your pet&rsquo;s history, health and local disease
            risk. The attending veterinarian confirms the right plan before
            administering anything.
          </p>
        </Container>
      </section>

      {/* ---------- included ---------- */}
      <section className="bg-paper py-16 sm:py-20">
        <Container size="narrow">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="font-display text-[26px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[31px]">
                What a home visit includes
              </h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-ink-muted">
                One price, one visit, nothing left for you to chase afterwards.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {INCLUDED.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3.5 rounded-xl bg-surface p-4.5 shadow-sm ring-1 ring-line-soft"
                >
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span className="text-[14.5px] leading-relaxed text-ink-soft">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ---------- cta ---------- */}
      <section className="bg-brand-deep py-16 sm:py-20">
        <Container size="narrow" className="text-center">
          <h2 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-white text-balance sm:text-[34px]">
            Book a vaccination visit
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-brand-soft/85">
            Home visits are scheduled by hand while we expand city by city. Send
            us your locality, your pet&rsquo;s age and its vaccination history,
            and we will confirm availability and pricing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${SITE.whatsappDigits}`}
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-[15.5px] font-semibold text-brand-deep transition-transform hover:-translate-y-0.5"
            >
              <IconWhatsApp className="h-4.5 w-4.5" />
              WhatsApp {SITE.whatsapp}
            </a>
            <Link
              href="/consult"
              className="inline-flex items-center rounded-full px-7 py-4 text-[15.5px] font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10"
            >
              Ask a vet first — ₹{SITE.consultPrice}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
