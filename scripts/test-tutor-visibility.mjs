#!/usr/bin/env node
// Phase 6.1 — P6-R2 visibility default, verified THROUGH THE REAL PATH:
// a signed-in test tutor's JWT, the anon key, PostgREST, Supabase RLS.
// (supabase/tests/rls_test.sql proves the same policies in SQL with a fixture;
// this proves them against the project with the live test accounts.)
//
//   node scripts/test-tutor-visibility.mjs            → prints assertions, writes audit/tutor-visibility.json
//
// Needs: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (env or .env.local),
// TEST_PASSWORD (env; defaults to the Phase-5 test password). Test accounts only.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (process.env.NODE_ENV === "production") { console.error("refusing: NODE_ENV=production"); process.exit(3); }
let fileEnv = {};
try {
  fileEnv = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
} catch { /* env must supply */ }
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) { console.error("missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"); process.exit(2); }
const PASSWORD = process.env.TEST_PASSWORD || "Test-Pass-2026!";
const DOMAIN = "@test.tutorsacademy.invalid";
const TUTOR = `tutor-a${DOMAIN}`;          // related to student-c in physics (one row, service-role written)
const RELATED = `student-c${DOMAIN}`;
const UNRELATED = `student-b${DOMAIN}`;    // also enrolled in physics (shared subject, no relationship)

const results = [];
const ok = (cond, label, detail) => { results.push({ ok: !!cond, label, detail }); console.log(`${cond ? "ok  " : "FAIL"} — ${label}${detail ? `  (${detail})` : ""}`); };

async function signIn(email) {
  const c = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign-in failed for ${email.replace(/^(.).*?(@.*)$/, "$1***$2")}: ${error.message}`);
  return { c, id: data.user.id };
}

// ── as the related student: what exists (ground truth for the tutor's view) ──
const s = await signIn(RELATED);
const { data: sEnr } = await s.c.from("enrolments").select("subject_id, status");
const { data: sEnv } = await s.c.from("environment_state").select("subject_id");
const { data: sRel } = await s.c.from("relationships").select("tutor_id, subject_id, state");
const studentSubjects = (sEnr ?? []).map((r) => r.subject_id).sort();
ok(studentSubjects.includes("physics"), "ground truth: related student is enrolled in physics", `subjects=${studentSubjects.join(",")}`);
ok((sRel ?? []).length === 1 && sRel[0].subject_id === "physics" && sRel[0].state === "active", "student can see who is related to her (one active, physics)");

// ── as the unrelated student in the same subject ──
const u = await signIn(UNRELATED);
const { data: uEnr } = await u.c.from("enrolments").select("subject_id");
ok((uEnr ?? []).some((r) => r.subject_id === "physics"), "ground truth: unrelated student shares physics");
const { data: uRel } = await u.c.from("relationships").select("id");
ok((uRel ?? []).length === 0, "unrelated student sees no relationship (none exists for her)");

// ── as the tutor ──
const t = await signIn(TUTOR);
const { data: rel } = await t.c.from("relationships").select("student_id, subject_id, state");
ok((rel ?? []).length === 1 && rel[0].student_id === s.id && rel[0].subject_id === "physics", "tutor sees exactly the one relationship (student-c · physics · active)");

const { data: tEnr } = await t.c.from("enrolments").select("student_id, subject_id");
ok((tEnr ?? []).length === 1 && tEnr[0].student_id === s.id && tEnr[0].subject_id === "physics", "P6-R2 tutor sees the related student's PHYSICS enrolment and nothing else", `rows=${(tEnr ?? []).length}`);
ok(!(tEnr ?? []).some((r) => r.subject_id !== "physics"), "BREAK other-subject: none of the student's other subjects are visible", `student has ${studentSubjects.length} enrolment(s)`);
ok(!(tEnr ?? []).some((r) => r.student_id === u.id), "BREAK shared-subject: the other physics student is invisible");

const { data: tEnv } = await t.c.from("environment_state").select("student_id, subject_id, first_entered_at, last_entered_at, position");
const studentHasPhysicsState = (sEnv ?? []).some((r) => r.subject_id === "physics");
ok((tEnv ?? []).every((r) => r.student_id === s.id && r.subject_id === "physics") && (tEnv ?? []).length === (studentHasPhysicsState ? 1 : 0),
  "tutor's environment_state rows = the student's own PHYSICS row, no more, no less", `tutor rows=${(tEnv ?? []).length}, student physics state=${studentHasPhysicsState}`);

const { data: tProf } = await t.c.from("profiles").select("id, display_name, role");
const others = (tProf ?? []).filter((p) => p.id !== t.id);
ok(others.length === 1 && others[0].id === s.id, "tutor reads exactly one other profile: the related student's display name", `display_name="${others[0]?.display_name ?? ""}"`);
ok(!(tProf ?? []).some((p) => p.id === u.id), "BREAK non-related: the unrelated student's profile is invisible");

// no write path for a tutor
const ins = await t.c.from("relationships").insert({ tutor_id: t.id, student_id: u.id, subject_id: "physics" });
ok(!!ins.error, "tutor cannot create a relationship", ins.error?.message);
const upd = await t.c.from("relationships").update({ state: "ended", ended_at: new Date().toISOString() }).eq("tutor_id", t.id).select("id");
ok(!!upd.error || (upd.data ?? []).length === 0, "tutor cannot end a relationship", upd.error?.message ?? "0 rows");
const envUpd = await t.c.from("environment_state").update({ entry_count: 99 }).eq("student_id", s.id).select("student_id");
ok(!!envUpd.error || (envUpd.data ?? []).length === 0, "tutor cannot write the related student's environment_state", envUpd.error?.message ?? "0 rows");
const profUpd = await t.c.from("profiles").update({ display_name: "x" }).eq("id", s.id).select("id");
ok(!!profUpd.error || (profUpd.data ?? []).length === 0, "tutor cannot write the related student's profile", profUpd.error?.message ?? "0 rows");

// no aggregate escapes: a count over tables the tutor cannot see rows of returns 0 / own-only
const { count: cEnr } = await t.c.from("enrolments").select("*", { count: "exact", head: true });
ok(cEnr === 1, "count() over enrolments is the policy's row count, not the table's", `count=${cEnr}`);

// anon: nothing
const a = createClient(url, anon, { auth: { persistSession: false } });
const anonRel = await a.from("relationships").select("id");
ok(!!anonRel.error || (anonRel.data ?? []).length === 0, "anon reads nothing from relationships", anonRel.error?.message ?? "0 rows");

const passed = results.filter((r) => r.ok).length;
mkdirSync(new URL("../audit/", import.meta.url), { recursive: true });
writeFileSync(new URL("../audit/tutor-visibility.json", import.meta.url),
  JSON.stringify({ ranAt: new Date().toISOString(), path: "anon key + test-account JWT → PostgREST → RLS", passed, total: results.length, results }, null, 2) + "\n");
console.log(`tutor visibility: ${passed}/${results.length} passed → audit/tutor-visibility.json`);
process.exit(passed === results.length ? 0 : 1);
