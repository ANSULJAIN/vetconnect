# Payments and backend

The site is a static export served by Cloudflare Pages. The two things a
payment needs that static hosting cannot do — holding a secret key and deciding
the price — live in **Cloudflare Pages Functions**, small Workers deployed from
`functions/` alongside the site.

Nothing here needs a server, and all of it is inside Cloudflare's free tier.

## The flow

```
 browser                    functions/ (Worker)              Razorpay
────────                   ────────────────────             ──────────
 fill form
 submit      ── POST /api/create-order ──▶
                            validate input
                            amount = ₹199 (server-side)
                                        ── create order ──▶
                                        ◀── order_id ──────
             ◀── order_id + KEY_ID ─────
 open Razorpay Checkout ─────────────────────────────────▶
 pay (UPI / card / netbanking)
             ◀───────────── payment_id + signature ───────
             ── POST /api/verify-payment ─▶
                            recompute HMAC
                            compare, mark paid
             ◀── ok ─────────────────────
 show confirmation

 …separately, server-to-server:
                            ◀── POST /api/razorpay-webhook ──
                            verify signature, mark paid
```

### Why each piece exists

| Piece | Why |
|---|---|
| `create-order` | The Razorpay **secret** must never reach the browser, and the **amount** must not come from the client — a price in JS is editable in devtools. |
| `verify-payment` | A browser saying "I paid" proves nothing; anyone can POST that. Razorpay signs `order_id\|payment_id` with your secret, and recomputing that HMAC is the actual proof. |
| `razorpay-webhook` | `verify-payment` needs the customer's tab to still be open. If they pay and close it, or their phone dies mid-UPI, the callback never fires but the money moved. The webhook is the reliable record. |

## Files

```
functions/api/
├── _shared.ts            env types, HMAC, timing-safe compare, validation
├── create-order.ts       POST /api/create-order
├── verify-payment.ts     POST /api/verify-payment
└── razorpay-webhook.ts   POST /api/razorpay-webhook

schema.sql                D1 table for bookings
```

`functions/` has its own `tsconfig.json` because it compiles against Workers
types, not DOM types. The root `tsconfig.json` excludes it.

## Setup

### 1. Razorpay account

Sign up at razorpay.com and complete KYC — PAN, bank account and business
registration. **Start this early; it takes days, not minutes.** Until KYC
clears you can only use test-mode keys (`rzp_test_…`).

Razorpay's KYC also checks that the site has a privacy policy, terms, refund
policy and contact page. Those exist at `/privacy`, `/terms`, `/refund` and
`/contact`.

### 2. Set the secrets in Cloudflare

Pages project → **Settings → Environment variables**:

| Name | Value | Type |
|---|---|---|
| `RAZORPAY_KEY_ID` | `rzp_live_…` | Plain text (it is public) |
| `RAZORPAY_KEY_SECRET` | from the dashboard | **Encrypted** |
| `RAZORPAY_WEBHOOK_SECRET` | you choose it | **Encrypted** |

Never put these in `next.config.ts`, in `NEXT_PUBLIC_*`, or in any file under
`src/` — anything the frontend imports ends up in the JS bundle.

### 3. Database (optional but recommended)

Without it, payments still work; bookings just aren't stored anywhere except
the Razorpay dashboard.

```bash
npx wrangler d1 create vetconnect
npx wrangler d1 execute vetconnect --remote --file=./schema.sql
```

Then bind it: Pages → **Settings → Functions → D1 database bindings** →
variable name `DB`, database `vetconnect`.

### 4. Webhook

Razorpay dashboard → **Settings → Webhooks → Add**:

- URL `https://vetconnect.co.in/api/razorpay-webhook`
- Events `payment.captured`, `payment.failed`
- Secret — the same string you set as `RAZORPAY_WEBHOOK_SECRET`

## Local development

Static preview only (no API):

```bash
npm run build && npx serve out
```

With the Functions running:

```bash
npm run build
npx wrangler pages dev out
```

Put test keys in `.dev.vars` at the repo root — it is gitignored:

```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
```

Razorpay's test mode accepts card `4111 1111 1111 1111`, any future expiry, any CVV.

## Changing the price

Two places, and they must agree:

- `src/data/site.ts` → `SITE.consultPrice` (what the customer sees)
- `functions/api/_shared.ts` → `CONSULT_AMOUNT_PAISE` (what is actually charged)

The server value is the one that counts. It is deliberately not imported from
the frontend, so a bundler mistake can never let the client set a price.

## Cost

| | |
|---|---|
| Pages hosting | ₹0 — unlimited bandwidth |
| Functions | ₹0 — 100,000 requests/day free |
| D1 | ₹0 — 5 GB, 5M row reads/day free |
| Razorpay setup / AMC | ₹0 |
| Razorpay per transaction | 2% + 18% GST ≈ **₹4.70 on ₹199** |

New merchants activating after 1 July 2026 get zero platform fee for 90 days or
₹5 lakh GMV, whichever comes first.
