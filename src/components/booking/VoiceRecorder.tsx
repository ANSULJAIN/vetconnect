"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Records a short voice note and uploads it, handing back a URL for the
 * WhatsApp message.
 *
 * Uploading happens the moment recording stops, not on submit: the booking
 * handler has to call window.open synchronously or the popup blocker kills it,
 * so it cannot await an upload. By the time the user presses Book, the URL is
 * already in hand.
 */

const MAX_SECONDS = 120;

/** First format the browser actually supports. Chrome gives webm, Safari mp4. */
function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function hasSupport() {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

const noop = () => () => {};
const serverSnapshot = () => false;

type State =
  | { kind: "idle" }
  | { kind: "recording"; seconds: number }
  | { kind: "uploading" }
  | { kind: "ready"; url: string; seconds: number }
  | { kind: "error"; message: string };

export function VoiceRecorder({
  onUploaded,
}: {
  /** URL of the stored note, or null once it is cleared. */
  onUploaded: (url: string | null) => void;
}) {
  const supported = useSyncExternalStore(noop, hasSupport, serverSnapshot);
  const [state, setState] = useState<State>({ kind: "idle" });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  function cleanup() {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  useEffect(
    () => () => {
      cleanup();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = rec;

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => void upload(rec.mimeType || mimeType);

      rec.start();

      let seconds = 0;
      setState({ kind: "recording", seconds });
      tickRef.current = setInterval(() => {
        seconds += 1;
        setState({ kind: "recording", seconds });
        if (seconds >= MAX_SECONDS) stop();
      }, 1000);
    } catch (err) {
      const denied = err instanceof DOMException && err.name === "NotAllowedError";
      setState({
        kind: "error",
        message: denied
          ? "Microphone blocked. Allow access in your browser settings, or type the symptoms."
          : "Could not start recording. You can type the symptoms instead.",
      });
    }
  }

  function stop() {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  async function upload(mimeType: string) {
    const seconds =
      state.kind === "recording" ? state.seconds : 0;
    setState({ kind: "uploading" });

    const type = (mimeType || "audio/webm").split(";")[0];
    const blob = new Blob(chunksRef.current, { type });
    cleanup();

    try {
      const res = await fetch("/api/upload-recording", {
        method: "POST",
        headers: { "content-type": type },
        body: blob,
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed. Please try again, or type the symptoms.");
      }

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(blob);

      setState({ kind: "ready", url: data.url, seconds });
      onUploaded(data.url);
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Upload failed.",
      });
      onUploaded(null);
    }
  }

  function discard() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setState({ kind: "idle" });
    onUploaded(null);
  }

  if (!supported) return null;

  return (
    <div className="mt-3">
      {state.kind === "idle" && (
        <button type="button" onClick={start} className={btnIdle}>
          <MicIcon className="h-4 w-4 text-brand" />
          Record a voice note
        </button>
      )}

      {state.kind === "recording" && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={stop} className={btnRecording}>
            <span className="relative flex h-3 w-3" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
            Stop recording
          </button>
          <span className="font-mono text-[13.5px] font-bold tabular-nums text-clay">
            {fmt(state.seconds)} / {fmt(MAX_SECONDS)}
          </span>
        </div>
      )}

      {state.kind === "uploading" && (
        <p className="inline-flex items-center gap-2.5 rounded-full bg-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink-muted ring-1 ring-line-soft">
          <Spinner />
          Saving your voice note…
        </p>
      )}

      {state.kind === "ready" && (
        <div className="rounded-2xl bg-brand-wash p-4 ring-1 ring-brand/15">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-brand-deep">
              <MicIcon className="h-4 w-4" />
              Voice note attached · {fmt(state.seconds)}
            </p>
            <button
              type="button"
              onClick={discard}
              className="text-[13px] font-semibold text-clay underline underline-offset-2 hover:no-underline"
            >
              Delete and re-record
            </button>
          </div>
          {objectUrlRef.current && (
            <audio
              controls
              src={objectUrlRef.current}
              className="mt-3 w-full"
              aria-label="Your recording"
            />
          )}
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-muted">
            The link goes in your WhatsApp message, so the vet can listen before
            calling you back.
          </p>
        </div>
      )}

      {state.kind === "error" && (
        <div>
          <p role="alert" className="text-[13px] text-clay">
            {state.message}
          </p>
          <button type="button" onClick={() => setState({ kind: "idle" })} className={`${btnIdle} mt-2`}>
            <MicIcon className="h-4 w-4 text-brand" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

const btnIdle =
  "inline-flex items-center gap-2.5 rounded-full bg-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink-soft ring-1 ring-line-soft transition-all duration-300 hover:text-brand-deep hover:ring-vivid/45";
const btnRecording =
  "inline-flex items-center gap-2.5 rounded-full bg-clay px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-md shadow-clay/25 transition-all duration-300 hover:bg-clay/90";

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-brand"
    />
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="9" y="2.6" width="6" height="11.2" rx="3" />
      <path d="M5.4 11.2a6.6 6.6 0 0 0 13.2 0" />
      <path d="M12 17.8v3.6M8.8 21.4h6.4" />
    </svg>
  );
}
