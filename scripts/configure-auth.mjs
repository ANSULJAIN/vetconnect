#!/usr/bin/env node
/**
 * Sets up Supabase sign-in for VetConnect:
 *   - the login email shows a 6-digit code (and a sign-in link as backup)
 *   - allowed return addresses: the live site and local testing
 *
 * Run once with a personal access token (sbp_…):
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/configure-auth.mjs
 *
 * Later, to send from your Zoho address, add the SMTP fields below
 * (see BACKEND.md) and run it again.
 */

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "jruqwgijltlljjzrtctl";

if (!token?.startsWith("sbp_")) {
  console.error("Set SUPABASE_ACCESS_TOKEN to a personal access token (starts with sbp_).");
  process.exit(1);
}

const email = (heading) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#14201c">
  <h2 style="color:#12482e;margin:0 0 12px">${heading}</h2>
  <p style="margin:0 0 8px">Your VetConnect sign-in code is:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:8px 0 16px">{{ .Token }}</p>
  <p style="margin:0 0 16px;color:#5c6b60">Enter it on the sign-in screen. It expires in 1 hour.</p>
  <p style="margin:0;color:#5c6b60;font-size:13px">Or <a href="{{ .ConfirmationURL }}">tap here to sign in</a>.
  If you didn't ask for this, ignore this email.</p>
</div>`;

const config = {
  site_url: "https://vetconnect.co.in",
  uri_allow_list: [
    "https://vetconnect.co.in/**",
    "https://www.vetconnect.co.in/**",
    "https://*.vetconnect-5e9.pages.dev/**",
    "http://localhost:3000/**",
    "http://localhost:8788/**",
  ].join(","),
  mailer_subjects_magic_link: "Your VetConnect sign-in code",
  mailer_templates_magic_link_content: email("Sign in to VetConnect"),
  mailer_subjects_confirmation: "Your VetConnect sign-in code",
  mailer_templates_confirmation_content: email("Welcome to VetConnect"),
};

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: "PATCH",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(config),
});

if (!res.ok) {
  console.error(`Failed (HTTP ${res.status}):`, (await res.text()).slice(0, 1500));
  process.exit(1);
}
const saved = await res.json();
console.log("✅ Sign-in configured.");
console.log("   Site URL:", saved.site_url);
console.log("   Allowed return URLs:", saved.uri_allow_list);
console.log("   Login email now shows a 6-digit code.");
