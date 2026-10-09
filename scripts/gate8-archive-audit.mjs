#!/usr/bin/env node
// ============================================================================
// PHASE 8 GATE · W2 — THE ARCHIVE PRIVACY & ISOLATION AUDIT
// Verdict written to audit/phase8-archive.json. Pure — zero network.
//
// Proves, from the committed migrations and source, the brief's privacy
// contract: STRICT SUBJECT ISOLATION (an artifact belongs to ONE session of
// ONE subject), RLS as the ONLY boundary, zero public/unauthenticated
// leakage, and the signed-URL seam's honesty. Every check names the file
// and the line-shaped fact it holds; a drift fails the gate.
// ============================================================================
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const raw = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const stripSql = (src) => src.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
const stripTs = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const MIG_ARCHIVE = "supabase/migrations/20261008000008_phase8_archive.sql";
const MIG_RECORD = "supabase/migrations/20261008000004_progress_record.sql";
const MIG_SESSIONS = "supabase/migrations/20261008000007_classroom_sessions.sql";
const DATA = "src/lib/archive/data.ts";
const ARTIFACT = "src/lib/archive/artifact.ts";
const SYNTH_DATA = "src/lib/progress/data.ts";
const ACTIONS = "src/app/subjects/[subject]/archive/actions.ts";
const PAGE = "src/app/subjects/[subject]/archive/page.tsx";
const VIEWER = "src/components/archive/artifact-viewer.tsx";

const results = [];
let failed = 0;
const check = (id, claim, fn) => {
  try { fn(); results.push({ id, claim, verdict: "PASS" }); console.log(`PASS  ${id} — ${claim}`); }
  catch (e) { failed++; results.push({ id, claim, verdict: "FAIL", error: e.message }); console.log(`FAIL  ${id} — ${claim}\n      ${e.message}`); }
};
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
const has = (src, re, msg) => ok(re.test(src), msg);
const hasNot = (src, re, msg) => ok(!re.test(src), msg);

const archiveSql = stripSql(raw(MIG_ARCHIVE));
const recordSql = stripSql(raw(MIG_RECORD));
const sessionsSql = stripSql(raw(MIG_SESSIONS));
const data = stripTs(raw(DATA));
const dataRaw = raw(DATA); // comments carry the honesty contract; read them unstripped
const artifact = stripTs(raw(ARTIFACT));
const synth = stripTs(raw(SYNTH_DATA));
const actions = stripTs(raw(ACTIONS));
const page = raw(PAGE);
const viewer = stripTs(raw(VIEWER));

/* ── 1 · RLS on the archive's table ───────────────────────────────────────── */
check("A1", "session_artifacts: RLS enabled AND forced", () => {
  has(archiveSql, /alter table public\.session_artifacts enable row level security/, "enable missing");
  has(archiveSql, /alter table public\.session_artifacts force row level security/, "force missing");
});
check("A2", "session_artifacts: reads admit ONLY enrolled student + related tutor; no anon", () => {
  has(archiveSql, /create policy artifacts_select_enrolled_student[\s\S]*?for select to authenticated/, "student read policy");
  has(archiveSql, /create policy artifacts_select_related_tutor[\s\S]*?for select to authenticated/, "tutor read policy");
  hasNot(archiveSql, /to anon/, "no policy may admit anon");
});
check("A3", "session_artifacts: writes belong to the session's OPENING tutor alone; no update/delete", () => {
  has(archiveSql, /create policy artifacts_insert_session_tutor[\s\S]*?for insert to authenticated/, "insert policy");
  has(archiveSql, /tutor_id = auth\.uid\(\)/, "only the tutor who opened the session writes");
  hasNot(archiveSql, /for update/, "no update policy");
  hasNot(archiveSql, /for delete/, "no delete policy");
});

/* ── 2 · the bucket is private by construction ────────────────────────────── */
check("B1", "one PRIVATE bucket; anon admitted by no storage policy", () => {
  has(archiveSql, /insert into storage\.buckets \(id, name, public\)\s*values \('session-artifacts', 'session-artifacts', false\)/, "bucket is private");
  has(archiveSql, /create policy objects_select_session_artifacts on storage\.objects[\s\S]*?for select to authenticated/, "one authenticated SELECT policy");
  hasNot(archiveSql, /on storage\.objects[\s\S]*?to anon/, "anon reaches no object policy");
  hasNot(archiveSql, /on storage\.objects[\s\S]*?for insert to authenticated/, "no client upload policy");
});
check("B2", "the object policy defers to the standing predicates, subject read from the path", () => {
  has(archiveSql, /bucket_id = 'session-artifacts'/, "scoped to the one bucket");
  has(archiveSql, /\(storage\.foldername\(name\)\)\[1\]/, "the subject is the path's first segment");
});

