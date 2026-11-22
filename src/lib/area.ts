"use client";

import { useSyncExternalStore } from "react";

/**
 * Which part of VetConnect this page is being viewed on. The same build is
 * served on three addresses (see functions/_middleware.ts):
 *   main  — vetconnect.co.in (also previews and localhost)
 *   vet   — vet.vetconnect.co.in
 *   admin — admin.vetconnect.co.in
 */
export type Area = "main" | "vet" | "admin";

export const URLS = {
  main: "https://vetconnect.co.in",
  vet: "https://vet.vetconnect.co.in/doctor/",
  admin: "https://admin.vetconnect.co.in/admin/",
};

function areaFromHost(host: string): Area {
  if (host.startsWith("vet.")) return "vet";
  if (host.startsWith("admin.")) return "admin";
  return "main";
}

/** True on the live domains, where vet/admin have their own addresses. */
export function onLiveDomain(host = typeof location === "undefined" ? "" : location.hostname) {
  return host === "vetconnect.co.in" || host.endsWith(".vetconnect.co.in");
}

const noop = () => () => {};

export function useArea(): Area {
  return useSyncExternalStore(noop, () => areaFromHost(location.hostname), () => "main");
}

/**
 * Link to the vet or admin area: the separate address on the live site, the
 * local path on previews/localhost so testing still works on one address.
 */
export function useAreaHref(target: "vet" | "admin"): string {
  const live = useSyncExternalStore(noop, () => onLiveDomain(), () => true);
  if (live) return URLS[target];
  return target === "vet" ? "/doctor/" : "/admin/";
}
