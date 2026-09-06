"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll-snap carousel with arrow controls.
 *
 * Native scrolling does the work, so it stays swipeable on touch and keyboard
 * accessible without a library. The arrows page by the width of one visible
 * item and disable themselves at each end.
 */
export function Carousel({
  children,
  label,
  className,
  itemClassName,
}: {
  children: React.ReactNode[];
  label: string;
  className?: string;
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const page = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={trackRef}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => (
          <li
            key={i}
            className={cn(
              "shrink-0 snap-start",
              "w-[85%] sm:w-[48%] lg:w-[31.5%]",
              itemClassName,
            )}
          >
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => page(-1)}
        disabled={atStart}
        aria-label="Previous"
        className="absolute top-1/2 -left-2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-md ring-1 ring-line transition-all hover:bg-paper disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        <Chevron className="h-4 w-4 rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        disabled={atEnd}
        aria-label="Next"
        className="absolute top-1/2 -right-2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-md ring-1 ring-line transition-all hover:bg-paper disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        <Chevron className="h-4 w-4" />
      </button>
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <path
        d="m6 3 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
