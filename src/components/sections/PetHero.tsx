import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { IconCheck, IconStar, IconTag } from "@/components/illustrations/PetIcons";
import { IconClock } from "@/components/illustrations/Icons";
import { SITE } from "@/data/site";

const CHIPS = [
  { Icon: IconCheck, label: "Verified vets" },
  { Icon: IconTag, label: `Only ₹${SITE.consultPrice}` },
  { Icon: IconClock, label: `Connect in ${SITE.connectMinutes} min` },
  { Icon: IconStar, label: "Top rated" },
];

export function PetHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-paper-deep/50">
      {/* paw-print field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cg fill='%231f6b3a'%3E%3Cellipse cx='27' cy='30' rx='4' ry='5'/%3E%3Cellipse cx='36' cy='26' rx='4' ry='5.2'/%3E%3Cellipse cx='45' cy='30' rx='4' ry='5'/%3E%3Cpath d='M36 37c-5.5 0-9.8 3.9-9.8 8.4 0 3.3 2.5 5.5 5.7 5.5 1.6 0 2.8-.6 4.1-.6s2.5.6 4.1.6c3.2 0 5.7-2.2 5.7-5.5 0-4.5-4.3-8.4-9.8-8.4Z'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "72px 72px",
        }}
      />

      <Container size="wide" className="relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <h1 className="font-display text-[38px] leading-[1.08] font-extrabold tracking-tight text-ink text-balance sm:text-[52px] lg:text-[58px]">
            Need advice on your pet&rsquo;s health?
            <br />
            Now ask a vet online{" "}
            <span className="relative inline-block text-brand">
              24/7
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-[6px] rounded-full bg-brand/25"
              />
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-muted">
            Get trusted veterinary advice from the comfort of your home. Verified
            veterinarians, a written prescription, and a follow-up — without a
            trip to the clinic.
          </p>

          <div className="mt-8">
            <Link
              href="/consult"
              className="group inline-flex items-center gap-2.5 rounded-full bg-clay px-8 py-4 text-[16px] font-semibold text-white shadow-lg shadow-clay/25 transition-all hover:bg-clay/90 hover:shadow-xl hover:shadow-clay/30"
            >
              Consult a vet now
              <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1">
                <path
                  d="M2 8h11M9 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {CHIPS.map(({ Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[13.5px] font-medium text-ink-soft shadow-sm ring-1 ring-line-soft"
              >
                <Icon className="h-4 w-4 text-brand" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* visual */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-square">
            <div
              aria-hidden
              className="absolute inset-0 bg-surface shadow-xl shadow-brand-deep/5"
              style={{ borderRadius: "58% 42% 47% 53% / 45% 50% 50% 55%" }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <Image
                src="/images/logo-mark.png"
                alt="VetConnect"
                width={600}
                height={585}
                priority
                className="h-auto w-full max-w-[300px] object-contain"
              />
            </div>
          </div>

          {/* Kept in the upper half so the sticky booking bar never covers it. */}
          <div className="absolute top-8 -left-1 rounded-2xl bg-surface px-5 py-3.5 shadow-lg ring-1 ring-line-soft sm:left-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Consultation
            </p>
            <p className="mt-1 font-display text-[24px] leading-none font-extrabold text-brand-deep">
              ₹{SITE.consultPrice}
            </p>
          </div>

          <div className="absolute top-4 right-0 flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 shadow-lg ring-1 ring-line-soft sm:right-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            <span className="text-[13px] font-semibold text-brand-deep">Vets available now</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
