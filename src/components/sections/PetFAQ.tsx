import { Container } from "@/components/ui/Container";
import { FAQ } from "@/data/content";

export function PetFAQ() {
  return (
    <section id="faq" className="scroll-mt-24 bg-paper py-18 sm:py-24">
      <Container size="narrow">
        <h2 className="text-center font-display text-[30px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[38px]">
          Frequently asked questions
        </h2>

        <div className="mt-10 flex flex-col gap-2.5">
          {FAQ.map((item) => (
            <details
              key={item.q}
              name="faq"
              className="group rounded-xl bg-surface px-6 shadow-sm ring-1 ring-line-soft open:ring-brand/25"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15.5px] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-45"
                >
                  <path
                    d="M8 3v10M3 8h10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
