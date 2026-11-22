"use client";

import Link from "next/link";
import { supabaseReady } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

/** "Sign in" or "My account" (or the dashboard for vets/admins) in the header. */
export function AccountLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const auth = useAuth();
  if (!supabaseReady || auth.status === "loading") return null;

  const role = auth.status === "signed-in" ? auth.profile?.role : null;
  const href = auth.status === "signed-out" ? "/login/" : role === "doctor" ? "/doctor/" : role === "admin" ? "/admin/" : "/account/";
  const label = auth.status === "signed-out" ? "Sign in" : role === "doctor" ? "Dashboard" : role === "admin" ? "Admin" : "My account";

  return (
    <Link href={href} onClick={onClick} className={cn("text-[13.5px] font-semibold text-brand-deep hover:text-brand", className)}>
      {label}
    </Link>
  );
}
