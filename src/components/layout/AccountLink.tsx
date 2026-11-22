"use client";

import Link from "next/link";
import { supabaseReady } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useArea } from "@/lib/area";
import { cn } from "@/lib/utils";

/** "Sign in" or "My account" (or the dashboard for vets/admins) in the header. */
export function AccountLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const auth = useAuth();
  const area = useArea();
  if (!supabaseReady || auth.status === "loading") return null;

  // Each area has its own sign-in, so each links to its own home.
  const home = area === "vet" ? "/doctor/" : area === "admin" ? "/admin/" : "/account/";
  const href = auth.status === "signed-out" ? "/login/" : home;
  const label =
    auth.status === "signed-out" ? "Sign in" : area === "vet" ? "Dashboard" : area === "admin" ? "Admin" : "My account";

  return (
    <Link href={href} onClick={onClick} className={cn("text-[13.5px] font-semibold text-brand-deep hover:text-brand", className)}>
      {label}
    </Link>
  );
}
