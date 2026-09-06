import { Container } from "@/components/ui/Container";

/**
 * Wrapper for the policy and information pages. Keeps them on the same type
 * scale as the rest of the site without pulling in a typography plugin.
 */
export function Prose({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper py-14 sm:py-20">
      <Container size="narrow">
        <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-tight text-ink text-balance sm:text-[40px]">
          {title}
        </h1>
        {updated && (
          <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            Last updated {updated}
          </p>
        )}
        <div
          className="mt-10 flex flex-col gap-5 text-[15.5px] leading-relaxed text-ink-soft
            [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2
            [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink
            [&_li]:mb-2 [&_strong]:font-semibold [&_strong]:text-ink
            [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:pl-5"
        >
          {children}
        </div>
      </Container>
    </div>
  );
}
