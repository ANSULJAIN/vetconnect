import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/data/site";
import { IconCheck, IconWhatsApp } from "@/components/illustrations/PetIcons";

export const metadata: Metadata = {
  title: "Home vet visit",
  description:
    "A veterinarian at your door for examinations, treatment and sample collection. Currently rolling out city by city.",
};

const INCLUDES = [
  "Full physical examination at home",
  "On-the-spot treatment where appropriate",
  "Sample collection for lab work",
  "A written prescription and case notes",
];

export default function HomeVisitPage() {
  return (
    <div className="bg-paper py-14 sm:py-20">
      <Container size="narrow">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.13em] text-brand-deep">
          Rolling out city by city
        </span>
        <h1 className="mt-5 font-display text-[32px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[40px]">
          A veterinarian at your door
        </h1>
        <p className="mt-4 text-[16.5px] leading-relaxed text-ink-muted">
          Some things cannot be done over a call. For examinations, treatment and
          sample collection, we send a verified veterinarian to your home — no
          carrier, no car journey, no waiting room for an anxious animal.
        </p>

        <div className="mt-9 overflow-hidden rounded-2xl shadow-lg shadow-brand-deep/10">
          <Image
            src="/images/pets/vet-mask.jpg"
            alt="A veterinarian with a dog during a home visit"
            width={900}
            height={900}
            priority
            sizes="(min-width: 768px) 42rem, 92vw"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        <ul className="mt-9 flex flex-col gap-3">
          {INCLUDES.map((line) => (
            <li
              key={line}
              className="flex items-start gap-3.5 rounded-xl bg-surface p-5 shadow-sm ring-1 ring-line-soft"
            >
              <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span className="text-[15.5px] text-ink-soft">{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl bg-brand-wash p-7">
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">
            Check availability in your area
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
            Home visits are scheduled manually while we build out each city.
            Message us with your locality and what your pet needs, and we will
            confirm whether we can reach you and what it costs.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${SITE.whatsappDigits}`}
              className="inline-flex items-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              <IconWhatsApp className="h-4.5 w-4.5" />
              WhatsApp us
            </a>
            <Link
              href="/consult"
              className="inline-flex items-center rounded-full px-6 py-3.5 text-[15px] font-semibold text-ink ring-1 ring-line transition-colors hover:bg-surface"
            >
              Consult online instead — ₹{SITE.consultPrice}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
