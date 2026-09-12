/**
 * POST /api/upload-recording
 *
 * Takes the audio blob the browser recorded and stores it in R2, returning a
 * URL that can be pasted into the WhatsApp message. The veterinarian opens
 * that link and hears the symptoms in the owner's own words.
 *
 * Upload happens when recording STOPS, not on submit — the booking submit has
 * to call window.open synchronously to avoid the popup blocker, so it cannot
 * await an upload first.
 */

import { json, type Env } from "./_shared";

/** Two minutes of Opus is ~360 KB; 6 MB leaves room for Safari's fatter AAC. */
const MAX_BYTES = 6 * 1024 * 1024;

const ALLOWED = [
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/aac",
  "audio/wav",
];

function extFor(contentType: string) {
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("mp4") || contentType.includes("aac")) return "m4a";
  if (contentType.includes("mpeg")) return "mp3";
  return "bin";
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RECORDINGS) {
    return json(
      { ok: false, error: "Voice notes are not configured yet. Please type the symptoms." },
      503,
    );
  }

  const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!ALLOWED.some((t) => contentType === t)) {
    return json({ ok: false, error: "Unsupported audio format." }, 415);
  }

  // Content-Length can be spoofed or absent, so treat it as a cheap early
  // rejection and check the real byte count after reading.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) {
    return json({ ok: false, error: "Recording is too long. Keep it under two minutes." }, 413);
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) {
    return json({ ok: false, error: "Empty recording." }, 400);
  }
  if (bytes.byteLength > MAX_BYTES) {
    return json({ ok: false, error: "Recording is too long. Keep it under two minutes." }, 413);
  }

  const id = crypto.randomUUID();
  const key = `${id}.${extFor(contentType)}`;

  await env.RECORDINGS.put(key, bytes, {
    httpMetadata: {
      contentType,
      // Immutable once written; the key is a fresh uuid every time.
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  const url = new URL(request.url);
  return json({
    ok: true,
    key,
    url: `${url.origin}/api/recording/${key}`,
  });
};
