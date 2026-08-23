"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades and lifts its children into view once, when they first enter the
 * viewport. Reduced-motion users get the final state immediately — that is
 * handled by the media query in globals.css.
 *
 * The observer is wired up in a ref callback rather than an effect so setup
 * happens exactly when the node attaches, and tears down when it detaches.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const [shown, setShown] = useState(false);

  const attach = useCallback((node: HTMLElement | null) => {
    if (!node || typeof IntersectionObserver === "undefined") {
      // No observer available — show it rather than leaving it invisible.
      if (node) setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={attach as never}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", shown && "reveal-in", className)}
    >
      {children}
    </Tag>
  );
}