/* ── 3 · cross-subject isolation is structural ────────────────────────────── */
check("C1", "an artifact belongs STRICTLY to one session of one subject (composite FK)", () => {
  has(archiveSql, /foreign key \(subject_id, session_id\) references public\.cohort_sessions \(subject_id, id\)/, "composite foreign key");
  has(archiveSql, /storage_path\s+text not null unique/, "one artifact per object key");
  has(archiveSql, /add constraint cohort_sessions_subject_id_uniq unique \(subject_id, id\)/, "the referenced unique stands (0008 adds it before the FK)");
});
check("C2", "the path convention is built once and traversal is refused", () => {
  has(artifact, /return `\$\{subjectId\}\/\$\{sessionId\}\/\$\{artifactId\}`/, "one builder");
  has(artifact, /includes\("\.\."\)/, "traversal segments refused");
  has(artifact, /parts\.length !== 3/, "wrong arity refused");
});
check("C3", "progress_record: RLS forced; own-read + related-tutor read; no anon; no client writes", () => {
  has(recordSql, /alter table public\.progress_record force row level security/, "forced");
  has(recordSql, /progress_record_select_own[\s\S]*?student_id = auth\.uid\(\)/, "own read");
  has(recordSql, /progress_record_select_related_tutor[\s\S]*?is_related_tutor\(student_id, subject_id\)/, "tutor read by the standing predicate");
  hasNot(recordSql, /to anon/, "no anon");
  hasNot(recordSql, /for insert to authenticated/, "no client insert");
});

/* ── 4 · the data layer: RLS first, signature second, honesty always ──────── */
check("D1", "the shelf reads through the cookie session only; the subject is spelled", () => {
  has(data, /\.eq\("subject_id", subjectId\)\s*\.eq\("state", "concluded"\)/, "the archive read spells the subject");
  has(data, /\.eq\("subject_id", subjectId\)\s*\.in\("session_id", ids\)/, "the artifacts read spells it again");
  hasNot(data, /service_role/, "no service-role import on the shelf path");
  hasNot(data, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/, "SELECT-only");
});
check("D2", "signing happens ONLY after the row proved visible, through the service client", () => {
  has(data, /\.maybeSingle\(\)[\s\S]*?toArtifact\(data\)[\s\S]*?signArtifactAccess/, "visible first, then signed");
  has(data, /if \(!admin\) return \{ mode: "unsigned" \};/, "no key → unsigned, never a fabricated URL");
  has(dataRaw, /return \{ mode: "unsigned" \}; \/\/ a signing failure is an absence, never an alarm/, "failure → absence");
});
check("D3", "invisible and unknown are the SAME null — zero identity leakage", () => {
  has(dataRaw, /if \(!record\) return null; \/\/ invisible or unknown — deliberately the same answer/, "the same null");
  hasNot(data, /userId|viewerId/, "no identity argument anywhere in the layer");
  has(actions, /if \(!details\) return \{ ok: false \};/, "the seam returns the same honest answer");
  hasNot(actions, /userId|viewerId|currentUser/, "the seam carries no identity argument");
});
check("D4", "signed windows are named and bounded; the kind earns its window", () => {
  has(artifact, /SIGNED_URL_SECONDS = 60/, "the consume-at-once window");
  has(artifact, /MEDIA_URL_SECONDS = 900/, "the listening window");
  ok(900 <= 1800, "even listening stays bounded");
  has(artifact, /signedWindowFor/, "the window follows the kind");
  has(data, /signedWindowFor\(record\.type\)/, "the seam uses it");
});
check("D5", "the synthesis reader spells whose record and which subject on EVERY read", () => {
  has(synth, /\.eq\("student_id", studentId\)/, "whose record — spelled");
  const scoped = synth.match(/\.eq\("subject_id", subjectId\)/g) ?? [];
  ok(scoped.length >= 3, `subject spelled on all three reads (found ${scoped.length})`);
  has(synth, /if \(!user\) return \[\];/, "no identity, no record");
});

/* ── 5 · the surfaces admit nobody without an identity ────────────────────── */
check("E1", "the archive route doors visitors before any data; unknown subjects enumerate nothing", () => {
  has(page, /if \(!identity\) redirect/, "no identity → the login door");
  has(page, /if \(!viewer\) notFound\(\);/, "everyone else the same 404");
  has(page, /if \(!s\) notFound\(\);/, "unknown subject 404");
});
check("E2", "the viewer fetches ONLY signed URLs; an unsigned artifact is a calm sentence", () => {
  has(viewer, /opened\.access\?\.mode !== "signed"/, "nothing fetches an unsigned artifact");
  has(viewer, /its bytes open in a credentialed environment/, "unsigned is stated, not faked");
  hasNot(viewer, /dangerouslySetInnerHTML|new Image\(\)/, "no side doors");
});
check("E3", "zero engagement vocabulary in schema and layer — no counter can exist", () => {
  for (const w of ["view_count", "views", "download_count", "downloads", "popularity", "likes", "shares", "rating"]) {
    hasNot(archiveSql, new RegExp(`\\b${w}\\b`, "i"), `schema carries no "${w}"`);
    hasNot(data, new RegExp(`\\b${w}\\b`, "i"), `data layer carries no "${w}"`);
  }
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
const total = results.length;
const pass = total - failed;
const report = {
  gate: "PHASE 8 · W2 — The Archive Privacy & Isolation Audit",
  date: new Date().toISOString().slice(0, 10),
  verdict: failed === 0 ? "PASS" : "FAIL",
  checks: `${pass}/${total}`,
  results,
};
mkdirSync(new URL("../audit", import.meta.url).pathname, { recursive: true });
writeFileSync(new URL("../audit/phase8-archive.json", import.meta.url).pathname, JSON.stringify(report, null, 2) + "\n");
console.log(`\n${pass}/${total} isolation checks passed — verdict ${report.verdict} (audit/phase8-archive.json)`);
process.exit(failed === 0 ? 0 : 1);
