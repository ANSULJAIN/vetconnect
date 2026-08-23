import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Pill } from "@/components/ui/Pill";

const ITEMS = [
  {
    q: "The government helpline is free. Why would anyone pay?",
    a: "Free is not the same as available. The national scheme funds roughly one mobile veterinary unit per hundred thousand livestock, and it is queue-based and largely working-hours. We are not competing on price — we compete on speed and certainty. Farmers who have waited on that queue are the people we are built for.",
  },
  {
    q: "How do you know a vet is actually qualified?",
    a: "Two rounds. First, government VCI registration and a photograph of the card — registration numbers are unique on the platform, so a licence cannot be shared between accounts. Second, a fifteen-minute live interview with our operations team. An account cannot receive a live case until both are cleared.",
  },
  {
    q: "What happens if no vet accepts the case?",
    a: "The offer expires after thirty minutes and the case opens to a district-wide claim pool, where any eligible vet can take it. If it is still unclaimed, it reassigns automatically to the next best-matched vet. A case is never silently dropped.",
  },
  {
    q: "Who decides what the visit costs?",
    a: "The veterinarian does. They report travel and treatment cost at closure, and the platform takes ten percent of the total. The farmer sees the amount before it is finalised, and disputes are handled by our operations team rather than left between the two parties.",
  },
  {
    q: "Do I need a smartphone to use this?",
    a: "Not to start. A missed call or a WhatsApp message reaches our operations team, who raise the case on the farmer's behalf. The app is how a veterinarian works and how we scale — it is not the front door.",
  },
  {
    q: "What happens to my data?",
    a: "Consent is asked separately for treatment, for research use, and for sharing with an insurer — you can agree to one and not the others, and withdraw at any time. Anything used for research is stripped of personal identity first. We do not sell farmer data.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-surface py-28 sm:py-36">
      <Container size="narrow">
        <Reveal className="text-center">
          <Pill className="mb-7">Questions</Pill>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance text-ink">
            The things people ask first
          </h2>
        </Reveal>

        <div className="mt-14 divide-y divide-line-soft border-y border-line-soft">
          {ITEMS.map((item, i) => (
            <Reveal key={item.q} delay={i * 70}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                  <span className="font-display text-[18px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand sm:text-[20px]">
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-ink-muted ring-1 ring-line-soft transition-all duration-300 group-open:rotate-45 group-open:bg-brand group-open:text-white group-open:ring-brand"
                  >
                    <svg viewBox="0 0 14 14" className="h-3 w-3">
                      <path
                        d="M7 2v10M2 7h10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl pr-12 text-[15.5px] leading-relaxed text-ink-muted">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
