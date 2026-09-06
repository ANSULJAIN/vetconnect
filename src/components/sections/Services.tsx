import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SERVICE_ICONS } from "@/components/illustrations/PetIcons";
import { SERVICES } from "@/data/content";
import { SITE } from "@/data/site";

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 bg-paper py-18 sm:py-24">
      <Container size="wide">
        <p className="mx-auto max-w-3xl text-center text-[17px] leading-relaxed text-ink-muted">
          VetConnect connects pet parents across India with experienced
          veterinarians online. Book a slot, describe the problem, and a vet
          calls you back — usually within {SITE.connectMinutes} minutes.
        </p>

        <h2 className="mt-14 text-center font-display text-[30px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[38px]">
          Ask a trusted vet, online
        </h2>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = SERVICE_ICONS[s.icon];
            return (
              <li key={s.slug}>
                <Link
                  href="/consult"
                  className="group flex h-full flex-col items-center rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-line-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-deep/5 hover:ring-brand/25"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-clay-soft text-clay transition-colors group-hover:bg-clay group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-[19px] font-bold tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">
                    {s.examples}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
