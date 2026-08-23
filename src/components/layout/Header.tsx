"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { IconStethoscope } from "@/components/illustrations/Icons";
import { cn } from "@/lib/utils";

const LINKS: [string, string][] = [
  ["How it works", "#how"],
  ["For vets", "#vets"],
  ["The pilot", "#pilot"],
  ["FAQ", "#faq"],
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Don't let the page scroll behind an open menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        open && "bg-paper py-3 shadow-[0_1px_0_rgba(20,32,28,0.07)]",
        !open && scrolled && "bg-paper/85 py-3 shadow-[0_1px_0_rgba(20,32,28,0.07)] backdrop-blur-xl",
        !open && !scrolled && "bg-transparent py-5",
      )}
    >
      <Container className="flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <IconStethoscope className="h-6 w-6 text-brand" />
          <span className="font-display text-[19px] font-bold tracking-tight text-ink">
            VetConnect
          </span>
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-[14px] text-ink-muted transition-colors hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-paper transition-colors hover:bg-brand-deep sm:inline-block"
          >
            Get in touch
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-surface md:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" aria-hidden="true">
              <path
                d={open ? "M5 5l10 10M15 5L5 15" : "M3 6h14M3 13h14"}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </Container>

      {/* mobile panel */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-400 md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <Container className="flex flex-col gap-1 pb-5 pt-4">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-[16px] text-ink-soft transition-colors hover:bg-surface"
            >
              {label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-ink px-5 py-3.5 text-center text-[15px] font-medium text-paper"
          >
            Get in touch
          </a>
        </Container>
      </div>
    </header>
  );
}
