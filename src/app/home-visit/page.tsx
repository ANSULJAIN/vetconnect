import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/data/site";
import {
  IconPin,
  IconVial,
  IconSyringe,
  IconWhatsApp,
} from "@/components/illustrations/PetIcons";
import { IconRx, IconStethoscope } from "@/components/illustrations/Icons";

export const metadata: Metadata = {
  title: "Home vet visit",
  description:
    "A veterinarian at your door for examinations, treatment and sample collection. Currently rolling out city by city.",
};

const INCLUDES: { Icon: (p: { className?: string }) => React.ReactElement; text: string }[] = [
  { Icon: IconStethoscope, text: "Full physical examination at home" },
  { Icon: IconSyringe, text: "On-the-spot treatment where appropriate" },
  { Icon: IconVial, text: "Sample collection for lab work" },
  { Icon: IconRx, text: "A written prescription and case notes" },
];

export default function HomeVisitPage() {
  return (
    <div className="bg-paper py-14 sm:py-20">
      <Container size="narrow">
        <span className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-white to-brand-soft/70 py-1.5 pr-5 pl-1.5 shadow-md shadow-brand-deep/10 ring-1 ring-brand/15">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
            <IconPin className="h-4 w-4" />
          </span>
          <span className="text-[14px] font-semibold text-brand-deep">
            Ask if we reach your locality
          </span>
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

        <ul className="mt-9 grid gap-3 sm:grid-cols-2">
          {INCLUDES.map(({ Icon, text }) => (
            <li
              key={text}
              className="group flex items-center gap-4 rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-deep/10 hover:ring-vivid/35"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep transition-all duration-300 group-hover:scale-110 group-hover:bg-vivid group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[15px] leading-snug text-ink-soft">{text}</span>
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
              className="group inline-flex items-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-vivid hover:shadow-xl hover:shadow-vivid/35"
            >
              <IconWhatsApp className="h-4.5 w-4.5" />
              WhatsApp us
            </a>
            <Link
              href="/consult"
              className="inline-flex items-center rounded-full bg-surface px-6 py-3.5 text-[15px] font-semibold text-ink shadow-sm ring-1 ring-line transition-all duration-300 hover:-translate-y-0.5 hover:text-brand-deep hover:shadow-lg hover:ring-vivid/50"
            >
              Consult online instead — ₹{SITE.consultPrice}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
