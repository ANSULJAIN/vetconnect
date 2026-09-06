import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/data/site";
import { IconWhatsApp } from "@/components/illustrations/PetIcons";

export const metadata: Metadata = {
  title: "Pet vaccinations at home",
  description:
    "Core and booster vaccinations administered at home by a verified veterinarian, with a signed vaccination record.",
};

const SCHEDULE: { pet: string; rows: [string, string][] }[] = [
  {
    pet: "Puppies",
    rows: [
      ["6–8 weeks", "First DHPPi"],
      ["10–12 weeks", "DHPPi booster + Leptospirosis"],
      ["14–16 weeks", "Anti-rabies"],
      ["Annually", "DHPPi + Lepto + rabies booster"],
    ],
  },
  {
    pet: "Kittens",
    rows: [
      ["8–9 weeks", "First FVRCP"],
      ["12 weeks", "FVRCP booster"],
      ["16 weeks", "Anti-rabies"],
      ["Annually", "FVRCP + rabies booster"],
    ],
  },
];

export default function VaccinationsPage() {
  return (
    <div className="bg-paper py-14 sm:py-20">
      <Container size="narrow">
        <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[40px]">
          Pet vaccinations at home
        </h1>
        <p className="mt-4 text-[16.5px] leading-relaxed text-ink-muted">
          Core and booster vaccinations given at home by a verified
          veterinarian, with a signed vaccination record you can use for
          boarding, travel and licensing.
        </p>

        <div className="mt-10 flex flex-col gap-8">
          {SCHEDULE.map((block) => (
            <section key={block.pet}>
              <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">
                {block.pet}
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-[15px]">
                  <thead>
                    <tr>
                      <th className="border-b-2 border-ink-soft/25 py-2.5 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                        Age
                      </th>
                      <th className="border-b-2 border-ink-soft/25 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                        Vaccination
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map(([age, vax]) => (
                      <tr key={age}>
                        <td className="border-b border-line-soft py-3 pr-4 font-mono text-[13.5px] whitespace-nowrap text-ink-soft">
                          {age}
                        </td>
                        <td className="border-b border-line-soft py-3 text-ink-soft">{vax}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-xl border-l-[3px] border-clay bg-clay-soft px-5 py-4 text-[14px] leading-relaxed text-ink-soft">
          Schedules vary with your pet&rsquo;s history, health and local disease
          risk. The attending veterinarian will confirm the right plan before
          administering anything.
        </p>

        <div className="mt-10 rounded-2xl bg-brand-wash p-7">
          <h2 className="font-display text-[20px] font-bold tracking-tight text-ink">
            Book a vaccination visit
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
            Home vaccination is scheduled manually while we expand. Send us your
            locality, your pet&rsquo;s age and its vaccination history, and we
            will confirm availability and pricing.
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
              Ask a vet first — ₹{SITE.consultPrice}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
