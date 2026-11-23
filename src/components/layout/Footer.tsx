import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/data/site";

const QUICK: { label: string; href: string }[] = [
  { label: "Consult a vet online", href: "/consult" },
  { label: "Home vet visit", href: "/home-visit" },
  { label: "Vaccinations at home", href: "/vaccinations" },
];

const IMPORTANT: { label: string; href: string }[] = [
  { label: "Contact us", href: "/contact" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Refund and cancellation", href: "/refund" },
];

const PAYMENTS = ["Visa", "Mastercard", "RuPay", "UPI", "Net banking"];

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-deep text-brand-soft">
      <Container size="wide" className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo-mark.png"
                alt=""
                width={600}
                height={585}
                className="h-11 w-auto brightness-0 invert"
              />
              <span className="font-display text-[21px] font-extrabold tracking-tight text-white">
                VetConnect
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-brand-soft/80">
              Online veterinary consultation for pets across India. Verified
              veterinarians, written prescriptions, no waiting room.
            </p>
          </div>

          <nav aria-label="Services">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-soft/60">
              Services
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {QUICK.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14.5px] text-brand-soft/90 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Policies">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-soft/60">
              Important links
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {IMPORTANT.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14.5px] text-brand-soft/90 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-soft/60">
              Support
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px]">
              <li>
                <a
                  href={`https://wa.me/${SITE.whatsappDigits}`}
                  className="text-brand-soft/90 transition-colors hover:text-white"
                >
                  WhatsApp {SITE.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.supportEmail}`}
                  className="text-brand-soft/90 transition-colors hover:text-white"
                >
                  {SITE.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[12px] text-brand-soft/70">
            © {SITE.since}–{String(SITE.since + 1).slice(2)} VetConnect. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-2">
            {PAYMENTS.map((p) => (
              <li
                key={p}
                className="rounded bg-white/10 px-2.5 py-1 font-mono text-[10px] tracking-wide text-brand-soft/85"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
