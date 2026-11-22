"use client";

import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseReady, type Profile } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

/** Renders children only for signed-in users; otherwise sends them to /login. */
export function RequireAuth({
  children,
}: {
  children: (ctx: { session: Session; profile: Profile | null }) => React.ReactNode;
}) {
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "signed-out" && supabaseReady) {
      location.replace(`/login/?next=${encodeURIComponent(location.pathname + location.search)}`);
    }
  }, [auth.status]);

  if (!supabaseReady) {
    return <p className="py-20 text-center text-ink-muted">Accounts are being set up. Please check back soon.</p>;
  }
  if (auth.status !== "signed-in") {
    return (
      <p className="flex items-center justify-center gap-2 py-20 text-ink-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
        Loading…
      </p>
    );
  }
  return <>{children({ session: auth.session, profile: auth.profile })}</>;
}

export function signOutButtonClass() {
  return "rounded-full px-4 py-2 text-[13.5px] font-semibold text-ink-muted ring-1 ring-line hover:bg-surface";
}
