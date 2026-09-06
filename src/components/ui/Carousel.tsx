"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll-snap carousel with arrows and dots.
 *
 * Native scrolling does the work, so it stays swipeable on touch and keyboard
 * accessible without a library. Items are sized so the next one always peeks
 * past the edge — a flush row reads as a static grid and nobody discovers the
 * scroll.
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
  const [scrollable, setScrollable] = useState(false);
  const [current, setCurrent] = useState(0);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollable(max > 4);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);

    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 20 : 1;
    setCurrent(Math.round(el.scrollLeft / step));
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

  const scrollToIndex = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollTo({ left: i * step, behavior: "smooth" });
  };

  const page = (dir: -1 | 1) => scrollToIndex(current + dir);

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
              // deliberately not a clean third — the next card must peek
              "w-[78%] sm:w-[44%] lg:w-[29%]",
              itemClassName,
            )}
          >
            {child}
          </li>
        ))}
      </ul>

      {scrollable && (
        <>
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Previous"
            className="absolute top-1/2 -left-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-md ring-1 ring-line transition-all hover:bg-vivid hover:text-white hover:ring-vivid disabled:pointer-events-none disabled:opacity-0 lg:flex"
          >
            <Chevron className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="Next"
            className="absolute top-1/2 -right-3 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-md ring-1 ring-line transition-all hover:bg-vivid hover:text-white hover:ring-vivid disabled:pointer-events-none disabled:opacity-0 lg:flex"
          >
            <Chevron className="h-4 w-4" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            {children.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to item ${i + 1}`}
                aria-current={current === i}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  current === i ? "w-7 bg-brand" : "w-2 bg-line hover:bg-brand/40",
                )}
              />
            ))}
          </div>
        </>
      )}
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
