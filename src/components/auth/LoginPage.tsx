"use client";

import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/useAuth";

/** Sends people back where they came from (?next=/path), or to their account. */
function nextPath() {
  const next = new URLSearchParams(location.search).get("next") ?? "/account/";
  // Only same-site paths — never an open redirect.
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account/";
}

export function LoginPage() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "signed-in") location.replace(nextPath());
  }, [auth.status]);

  return (
    <div className="mx-auto max-w-lg">
      <LoginForm
        title="Sign in to VetConnect"
        subtitle="For pet parents and veterinarians. We'll email you a 6-digit code."
        onSignedIn={() => location.replace(nextPath())}
      />
    </div>
  );
}
