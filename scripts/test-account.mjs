#!/usr/bin/env node
// Phase 5 test-account provisioning (P5-R1 Part 7: TEST ACCOUNTS ONLY).
// Server/CLI only: reads SUPABASE_SERVICE_ROLE_KEY from .env.local and uses the
// Auth Admin API to create a confirmed test user, so the app's real sign-in
// path (login form -> signInWithPassword -> cookie session) can be verified
// without an email inbox. Never imported by the app. Never run against real students.
//
//   node scripts/test-account.mjs create  <email> <password> [display name]
//   node scripts/test-account.mjs delete  <email>
//   node scripts/test-account.mjs list
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local"); process.exit(2); }
const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const [cmd, email, password, ...nameParts] = process.argv.slice(2);
if (cmd === "create") {
  if (!email || !password) { console.error("usage: create <email> <password> [name]"); process.exit(2); }
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { role: "student", display_name: nameParts.join(" ") || "Test student", test_account: true },
  });
  if (error) { console.error("create failed:", error.message); process.exit(1); }
  console.log(`created ${data.user.email} id=${data.user.id} confirmed=${Boolean(data.user.email_confirmed_at)}`);
} else if (cmd === "delete") {
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  const u = data?.users.find((x) => x.email === email);
  if (!u) { console.log("no such user"); process.exit(0); }
  const { error } = await admin.auth.admin.deleteUser(u.id);
  console.log(error ? `delete failed: ${error.message}` : `deleted ${email}`);
} else if (cmd === "list") {
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of data?.users ?? []) console.log(`${u.email}  id=${u.id}  confirmed=${Boolean(u.email_confirmed_at)}`);
  console.log(`${data?.users.length ?? 0} user(s)`);
} else { console.error("usage: create|delete|list"); process.exit(2); }
