"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/data/site";

/**
 * Persistent booking bar. Hidden on the booking page itself, where it would
 * just cover the form it links to.
 */
export function StickyCTA() {
  const pathname = usePathname();
  if (pathname?.startsWith("/consult")) return null;

  return (
    <div className="pointer-events-none sticky bottom-0 z-40 flex flex-col items-center gap-2 pb-4 sm:pb-6">
      <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-[12px] font-semibold text-brand-deep shadow-md ring-1 ring-brand/15">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
        </span>
        Vets available now
      </span>

      <Link
        href="/consult"
        className="group pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-clay px-9 py-4 text-[16px] font-semibold text-white shadow-xl shadow-clay/30 transition-all hover:bg-clay/90"
      >
        Consult a vet now — ₹{SITE.consultPrice}
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
        >
          <path
            d="M2 8h11M9 4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
