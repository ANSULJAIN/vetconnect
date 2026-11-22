# Accounts, paid chat, doctors and AI intake

How the signed-in side of vetconnect.co.in works, and how to set it up.

## The flow

```
visitor (anonymous visitor id in localStorage)
  └─ /consult: fills the booking form ─ "Continue — ₹199"
       ├─ 1. AI intake      POST /api/intake        (off for now: SITE.aiIntake in src/data/site.ts)
       ├─ 2. Sign in        Supabase email OTP      6-digit code, creates the account
       ├─ 3. Pay            POST /api/create-order  consultation row (awaiting_payment) + Razorpay order
       │                    Razorpay Checkout       UPI / card / netbanking
       │                    POST /api/verify-payment   ─┐ either one marks it PAID,
       │                    POST /api/razorpay-webhook ─┘ opens the chat, auto-assigns a vet
       └─ 4. /chat/?c=<id>  realtime chat with the assigned vet, photos/PDFs, 72h follow-up window

vet:   /doctor/  register (pending) → admin approves → dashboard: online switch, queue, chats
admin: /admin/   approve vets, assign/reassign cases, funnel numbers
```

The WhatsApp booking stays as a fallback ("Prefer WhatsApp?"), and is the only
path when Supabase is not configured.

## Where things live

| | |
|---|---|
| Database, auth, realtime chat, file storage | **Supabase** — schema and security rules in `supabase/migrations/0001_init.sql` |
| Payment + AI functions | `functions/api/*.ts` (Cloudflare Pages Functions) |
| Pages | `src/app/{login,account,chat,doctor,admin}` |
| Client libraries | `src/lib/supabase.ts`, `useAuth.ts`, `track.ts` |

### IDs

| ID | Created | Used for |
|---|---|---|
| `visitor_id` | first visit (localStorage `vc_vid`) | anonymous funnel events, copied onto the consultation |
| `auth.users.id` = `profiles.id` | first sign-in | the customer / vet / admin |
| `consultations.id` + `code` (`VC-AB12`) | `/api/create-order` | the chat room; `code` is quoted to humans and is the Razorpay receipt |
| `razorpay_order_id` | `/api/create-order` | links the payment to the consultation |

### Security model

- The browser uses the public anon key. Every table has row-level security.
- Customers can read only their own consultations and messages; a vet only the
  ones assigned to them (plus the unassigned paid queue once verified).
- **Nobody can post in a chat until it is paid**: the `messages` insert policy
  checks the consultation status and the 72-hour window.
- Prices, payment status, doctor verification and assignment are never written
  by the browser — only by the functions (service-role key) or by
  `SECURITY DEFINER` RPCs that check the caller.
- Users cannot change their own `role`; column grants allow only name/phone.

### Doctor matching

Rule-based, in `functions/api/_supabase.ts → autoAssign`: online + verified
vets, scored by species match (2) and language match (1), ties broken by
fewest active chats. Nobody online → the case waits in the queue and any
verified vet can take it; an admin can assign by hand.

The AI does **intake, not matching**: it asks what a vet would ask, writes a
summary for the doctor and flags emergencies. It never diagnoses or suggests
medicine (see the system prompt in `functions/api/intake.ts`).

## Setup

### 1. Supabase

1. Create a project (free tier), region Mumbai (`ap-south-1`).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. **Authentication → Providers → Email**: enabled. **Email templates → Magic
   link**: make sure the body includes `{{ .Token }}` so the email shows the
   6-digit code.
4. **Authentication → URL configuration**: Site URL `https://vetconnect.co.in`,
   redirect URLs `https://vetconnect.co.in/**`.
5. The built-in email sender allows only a few emails an hour. Before launch,
   add custom SMTP (Resend, Brevo, Amazon SES…) under **Authentication → SMTP**.
6. Make yourself admin, after signing in once on the site:
   `update profiles set role = 'admin' where email = 'you@example.com';`

### 2. Cloudflare Pages → vetconnect → Settings → Variables and secrets

| Name | Value | Type |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Plain text (build) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable (or anon) key | Plain text (build) |
| `SUPABASE_URL` | same URL | Plain text |
| `SUPABASE_SECRET_KEY` | secret key (`sb_secret_…`) | **Secret** |
| `RAZORPAY_KEY_ID` | `rzp_test_…` or `rzp_live_…` | Plain text |
| `RAZORPAY_KEY_SECRET` | from Razorpay | **Secret** |
| `RAZORPAY_WEBHOOK_SECRET` | you choose it | **Secret** |
| `ANTHROPIC_API_KEY` | from console.anthropic.com (only when `SITE.aiIntake` is turned on) | **Secret** |

`NEXT_PUBLIC_*` are baked in at build time, so redeploy after changing them.

### 3. Razorpay

Webhook: `https://vetconnect.co.in/api/razorpay-webhook`, events
`payment.captured` and `payment.failed`, secret = `RAZORPAY_WEBHOOK_SECRET`.

## Not done yet

- **Notifications outside the browser.** Vets and customers get alerts only
  while a tab is open. Next: email or WhatsApp notifications on new messages.
- **Phone OTP.** Needs an SMS provider and DLT registration. Swap the two calls
  in `src/components/auth/LoginForm.tsx`.
- **Voice notes** (R2) are built but hidden — see RECORDINGS.md.
