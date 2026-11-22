"use client";

import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/useAuth";
import { useArea } from "@/lib/area";

/** Sends people back where they came from (?next=/path), or to their account. */
function nextPath() {
  const host = location.hostname;
  const home = host.startsWith("vet.") ? "/doctor/" : host.startsWith("admin.") ? "/admin/" : "/account/";
  const next = new URLSearchParams(location.search).get("next") ?? home;
  // Only same-site paths — never an open redirect.
  return next.startsWith("/") && !next.startsWith("//") ? next : home;
}

export function LoginPage() {
  const auth = useAuth();
  const area = useArea();

  useEffect(() => {
    if (auth.status === "signed-in") location.replace(nextPath());
  }, [auth.status]);

  return (
    <div className="mx-auto max-w-lg">
      <LoginForm
        title={area === "vet" ? "VetConnect for veterinarians" : area === "admin" ? "VetConnect admin" : "Sign in to VetConnect"}
        subtitle="We'll email you a 6-digit code. No password needed."
        onSignedIn={() => location.replace(nextPath())}
      />
    </div>
  );
}
