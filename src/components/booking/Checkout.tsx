"use client";

import { useEffect, useRef, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { accessToken } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { track, visitorId } from "@/lib/track";
import { cn } from "@/lib/utils";
import { SITE } from "@/data/site";

export type CheckoutBooking = {
  date: string;
  dateLong: string;
  slot: string;
  price: number;
  pet: string;
  gender: string;
  age: string;
  language: string;
  issue: string;
  name: string;
  phone: string;
  email: string;
};

type Intake = { summary: string; urgency: "routine" | "soon" | "emergency"; category: string; red_flags: string[] };
type QA = { q: string; a: string };

type Step = "intake" | "login" | "pay";

/* Razorpay Checkout is a script tag, not an npm package. */
type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayFailure = { error?: { description?: string; reason?: string; code?: string } };
type RazorpayCtor = new (opts: Record<string, unknown>) => {
  open: () => void;
  close?: () => void;
  on: (e: string, cb: (r: RazorpayFailure) => void) => void;
};

function loadRazorpay(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay failed to load")));
    s.onerror = () => reject(new Error("Razorpay failed to load"));
    document.body.appendChild(s);
  });
}

export function Checkout({
  booking,
  onClose,
  onWhatsApp,
}: {
  booking: CheckoutBooking;
  onClose: () => void;
  /** Fallback when online payment isn't available. */
  onWhatsApp: () => void;
}) {
  const auth = useAuth();
  const [rawStep, setStep] = useState<Step>(SITE.aiIntake ? "intake" : "login");
  // Already signed in? The login step is skipped.
  const step: Step = rawStep === "login" && auth.status === "signed-in" ? "pay" : rawStep;
  const [answers, setAnswers] = useState<QA[]>([]);
  const [question, setQuestion] = useState<{ q: string; options: string[] } | null>(null);
  const [draft, setDraft] = useState("");
  const [intake, setIntake] = useState<Intake | null>(null);
  const [urgency, setUrgency] = useState<Intake["urgency"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payUnavailable, setPayUnavailable] = useState(false);
  const started = useRef(false);

  // Close on Escape; lock background scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, busy]);

  async function askNext(sofar: QA[]) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pet: booking.pet,
          gender: booking.gender,
          age: booking.age,
          language: booking.language,
          issue: booking.issue,
          answers: sofar,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        // Assistant unavailable: don't block the booking over it.
        finishIntake(null);
        return;
      }
      if (data.urgency) setUrgency(data.urgency);
      if (data.done) {
        track("intake_done", { urgency: data.intake?.urgency, questions: sofar.length });
        finishIntake(data.intake);
      } else {
        setQuestion({ q: data.question, options: data.options ?? [] });
      }
    } catch {
      finishIntake(null);
    } finally {
      setBusy(false);
    }
  }

  function finishIntake(result: Intake | null) {
    setIntake(result);
    if (result?.urgency) setUrgency(result.urgency);
    setQuestion(null);
    setStep("login");
  }

  // Kick off intake once.
  useEffect(() => {
    if (started.current || !SITE.aiIntake) return;
    started.current = true;
    track("intake_start");
    askNext([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answer(a: string) {
    if (!question || !a.trim()) return;
    const next = [...answers, { q: question.q, a: a.trim() }];
    setAnswers(next);
    setDraft("");
    setQuestion(null);
    askNext(next);
  }

  async function pay() {
    setBusy(true);
    setError(null);
    track("pay_click", { price: booking.price });
    try {
      const token = await accessToken();
      if (!token) {
        setStep("login");
        return;
      }
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking, intake, visitorId: visitorId() }),
      });
      const order = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setPayUnavailable(true);
        return;
      }
      if (!res.ok || !order.ok) throw new Error(order.error ?? "Could not start the payment.");

      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "VetConnect",
        description: `Vet consultation ${order.code}`,
        prefill: order.prefill,
        theme: { color: "#1f6b3a" },
        handler: async (r: RazorpayResponse) => {
          setBusy(true);
          const v = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(r),
          })
            .then((x) => x.json())
            .catch(() => ({ ok: false }));
          // Even if verify hiccups, the webhook will confirm — the chat page
          // shows "confirming payment" until it does.
          track(v.ok ? "payment_success" : "payment_verify_pending", { code: order.code });
          location.assign(`/chat/?c=${order.consultationId}`);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", (r) => {
        const why = r?.error?.description;
        track("payment_failed", { code: order.code, reason: r?.error?.reason ?? null });
        setError(
          `The payment didn't go through${why ? `: ${why}` : "."} Press Pay to try again, or use another UPI app or card. ` +
            "If money left your account, it is refunded automatically.",
        );
        setBusy(false);
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const steps: Step[] = SITE.aiIntake ? ["intake", "login", "pay"] : ["login", "pay"];
  const stepIndex = steps.indexOf(step);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10.5px] font-bold tracking-[0.14em] text-brand uppercase">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h2 id="checkout-title" className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink">
              {step === "intake" ? "A few quick questions" : step === "login" ? "Sign in" : "Confirm and pay"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted ring-1 ring-line hover:bg-surface disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <ol className="mt-4 flex gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <li key={i} className={cn("h-1 flex-1 rounded-full", i <= stepIndex ? "bg-brand" : "bg-line")} />
          ))}
        </ol>

        {urgency === "emergency" && (
          <p className="mt-5 rounded-xl border-l-[3px] border-clay bg-clay-soft px-4 py-3 text-[14px] leading-relaxed text-ink-soft">
            <strong className="text-clay">This may be an emergency.</strong> If your pet is struggling to breathe,
            has collapsed, is having seizures or is bleeding heavily, go to the nearest veterinary hospital now.
          </p>
        )}

        {/* ---- 1 · AI intake ---- */}
        {step === "intake" && (
          <div className="mt-6">
            <p className="text-[14px] leading-relaxed text-ink-muted">
              Our assistant asks what a vet would ask, so your veterinarian starts with the full picture.
            </p>

            {answers.map((x, i) => (
              <div key={i} className="mt-4">
                <p className="rounded-2xl rounded-bl-sm bg-surface px-4 py-3 text-[14.5px] text-ink ring-1 ring-line-soft">{x.q}</p>
                <p className="mt-2 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-[14.5px] text-white">
                  {x.a}
                </p>
              </div>
            ))}

            {question && (
              <div className="mt-4">
                <p className="rounded-2xl rounded-bl-sm bg-surface px-4 py-3 text-[15px] font-medium text-ink ring-1 ring-line-soft">
                  {question.q}
                </p>
                {question.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => answer(o)}
                        className="rounded-full bg-surface px-4 py-2.5 text-[14px] font-medium text-ink-soft ring-1 ring-line-soft hover:text-brand-deep hover:ring-brand/40"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    answer(draft);
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your answer"
                    className="w-full flex-1 rounded-xl bg-surface px-4 py-3 text-[15px] ring-1 ring-line focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="rounded-full bg-brand px-5 text-[14.5px] font-semibold text-white disabled:opacity-45"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {busy && (
              <p className="mt-4 inline-flex items-center gap-2 text-[13.5px] text-ink-muted">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-brand" />
                Thinking…
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                track("intake_skip", { answered: answers.length });
                finishIntake(null);
              }}
              className="mt-6 text-[13.5px] font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
            >
              Skip and continue
            </button>
          </div>
        )}

        {/* ---- 2 · login ---- */}
        {step === "login" && (
          <div className="mt-6">
            {auth.status === "loading" ? (
              <p className="text-[14px] text-ink-muted">Checking your account…</p>
            ) : (
              <LoginForm
                compact
                title="Sign in to open your chat"
                subtitle="Your consultation and chat with the vet are saved to your account. We'll email you a 6-digit code."
                onSignedIn={() => setStep("pay")}
              />
            )}
          </div>
        )}

        {/* ---- 3 · pay ---- */}
        {step === "pay" && (
          <div className="mt-6">
            <dl className="divide-y divide-line-soft rounded-2xl bg-surface px-5 ring-1 ring-line-soft">
              {[
                ["When", `${booking.dateLong} · ${booking.slot}`],
                ["Pet", [booking.pet, booking.gender, booking.age].filter(Boolean).join(" · ")],
                ["Language", booking.language],
                ["Call back on", booking.phone],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3 text-[14px]">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {intake?.summary && (
              <p className="mt-4 rounded-xl bg-brand-wash px-4 py-3 text-[13.5px] leading-relaxed text-ink-soft">
                <strong className="text-brand-deep">For your vet:</strong> {intake.summary}
              </p>
            )}

            {payUnavailable ? (
              <div className="mt-6 rounded-2xl bg-clay-soft p-5">
                <p className="text-[14.5px] text-ink-soft">
                  Online payment is being set up. Book on WhatsApp instead — we&rsquo;ll send a payment link.
                </p>
                <button
                  type="button"
                  onClick={onWhatsApp}
                  className="mt-4 rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white"
                >
                  Book on WhatsApp
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={pay}
                disabled={busy}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-[16px] font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-vivid disabled:opacity-50"
              >
                {busy ? "Opening payment…" : `Pay ₹${booking.price} and open chat`}
              </button>
            )}
            <p className="mt-3 text-center text-[12.5px] text-ink-faint">
              UPI, cards and netbanking via Razorpay. The chat with your vet opens as soon as payment is confirmed.
            </p>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-[13.5px] text-clay">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
