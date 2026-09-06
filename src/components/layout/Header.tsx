"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { NAV, SITE } from "@/data/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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
        "sticky inset-x-0 top-0 z-50 bg-surface transition-shadow duration-300",
        (scrolled || open) && "shadow-[0_1px_0_rgba(20,32,28,0.08)]",
      )}
    >
      <Container size="wide" className="flex items-center gap-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={600}
            height={585}
            priority
            className="h-10 w-auto"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[20px] font-extrabold tracking-tight text-brand-deep">
              VetConnect
            </span>
            <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink-faint">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13.5px] font-medium tracking-tight text-ink-soft uppercase transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/consult"
            className="hidden rounded-full bg-clay px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-clay/90 sm:inline-block"
          >
            Consult a vet
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-paper lg:hidden"
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
          "overflow-hidden border-t border-line-soft transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 border-t-0 opacity-0",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-[16px] text-ink-soft transition-colors hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/consult"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-clay px-5 py-3.5 text-center text-[15px] font-semibold text-white"
          >
            Consult a vet — ₹{SITE.consultPrice}
          </Link>
        </Container>
      </div>
    </header>
  );
}
