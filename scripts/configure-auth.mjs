#!/usr/bin/env node
/**
 * Sets up Supabase sign-in for VetConnect:
 *   1. allowed return addresses (live site, preview, local)          — always
 *   2. send login emails from your Zoho mailbox (custom SMTP)        — when Zoho details are given
 *   3. login email shows a 6-digit code                              — needs step 2 on the free plan
 *
 * Run (all on one line):
 *   SUPABASE_ACCESS_TOKEN=sbp_... ZOHO_EMAIL=care@vetconnect.co.in ZOHO_APP_PASSWORD=xxxx node scripts/configure-auth.mjs
 *
 * ZOHO_APP_PASSWORD is a Zoho *app-specific* password (Zoho Mail -> My Account ->
 * Security -> App Passwords), not your normal login password.
 * Optional: ZOHO_SMTP_HOST (default smtp.zoho.in; use smtp.zoho.com for non-India accounts).
 */

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "jruqwgijltlljjzrtctl";
const zohoEmail = process.env.ZOHO_EMAIL?.trim();
const zohoPass = process.env.ZOHO_APP_PASSWORD?.trim();
const zohoHost = process.env.ZOHO_SMTP_HOST?.trim() || "smtp.zoho.in";

if (!token?.startsWith("sbp_")) {
  console.error("Set SUPABASE_ACCESS_TOKEN to a personal access token (starts with sbp_).");
  process.exit(1);
}

async function patch(label, body) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ ${label} failed (HTTP ${res.status}): ${text.slice(0, 600)}`);
    return false;
  }
  console.log(`✅ ${label}`);
  return true;
}

// 1. Return addresses — works on every plan.
await patch("Allowed sign-in return addresses", {
  site_url: "https://vetconnect.co.in",
  uri_allow_list: [
    "https://vetconnect.co.in/**",
    "https://www.vetconnect.co.in/**",
    "https://*.vetconnect-5e9.pages.dev/**",
    "http://localhost:3000/**",
    "http://localhost:8788/**",
  ].join(","),
});

// 2. Zoho as the email sender.
if (!zohoEmail || !zohoPass) {
  console.log("ℹ️  Skipped Zoho email: set ZOHO_EMAIL and ZOHO_APP_PASSWORD to connect it.");
  console.log("   Until then, login emails contain a sign-in link instead of a code (still works).");
  process.exit(0);
}

const smtpOk = await patch(`Login emails now sent from ${zohoEmail} via ${zohoHost}`, {
  smtp_admin_email: zohoEmail,
  smtp_sender_name: "VetConnect",
  smtp_host: zohoHost,
  smtp_port: "465",
  smtp_user: zohoEmail,
  smtp_pass: zohoPass,
  smtp_max_frequency: 30,
  rate_limit_email_sent: 60,
});
if (!smtpOk) process.exit(1);

// 3. Code email.
const email = (heading) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#14201c">
  <h2 style="color:#12482e;margin:0 0 12px">${heading}</h2>
  <p style="margin:0 0 8px">Your VetConnect sign-in code is:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:8px 0 16px">{{ .Token }}</p>
  <p style="margin:0 0 16px;color:#5c6b60">Enter it on the sign-in screen. It expires in 1 hour.</p>
  <p style="margin:0;color:#5c6b60;font-size:13px">Or <a href="{{ .ConfirmationURL }}">tap here to sign in</a>.
  If you didn't ask for this, ignore this email.</p>
</div>`;

await patch("Login email shows a 6-digit code", {
  mailer_subjects_magic_link: "Your VetConnect sign-in code",
  mailer_templates_magic_link_content: email("Sign in to VetConnect"),
  mailer_subjects_confirmation: "Your VetConnect sign-in code",
  mailer_templates_confirmation_content: email("Welcome to VetConnect"),
});
