#!/usr/bin/env node
/**
 * Gives a signed-up account admin rights (the /admin page).
 * The person must have signed in on the site once first.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/make-admin.mjs you@example.com
 */

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "jruqwgijltlljjzrtctl";
const email = (process.argv[2] ?? "").trim().toLowerCase();

if (!token?.startsWith("sbp_") || !/^[^\s@']+@[^\s@']+$/.test(email)) {
  console.error("Usage: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/make-admin.mjs you@example.com");
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({
    query: `update public.profiles set role = 'admin' where lower(email) = '${email}' returning email, role;`,
  }),
});
const out = await res.json().catch(() => null);
if (!res.ok) {
  console.error(`Failed (HTTP ${res.status}):`, JSON.stringify(out).slice(0, 800));
  process.exit(1);
}
if (!out?.length) {
  console.error(`No account found for ${email}. Sign in on the site once, then run this again.`);
  process.exit(1);
}
console.log(`✅ ${out[0].email} is now an admin. Refresh the site and open /admin/.`);
