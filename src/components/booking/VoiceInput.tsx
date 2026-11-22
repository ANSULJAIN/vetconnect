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
  /** Which language is being dictated right now, or null when idle. */
  const [listening, setListening] = useState<string | null>(null);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  // Make sure a live recogniser is torn down if the form unmounts mid-dictation.
  useEffect(() => () => recRef.current?.stop(), []);

  function stop() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(null);
    setInterim("");
  }

  function start(lang: string) {
    // Switching language mid-dictation: drop the old recogniser first.
    if (recRef.current) stop();
    const rec = getRecognition();
    if (!rec) return;

    setError(null);
    rec.lang = LOCALE[lang] ?? "en-IN";
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
      if (recRef.current !== rec) return; // a recogniser we already replaced
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
      // Only clear if this recogniser is still the live one — a language
      // switch ends the old one after the new one has started.
      if (recRef.current === rec || recRef.current === null) {
        recRef.current = null;
        setListening(null);
        setInterim("");
      }
    };

    recRef.current = rec;
    rec.start();
    setListening(lang);
  }

  if (!supported) return null;

  // One button. It listens in the consultation language chosen above, so a
  // Hindi speaker who picked Hindi gets Hindi without another choice here.
  const active = listening !== null;

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => (active ? stop() : start(language))}
        aria-pressed={active}
        aria-label={active ? "Stop dictation" : `Dictate in ${language}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-all duration-300",
          active
            ? "bg-clay text-white shadow-md shadow-clay/25"
            : "bg-surface text-ink-soft ring-1 ring-line-soft hover:text-brand-deep hover:ring-vivid/45",
        )}
      >
        {active ? (
          <span className="relative flex h-3 w-3" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
        ) : (
          <MicIcon className="h-4 w-4 text-brand" />
        )}
        {active ? "Listening… tap to stop" : "Dictate"}
      </button>
      <span className="text-[12.5px] text-ink-faint">
        {active ? `Speak in ${language}` : `Speak and we'll type it · ${language}`}
      </span>

      {interim && (
        <p className="w-full text-[13.5px] text-ink-faint italic" aria-live="polite">
          {interim}…
        </p>
      )}
      {error && (
        <p role="alert" className="w-full text-[13px] text-clay">
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
