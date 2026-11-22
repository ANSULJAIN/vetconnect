"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StatusBadge, UrgencyBadge } from "@/components/account/StatusBadge";
import { accessToken, supabase, type Consultation, type Doctor, type Message, type Profile } from "@/lib/supabase";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

/**
 * One consultation's chat. Customer and assigned doctor see the same room;
 * row-level security decides who can read and post (supabase/migrations).
 * New messages arrive over Supabase Realtime.
 */
export function ChatPage() {
  const id = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(location.search).get("c"),
    () => null,
  );

  return (
    <RequireAuth>
      {({ session, profile }) =>
        id ? (
          <ChatRoom consultationId={id} userId={session.user.id} profile={profile} />
        ) : (
          <p className="py-20 text-center text-ink-muted">No consultation selected.</p>
        )
      }
    </RequireAuth>
  );
}

function ChatRoom({ consultationId, userId, profile }: { consultationId: string; userId: string; profile: Profile | null }) {
  const sb = supabase();
  const [consult, setConsult] = useState<Consultation | null | undefined>(undefined);
  const [doctor, setDoctor] = useState<Pick<Doctor, "full_name" | "qualification" | "photo_path"> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Google Meet set-up panel for the vet (first time, or to change the link). */
  const [meetPanel, setMeetPanel] = useState(false);
  const [meetDraft, setMeetDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isDoctor = consult?.doctor_id === userId;
  const isCustomer = consult?.customer_id === userId;
  const myRole = isDoctor ? "doctor" : "customer";

  const loadConsult = useCallback(async () => {
    const { data } = await sb.from("consultations").select("*").eq("id", consultationId).maybeSingle();
    setConsult((data as Consultation) ?? null);
    return data as Consultation | null;
  }, [sb, consultationId]);

  // Initial load + realtime subscription.
  useEffect(() => {
    let alive = true;
    queueMicrotask(loadConsult);
    sb.from("messages")
      .select("*")
      .eq("consultation_id", consultationId)
      .order("id")
      .then(({ data }) => alive && setMessages((data as Message[]) ?? []));

    const channel = sb
      .channel(`consult:${consultationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `consultation_id=eq.${consultationId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          if (m.sender_id !== userId) notify(m);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "consultations", filter: `id=eq.${consultationId}` },
        (payload) => setConsult(payload.new as Consultation),
      )
      .subscribe();

    return () => {
      alive = false;
      sb.removeChannel(channel);
    };
  }, [sb, consultationId, userId, loadConsult]);

  // While payment is still being confirmed, poll as a backstop to realtime.
  useEffect(() => {
    if (consult?.status !== "awaiting_payment") return;
    const t = setInterval(loadConsult, 4000);
    return () => clearInterval(t);
  }, [consult?.status, loadConsult]);

  // Doctor card for the customer.
  useEffect(() => {
    if (!consult?.doctor_id) return;
    sb.from("doctors")
      .select("full_name, qualification, photo_path")
      .eq("id", consult.doctor_id)
      .maybeSingle()
      .then(({ data }) => setDoctor(data));
  }, [sb, consult?.doctor_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Ask once for notification permission so new replies can ping a background tab.
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const expired = consult?.chat_expires_at ? new Date(consult.chat_expires_at) < new Date() : false;
  const canPost =
    !!consult &&
    !expired &&
    ((isCustomer && ["paid", "active"].includes(consult.status)) || (isDoctor && consult.status === "active"));

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || !canPost) return;
    setSending(true);
    setError(null);
    const { error } = await sb
      .from("messages")
      .insert({ consultation_id: consultationId, sender_id: userId, sender_role: myRole, body });
    setSending(false);
    if (error) {
      setError("Message not sent. The chat may have closed — refresh to check.");
      return;
    }
    setDraft("");
    track("chat_message", { role: myRole });
  }

  async function attach(file: File) {
    if (!canPost) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Files must be under 8 MB.");
      return;
    }
    setSending(true);
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${consultationId}/${crypto.randomUUID()}.${ext}`;
    const up = await sb.storage.from("chat-attachments").upload(path, file, { contentType: file.type });
    if (up.error) {
      setSending(false);
      setError("Upload failed. Photos (JPG/PNG) and PDFs only, up to 8 MB.");
      return;
    }
    await sb.from("messages").insert({
      consultation_id: consultationId,
      sender_id: userId,
      sender_role: myRole,
      attachment_path: path,
      body: draft.trim() || null,
    });
    setDraft("");
    setSending(false);
  }

  /**
   * Video call via Google Meet. The vet's Meet link is remembered on their
   * device, so after the first time it is one tap: post the link in the chat
   * and open Meet. First time, we open meet.new and ask them to paste the link.
   */
  async function postMeetLink(link: string) {
    const { error } = await sb.from("messages").insert({
      consultation_id: consultationId,
      sender_id: userId,
      sender_role: "doctor",
      body: `🎥 Video call — tap to join:\n${link}`,
    });
    if (error) {
      setError("Could not send the call link. The chat may have closed — refresh to check.");
      return false;
    }
    track("video_call_link", {});
    return true;
  }

  const [meetBusy, setMeetBusy] = useState(false);

  /**
   * Preferred: our backend creates a Google Meet room (owned by the VetConnect
   * Google account, inviting vet + pet parent) and posts it in the chat.
   * Fallback when Google isn't connected yet: the vet's own saved Meet link,
   * or the paste-a-link panel.
   */
  async function startVideoCall() {
    if (consult?.meet_link) {
      window.open(consult.meet_link, "_blank", "noopener,noreferrer");
      return;
    }
    // Open the tab now, while it still counts as the vet's click; fill it in
    // once the link arrives (otherwise popup blockers stop it).
    const tab = window.open("about:blank", "_blank");
    setMeetBusy(true);
    setError(null);
    try {
      const token = await accessToken();
      const res = await fetch("/api/meet", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ consultationId }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; link?: string; reason?: string; error?: string };
      if (data.ok && data.link) {
        track("video_call_link", { auto: true });
        if (tab) tab.location.href = data.link;
        else window.open(data.link, "_blank", "noopener,noreferrer");
        return;
      }
      tab?.close();
      if (data.reason === "not_connected") {
        // Fallback: the vet's own Meet link.
        const saved = safeGet(MEET_KEY);
        if (saved && isMeetLink(saved)) {
          window.open(saved, "_blank", "noopener,noreferrer");
          postMeetLink(saved);
        } else {
          setMeetDraft("");
          setMeetPanel(true);
        }
        return;
      }
      setError(data.error ?? "Could not start the video call. Try again.");
    } catch {
      tab?.close();
      setError("Could not start the video call. Check your connection and try again.");
    } finally {
      setMeetBusy(false);
    }
  }

  async function sendMeetDraft() {
    const link = meetDraft.trim();
    if (!isMeetLink(link)) {
      setError("That doesn't look like a Google Meet link. It should start with https://meet.google.com/");
      return;
    }
    setError(null);
    safeSet(MEET_KEY, link);
    if (await postMeetLink(link)) setMeetPanel(false);
  }

  async function closeConsult() {
    if (!confirm("Close this consultation? The chat becomes read-only.")) return;
    const { error } = await sb.rpc("close_consultation", { c_id: consultationId });
    if (error) {
      setError(
        error.message.includes("not_self_assigned")
          ? "This is a test case where the vet and the pet parent are the same account, so it can't be closed."
          : "Could not close the consultation. Refresh and try again.",
      );
    }
  }

  if (consult === undefined) return <p className="py-20 text-center text-ink-muted">Loading chat…</p>;
  if (consult === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-muted">This consultation was not found, or you don&rsquo;t have access to it.</p>
        <Link href="/account/" className="mt-4 inline-block font-semibold text-brand underline">Back to your account</Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[32rem] flex-col overflow-hidden rounded-3xl bg-surface shadow-lg ring-1 ring-line-soft">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[12px] font-bold tracking-widest text-ink-faint">{consult.code}</span>
            <StatusBadge status={expired && consult.status !== "closed" ? "closed" : consult.status} />
            {isDoctor && <UrgencyBadge urgency={consult.urgency} />}
          </div>
          <p className="mt-1 truncate font-semibold text-ink">
            {isDoctor
              ? `${consult.customer_name} · ${consult.pet_species}${consult.pet_age ? `, ${consult.pet_age}` : ""}`
              : doctor
                ? `${doctor.full_name} · ${doctor.qualification}`
                : "Your veterinarian will join shortly"}
          </p>
        </div>
        <div className="flex gap-2">
          {!isDoctor && consult.meet_link && canPost && (
            <a
              href={consult.meet_link}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-vivid"
            >
              🎥 Join video call
            </a>
          )}
          {isDoctor && canPost && (
            <button
              type="button"
              onClick={startVideoCall}
              disabled={meetBusy}
              className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-vivid disabled:opacity-60"
            >
              {meetBusy ? "Starting…" : "🎥 Video call"}
            </button>
          )}
          {(isDoctor || profile?.role === "admin") && consult.status === "active" && (
            <button type="button" onClick={closeConsult} className="rounded-full px-4 py-2 text-[13px] font-semibold text-clay ring-1 ring-clay/40">
              Close
            </button>
          )}
          <Link href={isDoctor ? "/doctor/" : "/account/"} className="rounded-full px-4 py-2 text-[13px] font-semibold text-ink-muted ring-1 ring-line">
            Back
          </Link>
        </div>
      </div>

      {/* Google Meet set-up for the vet */}
      {isDoctor && meetPanel && (
        <div className="border-b border-line-soft bg-surface px-5 py-4 text-[14px] text-ink-soft">
          <p className="font-semibold text-ink">Start a Google Meet video call</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13.5px]">
            <li>
              <a href="https://meet.new" target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
                Open Google Meet
              </a>{" "}
              (creates a new meeting in your Google account).
            </li>
            <li>Copy the meeting link (meet.google.com/…).</li>
            <li>Paste it below — we send it to the pet parent and remember it for next time.</li>
          </ol>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={meetDraft}
              onChange={(e) => setMeetDraft(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full flex-1 rounded-xl bg-paper px-4 py-2.5 text-[14.5px] ring-1 ring-line focus:ring-2 focus:ring-brand focus:outline-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={sendMeetDraft} className="rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white">
                Send link
              </button>
              <button type="button" onClick={() => setMeetPanel(false)} className="rounded-full px-4 py-2.5 text-[14px] text-ink-muted ring-1 ring-line">
                Cancel
              </button>
            </div>
          </div>
          {safeGet(MEET_KEY) && (
            <p className="mt-2 text-[12.5px] text-ink-faint">Replacing your saved link: {safeGet(MEET_KEY)}</p>
          )}
        </div>
      )}

      {/* case panel for the doctor */}
      {isDoctor && (
        <details className="border-b border-line-soft bg-brand-wash px-5 py-3 text-[13.5px] text-ink-soft" open>
          <summary className="cursor-pointer font-semibold text-brand-deep">Case details</summary>
          <p className="mt-2"><strong>Issue:</strong> {consult.issue}</p>
          {consult.intake?.summary && <p className="mt-1"><strong>AI intake:</strong> {consult.intake.summary}</p>}
          {!!consult.intake?.red_flags?.length && (
            <p className="mt-1 text-clay"><strong>Red flags:</strong> {consult.intake.red_flags.join(", ")}</p>
          )}
          <p className="mt-1 text-ink-muted">
            {consult.language} · {consult.pet_gender ?? "gender not given"} · slot {consult.slot_label ?? "ASAP"} · phone {consult.customer_phone}
          </p>
        </details>
      )}

      {/* status banners */}
      {consult.status === "awaiting_payment" && (
        <Banner tone="clay">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-clay/30 border-t-clay" />
          Confirming your payment… this usually takes a few seconds.
        </Banner>
      )}
      {consult.status === "paid" && isCustomer && (
        <Banner tone="brand">Payment received. A veterinarian will join this chat shortly — you can add details or photos meanwhile.</Banner>
      )}
      {(consult.status === "closed" || expired) && (
        <Banner tone="muted">This consultation is closed. The chat is kept here for your records.</Banner>
      )}

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Bubble key={m.id} m={m} mine={m.sender_id === userId} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* composer */}
      {canPost ? (
        <form onSubmit={send} className="flex items-end gap-2 border-t border-line-soft p-3 sm:p-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) attach(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach a photo or report"
            title="Attach a photo or report"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted ring-1 ring-line hover:text-brand"
          >
            📎
          </button>
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl bg-paper px-4 py-3 text-[15px] ring-1 ring-line-soft focus:ring-2 focus:ring-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="h-11 shrink-0 rounded-full bg-brand px-5 text-[14.5px] font-semibold text-white disabled:opacity-45"
          >
            Send
          </button>
        </form>
      ) : null}
      {error && <p role="alert" className="px-5 pb-3 text-[13px] text-clay">{error}</p>}
    </div>
  );
}

const noopSubscribe = () => () => {};

function Banner({ tone, children }: { tone: "clay" | "brand" | "muted"; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 px-5 py-3 text-[13.5px]",
        tone === "clay" && "bg-clay-soft text-clay",
        tone === "brand" && "bg-brand-wash text-brand-deep",
        tone === "muted" && "bg-paper-deep text-ink-muted",
      )}
    >
      {children}
    </p>
  );
}

function Bubble({ m, mine }: { m: Message; mine: boolean }) {
  if (m.sender_role === "system") {
    return (
      <p className="mx-auto max-w-[90%] rounded-xl bg-paper px-4 py-2.5 text-center text-[12.5px] leading-relaxed whitespace-pre-line text-ink-muted">
        <Linkified text={m.body} />
      </p>
    );
  }
  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <span className="mb-1 px-1 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
        {m.sender_role === "doctor" ? "Vet" : mine ? "You" : "Pet parent"}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap",
          mine ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-paper text-ink ring-1 ring-line-soft",
        )}
      >
        {m.attachment_path && <Attachment path={m.attachment_path} mine={mine} />}
        <Linkified text={m.body} mine={mine} />
      </div>
      <span className="mt-1 px-1 text-[10.5px] text-ink-faint">
        {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
      </span>
    </div>
  );
}

/** Private bucket, so files are shown through short-lived signed URLs. */
function Attachment({ path, mine }: { path: string; mine: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase()
      .storage.from("chat-attachments")
      .createSignedUrl(path, 3600)
      .then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);
  if (!url) return <span className="block text-[13px] opacity-70">Loading file…</span>;
  if (path.endsWith(".pdf")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={cn("mb-1 block font-semibold underline", mine ? "text-white" : "text-brand")}>
        📄 Open PDF
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Attachment" className="mb-1.5 max-h-64 rounded-xl object-cover" />
    </a>
  );
}

function notify(m: Message) {
  if (typeof document === "undefined" || !document.hidden) return;
  document.title = "💬 New message · VetConnect";
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(m.sender_role === "doctor" ? "Your vet replied" : "New message from a pet parent", {
        body: m.body?.slice(0, 120) ?? "Sent an attachment",
      });
    } catch {
      // Some mobile browsers only allow notifications from a service worker.
    }
  }
  const reset = () => {
    document.title = "VetConnect";
    document.removeEventListener("visibilitychange", reset);
  };
  document.addEventListener("visibilitychange", reset);
}

const MEET_KEY = "vc_meet_link";

function isMeetLink(v: string) {
  return /^https:\/\/meet\.google\.com\/[a-z0-9-]+(\?.*)?$/i.test(v.trim());
}

function safeGet(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    // Storage blocked: the vet just pastes the link again next time.
  }
}

/** Renders https:// links as tappable links; everything else stays plain text. */
function Linkified({ text, mine }: { text: string | null; mine?: boolean }) {
  if (!text) return null;
  const parts = text.split(/(https:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer noopener"
            className={cn("font-semibold break-all underline", mine ? "text-white" : "text-brand")}
          >
            {part.includes("meet.google.com") ? "Join video call →" : part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
