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

  if (area === "vet") {
    return (
      <div className="mx-auto max-w-lg">
        <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-brand uppercase">For veterinarians</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight font-extrabold tracking-tight text-ink">
          Consult pet parents online, on your schedule
        </h1>
        <ul className="mt-4 space-y-1.5 text-[15px] text-ink-muted">
          <li>✓ Chat and phone consults with paid cases — details shared upfront</li>
          <li>✓ Go online whenever you&rsquo;re free — cases come to you</li>
          <li>✓ Verified vets only: we check your council registration</li>
        </ul>
        <div className="mt-7">
          <LoginForm
            title="Register or sign in"
            subtitle="New here? Enter your email and the 6-digit code we send — the registration form opens next. Already registered? The same steps take you to your dashboard."
            onSignedIn={() => location.replace(nextPath())}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <LoginForm
        title={area === "admin" ? "VetConnect admin" : "Sign in to VetConnect"}
        subtitle="We'll email you a 6-digit code. No password needed."
        onSignedIn={() => location.replace(nextPath())}
      />
    </div>
  );
}
