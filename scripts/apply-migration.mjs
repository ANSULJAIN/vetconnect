#!/usr/bin/env node
/**
 * Creates the VetConnect database (tables, security rules, storage) in Supabase
 * by running supabase/migrations/0001_init.sql through the Supabase Management API.
 *
 * Needs a Supabase personal access token (sbp_…) from
 * https://supabase.com/dashboard/account/tokens — passed as an environment
 * variable so it never lands in a file:
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-migration.mjs
 *
 * Optional: SUPABASE_PROJECT_REF (defaults to the VetConnect project).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "jruqwgijltlljjzrtctl";
const file = process.argv[2] ?? "supabase/migrations/0001_init.sql";

if (!token?.startsWith("sbp_")) {
  console.error("Set SUPABASE_ACCESS_TOKEN to a personal access token (starts with sbp_).");
  console.error("Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.resolve(here, "..", file), "utf8");

console.log(`Running ${file} on project ${ref}…`);
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`Failed (HTTP ${res.status}):`);
  console.error(text.slice(0, 2000));
  process.exit(1);
}

// Confirm what now exists.
const check = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({
    query:
      "select table_name from information_schema.tables where table_schema = 'public' order by 1;",
  }),
});
const tables = (await check.json()).map((r) => r.table_name);
console.log("✅ Done. Tables in the database:", tables.join(", "));
