import { Container } from "@/components/ui/Container";
import { IconStethoscope } from "@/components/illustrations/Icons";

export function Footer() {
  return (
    <footer className="border-t border-line-soft py-14">
      <Container>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <IconStethoscope className="h-5 w-5 text-brand" />
              <span className="font-display text-[17px] font-bold tracking-tight text-ink">
                VetConnect
              </span>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">
              Two-tier veterinary dispatch for rural India. Piloting in Pune
              district, Maharashtra.
            </p>
          </div>

          <nav className="flex gap-14">
            {[
              [
                "Product",
                [
                  ["How it works", "#how"],
                  ["For vets", "#vets"],
                  ["The pilot", "#pilot"],
                ],
              ],
              [
                "Company",
                [
                  ["FAQ", "#faq"],
                  ["Contact", "#contact"],
                ],
              ],
            ].map(([heading, links]) => (
              <div key={heading as string}>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  {heading as string}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {(links as string[][]).map(([label, href]) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="text-[14px] text-ink-muted transition-colors hover:text-ink"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line-soft pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-ink-faint">
            © {new Date().getFullYear()} VetConnect
          </p>
          <p className="font-mono text-[11px] text-ink-faint">
            Figures cited from the 20th Livestock Census and DAHD
          </p>
        </div>
      </Container>
    </footer>
  );
}
