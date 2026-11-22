"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseReady, type Profile } from "@/lib/supabase";

export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; session: Session; profile: Profile | null };

/** Current session plus the profile row (role, name, phone). */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() =>
    supabaseReady ? { status: "loading" } : { status: "signed-out" },
  );

  useEffect(() => {
    if (!supabaseReady) return;
    const sb = supabase();
    let cancelled = false;

    async function load(session: Session | null) {
      if (!session) {
        if (!cancelled) setState({ status: "signed-out" });
        return;
      }
      const { data } = await sb.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (!cancelled) setState({ status: "signed-in", session, profile: (data as Profile) ?? null });
    }

    sb.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      // Defer: Supabase warns against awaiting other calls inside this callback.
      setTimeout(() => load(session), 0);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
