"use client";

import { useState } from "react";
import { supabase, supabaseReady } from "@/lib/supabase";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

/**
 * Passwordless sign-in: email -> 6-digit code -> signed in.
 *
 * Email rather than SMS because Indian SMS OTP needs DLT registration, which
 * takes days. Switching to phone OTP later means replacing the two Supabase
 * calls here (signInWithOtp({ phone }) / verifyOtp({ type: "sms" })); nothing
 * else depends on how the user signed in.
 */
export function LoginForm({
  onSignedIn,
  title = "Sign in to continue",
  subtitle = "We'll email you a 6-digit code. No password needed.",
  compact = false,
}: {
  onSignedIn?: () => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  if (!supabaseReady) {
    return (
      <p className="rounded-xl bg-clay-soft px-4 py-3 text-[14px] text-clay">
        Accounts are being set up. Please book on WhatsApp for now.
      </p>
    );
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (!emailOk) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true, emailRedirectTo: location.href },
    });
    setBusy(false);
    if (error) {
      setError(
        error.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : "Could not send the code. Check the email address and try again.",
      );
      return;
    }
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length < 6) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase().auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });
    setBusy(false);
    if (error) {
      setError("That code didn't work. Check it, or send a new one.");
      return;
    }
    track("login_done");
    onSignedIn?.();
  }

  return (
    <div className={cn(!compact && "rounded-2xl bg-surface p-6 shadow-lg ring-1 ring-line-soft sm:p-8")}>
      <h2 className="font-display text-[22px] font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">
        {step === "email" ? subtitle : `Enter the 6-digit code sent to ${email.trim()}.`}
      </p>

      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
          <button type="submit" disabled={!emailOk || busy} className={btnClass}>
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className={cn(inputClass, "font-mono tracking-[0.3em]")}
            />
            <button type="submit" disabled={code.replace(/\D/g, "").length < 6 || busy} className={btnClass}>
              {busy ? "Checking…" : "Verify"}
            </button>
          </div>
          <div className="mt-3 flex gap-4 text-[13px]">
            <button type="button" onClick={() => sendCode()} className="font-semibold text-brand hover:underline">
              Send a new code
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
              }}
              className="text-ink-muted hover:underline"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[13.5px] text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full flex-1 rounded-xl bg-surface px-4 py-3.5 text-[15px] text-ink shadow-sm ring-1 ring-line transition-shadow placeholder:text-ink-faint focus:ring-2 focus:ring-brand focus:outline-none";
const btnClass =
  "shrink-0 rounded-full bg-brand px-7 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-brand/20 transition-all hover:bg-vivid disabled:pointer-events-none disabled:opacity-45";
