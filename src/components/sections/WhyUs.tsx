import { Container } from "@/components/ui/Container";
import { IconCheck, IconWhatsApp } from "@/components/illustrations/PetIcons";
import { WHY_US } from "@/data/content";
import { SITE } from "@/data/site";

export function WhyUs() {
  return (
    <section className="bg-paper py-18 sm:py-24">
      <Container size="narrow">
        <p className="text-center text-[17px] leading-relaxed text-ink-muted">
          Talk to an expert vet online about dogs, cats, birds, rabbits, guinea
          pigs, turtles and fish. Ask anything concerning your pet&rsquo;s
          health, nutrition, behaviour and wellbeing.
        </p>

        <h2 className="mt-14 text-center font-display text-[27px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[33px]">
          Why book an online consultation with VetConnect?
        </h2>

        <ul className="mt-9 flex flex-col gap-3.5">
          {WHY_US.map((line) => (
            <li
              key={line}
              className="flex items-start gap-3.5 rounded-xl bg-surface p-5 shadow-sm ring-1 ring-line-soft"
            >
              <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span className="text-[15.5px] leading-relaxed text-ink-soft">{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border-l-[3px] border-clay bg-clay-soft p-5">
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            <strong className="font-semibold text-clay">Please note:</strong> in
            case of serious illness, injury or an emergency, seek immediate
            treatment at your nearest veterinary hospital. Online consultation is
            not a substitute for emergency care.
          </p>
        </div>

        <a
          href={`https://wa.me/${SITE.whatsappDigits}`}
          className="mt-8 flex items-center justify-center gap-2.5 rounded-xl bg-surface p-5 text-[15px] text-ink-soft shadow-sm ring-1 ring-line-soft transition-colors hover:ring-brand/30"
        >
          <IconWhatsApp className="h-5 w-5 text-brand" />
          Need help booking? WhatsApp us on{" "}
          <span className="font-semibold text-brand-deep">{SITE.whatsapp}</span>
        </a>
      </Container>
    </section>
  );
}
