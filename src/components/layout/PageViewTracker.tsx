"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/track";

/** Logs one page_view per route change, for the admin funnel. */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    track("page_view");
  }, [pathname]);
  return null;
}
