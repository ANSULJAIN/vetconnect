/**
 * GET /api/recording/<key>
 *
 * Streams a stored voice note back so it plays when the veterinarian taps the
 * link in WhatsApp. Range requests are honoured, which is what lets a player
 * scrub rather than re-download the whole clip.
 */

import { json, type Env } from "../_shared";

/** Only ever serve keys this service could have written. */
const KEY_RE = /^[0-9a-f-]{36}\.(webm|ogg|m4a|mp3|bin)$/;

const handler: PagesFunction<Env> = async ({ params, env, request }) => {
  if (!env.RECORDINGS) return json({ ok: false, error: "Not configured." }, 503);

  const key = String(params.key ?? "");
  if (!KEY_RE.test(key)) return json({ ok: false, error: "Not found." }, 404);

  const range = request.headers.get("range") ?? undefined;
  const object = await env.RECORDINGS.get(key, range ? { range: request.headers } : undefined);
  if (!object) return json({ ok: false, error: "Not found." }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  // A voice note about someone's pet should not end up in a search index.
  headers.set("x-robots-tag", "noindex, nofollow");

  if (object.range && "offset" in object.range) {
    const start = object.range.offset ?? 0;
    const length = object.range.length ?? object.size - start;
    headers.set("content-range", `bytes ${start}-${start + length - 1}/${object.size}`);
    return new Response(object.body, { status: 206, headers });
  }

  return new Response(object.body, { headers });
};

export const onRequestGet = handler;
/** Players probe with HEAD before streaming; without this they see a 404. */
export const onRequestHead = handler;
