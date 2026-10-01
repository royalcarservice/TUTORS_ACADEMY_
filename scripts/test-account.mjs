#!/usr/bin/env node
// Phase 5 test-account provisioning (P5-R1 Part 7: TEST ACCOUNTS ONLY).
// Server/CLI only: reads SUPABASE_SERVICE_ROLE_KEY from .env.local and uses the
// Auth Admin API to create a confirmed test user, so the app's real sign-in
// path (login form -> signInWithPassword -> cookie session) can be verified
// without an email inbox. Never imported by the app. Never run against real students.
//
//   node scripts/test-account.mjs create  <email> <password> [display name]      (role student)
//   ROLE=tutor node scripts/test-account.mjs create <email> <password> [name]  (6.1: test tutor)
//   node scripts/test-account.mjs delete  <email>
//   node scripts/test-account.mjs list
//   node scripts/test-account.mjs relate  <tutor-email> <student-email> <subject>   (6.1, P6-R1)
//   node scripts/test-account.mjs end     <tutor-email> <student-email> <subject>
//   node scripts/test-account.mjs relations
// `relate`/`end` are the ONLY write path for public.relationships today (service
// role; no RLS write policy exists). Both addresses must be on the test domain.
// This is a test fixture tool, NOT the creation flow — that flow is undecided (P6-R1).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// DEV-ONLY GUARD (P5-R2): never runs in production, and only ever touches
// addresses on a reserved test domain — it cannot create or delete a real student.
if (process.env.NODE_ENV === "production") { console.error("refusing: NODE_ENV=production"); process.exit(3); }
const TEST_DOMAIN = /@test\.[a-z0-9.-]+\.invalid$/i;
const redact = (e) => e.replace(/^(.).*?(@.*)$/, "$1***$2");

// Secrets come from the ENVIRONMENT; .env.local is read only as a local fallback. Nothing is ever printed.
let fileEnv = {};
try {
  fileEnv = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
} catch { /* no .env.local — env must supply both */ }
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || fileEnv.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (env or .env.local)"); process.exit(2); }
const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const [cmd, email, password, ...nameParts] = process.argv.slice(2);
if (cmd === "create") {
  if (!email || !password) { console.error("usage: create <email> <password> [name]"); process.exit(2); }
  if (!TEST_DOMAIN.test(email)) { console.error("refusing: test accounts must use a *@test.<name>.invalid address"); process.exit(3); }
  const role = process.env.ROLE === "tutor" ? "tutor" : "student"; // admin is never self-serve, not even here
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { role, display_name: nameParts.join(" ") || `Test ${role}`, test_account: true },
  });
  if (error) { console.error("create failed:", error.message); process.exit(1); }
  console.log(`created ${redact(data.user.email)} role=${role} confirmed=${Boolean(data.user.email_confirmed_at)}`);
} else if (cmd === "delete") {
  if (!email || !TEST_DOMAIN.test(email)) { console.error("refusing: only *@test.<name>.invalid addresses can be deleted here"); process.exit(3); }
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  const u = data?.users.find((x) => x.email === email);
  if (!u) { console.log("no such user"); process.exit(0); }
  const { error } = await admin.auth.admin.deleteUser(u.id);
  console.log(error ? `delete failed: ${error.message}` : `deleted ${redact(email)}`);
} else if (cmd === "list") {
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of data?.users ?? []) console.log(`${redact(u.email)}  role=${u.user_metadata?.role ?? "student"}  test=${TEST_DOMAIN.test(u.email)}  confirmed=${Boolean(u.email_confirmed_at)}`);
  console.log(`${data?.users.length ?? 0} user(s)`);
} else if (cmd === "relate" || cmd === "end") {
  const [tutorEmail, studentEmail, subject] = [email, password, nameParts[0]];
  if (!tutorEmail || !studentEmail || !subject) { console.error(`usage: ${cmd} <tutor-email> <student-email> <subject>`); process.exit(2); }
  if (!TEST_DOMAIN.test(tutorEmail) || !TEST_DOMAIN.test(studentEmail)) { console.error("refusing: relationships only between *@test.<name>.invalid accounts"); process.exit(3); }
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  const tutor = data?.users.find((x) => x.email === tutorEmail);
  const student = data?.users.find((x) => x.email === studentEmail);
  if (!tutor || !student) { console.error("no such test user"); process.exit(1); }
  const { data: roles } = await admin.from("profiles").select("id, role").in("id", [tutor.id, student.id]);
  const roleOf = (id) => roles?.find((r) => r.id === id)?.role;
  if (roleOf(tutor.id) !== "tutor" || roleOf(student.id) !== "student") { console.error("refusing: first must be a tutor profile, second a student profile"); process.exit(3); }
  if (cmd === "relate") {
    const { error } = await admin.from("relationships").insert({ tutor_id: tutor.id, student_id: student.id, subject_id: subject });
    console.log(error ? `relate failed: ${error.message}` : `related ${redact(tutorEmail)} ↔ ${redact(studentEmail)} in ${subject}`);
    if (error) process.exit(1);
  } else {
    const { data: rows, error } = await admin.from("relationships")
      .update({ state: "ended", ended_at: new Date().toISOString() })
      .match({ tutor_id: tutor.id, student_id: student.id, subject_id: subject, state: "active" }).select("id");
    console.log(error ? `end failed: ${error.message}` : `ended ${rows?.length ?? 0} relationship(s) (rows retained)`);
    if (error) process.exit(1);
  }
} else if (cmd === "relations") {
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 200 });
  const em = (id) => redact(users?.users.find((u) => u.id === id)?.email ?? "?");
  const { data: rows } = await admin.from("relationships").select("tutor_id, student_id, subject_id, state, started_at, ended_at").order("started_at");
  for (const r of rows ?? []) console.log(`${em(r.tutor_id)} ↔ ${em(r.student_id)}  ${r.subject_id}  ${r.state}`);
  console.log(`${rows?.length ?? 0} relationship row(s)`);
} else { console.error("usage: create|delete|list|relate|end|relations"); process.exit(2); }
