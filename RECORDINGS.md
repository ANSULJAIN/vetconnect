# Voice notes

A booking can carry a short audio recording of the symptoms. The owner records
it in the browser, it is stored in Cloudflare R2, and the WhatsApp message
carries a link the veterinarian taps to listen before calling back.

For animals this matters more than it sounds: a vet can usually tell more from
hearing a cough or laboured breathing than from a written description of one.

## Flow

```
 browser                      Worker                        R2

 tap "Record a voice note"
 MediaRecorder captures audio
 tap "Stop recording"
        │
        ├── POST /api/upload-recording ──▶
        │   content-type: audio/webm       validate type + size
        │   body: the blob                 key = <uuid>.<ext>
        │                                            ├── put ──▶
        ◀── { url } ──────────────────────
        │
 user presses "Book on WhatsApp"
 message includes:  *Voice note:* https://vetconnect.co.in/api/recording/<key>

 …later, the vet taps that link
                     GET /api/recording/<key> ──▶
                                                   ◀── stream ──
```

**Upload happens when recording stops, not on submit.** The booking handler has
to call `window.open` synchronously or the popup blocker kills it, so it cannot
await an upload first. By the time the user presses Book, the URL is in hand.

## Files

```
functions/api/upload-recording.ts   POST  — validates and stores
functions/api/recording/[key].ts    GET/HEAD — streams back, supports Range
src/components/booking/VoiceRecorder.tsx   the UI
```

## Setup

### 1. Create the bucket

```bash
npx wrangler r2 bucket create vetconnect-recordings
```

### 2. Bind it to Pages

Pages project → **Settings → Bindings → R2 bucket**

| Variable name | Bucket |
|---|---|
| `RECORDINGS` | `vetconnect-recordings` |

Add it for **Production** and **Preview**.

Until this exists the upload endpoint returns 503 and the record button hides
itself — the form still works, people just type instead.

### 3. Set a retention rule

R2 → your bucket → **Settings → Object lifecycle rules** → delete after **90 days**.

Do this. See the privacy note below.

## Local development

```bash
npm run build
npx wrangler pages dev out --r2 RECORDINGS
```

`--r2` gives you a local bucket on disk; nothing is uploaded to Cloudflare.

## Limits and cost

| | |
|---|---|
| Max length | 120 seconds, enforced in the UI |
| Max upload | 6 MB, enforced server-side |
| Formats | webm/opus (Chrome, Edge, Firefox), mp4/aac (Safari) |
| R2 free tier | 10 GB, 1M writes/month, **no egress fees** |

A 2-minute Opus clip is roughly 350 KB, so 10 GB is about **28,000 recordings**.
At a few hundred bookings a month this stays free indefinitely — and with a
90-day lifecycle rule, storage never grows without bound.

## ⚠️ Privacy

**A voice recording of a person is personal data under the DPDP Act.** Three
things follow:

1. **Retention.** Set the 90-day lifecycle rule above. Keeping recordings
   forever is hard to justify and impossible to defend.
2. **Access.** The URL is an unguessable UUID, which is how WhatsApp's own media
   links work — but *obscurity is not access control*. Anyone with the link can
   listen. Do not forward them outside the treating veterinarian.
3. **Disclosure.** `/privacy` must say that voice notes are collected, where
   they are stored, how long they are kept, and how to request deletion.

`x-robots-tag: noindex, nofollow` is set on playback so recordings cannot end up
in a search index, and the key format is validated on every request so the route
cannot be used to probe the bucket.
