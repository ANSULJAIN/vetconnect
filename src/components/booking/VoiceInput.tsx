"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/**
 * Dictation button for the symptoms field.
 *
 * Uses the browser's built-in SpeechRecognition, so nothing is uploaded and
 * there is no audio to store — the transcript lands in the textarea the user
 * can then correct, and travels inside the WhatsApp message like any other
 * typed text.
 *
 * The API is unevenly supported (no Firefox by default), so the button only
 * renders where it exists. Typing is always the fallback.
 */

/** Recognition wants a BCP-47 tag, not the label shown on the chip. */
const LOCALE: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Telugu: "te-IN",
  Tamil: "ta-IN",
  Odia: "or-IN",
  Punjabi: "pa-Guru-IN",
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >;
};

type Win = {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function recognitionCtor() {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Win;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function getRecognition(): SpeechRecognitionLike | null {
  const Ctor = recognitionCtor();
  return Ctor ? new Ctor() : null;
}

/* Support never changes after load, so the subscribe function is a no-op.
   useSyncExternalStore gives the server a false snapshot, which avoids both a
   hydration mismatch and a setState-in-effect. */
const noop = () => () => {};
const clientHasSupport = () => recognitionCtor() !== undefined;
const serverHasSupport = () => false;

export function VoiceInput({
  language,
  onTranscript,
}: {
  language: string;
  /** Called with each finalised phrase, to append to whatever is typed. */
  onTranscript: (text: string) => void;
}) {
  const supported = useSyncExternalStore(noop, clientHasSupport, serverHasSupport);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  // Make sure a live recogniser is torn down if the form unmounts mid-dictation.
  useEffect(() => () => recRef.current?.stop(), []);

  function stop() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
    setInterim("");
  }

  function start() {
    const rec = getRecognition();
    if (!rec) return;

    setError(null);
    rec.lang = LOCALE[language] ?? "en-IN";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let pending = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript;
        if (r.isFinal) onTranscript(text.trim());
        else pending += text;
      }
      setInterim(pending);
    };

    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "Microphone blocked. Allow access in your browser settings, or type instead."
          : e.error === "no-speech"
            ? "We didn't catch that. Try again, a little closer to the microphone."
            : "Dictation stopped. You can type the symptoms instead.",
      );
      stop();
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  if (!supported) return null;

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-all duration-300",
          listening
            ? "bg-clay text-white shadow-md shadow-clay/25"
            : "bg-surface text-ink-soft ring-1 ring-line-soft hover:text-brand-deep hover:ring-vivid/45",
        )}
      >
        {listening ? (
          <span className="relative flex h-3 w-3" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
        ) : (
          <MicIcon className="h-4 w-4 text-brand" />
        )}
        {listening ? "Listening — tap to stop" : `Speak in ${language}`}
      </button>

      {interim && (
        <p className="mt-2 text-[13.5px] text-ink-faint italic" aria-live="polite">
          {interim}…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-clay">
          {error}
        </p>
      )}
    </div>
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
