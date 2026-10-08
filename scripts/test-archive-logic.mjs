#!/usr/bin/env node
// Archive logic tests (Phase 8 · Step 1, DEC-029).
// Pure — zero network, zero database: classification, subject isolation,
// the visibility mirror, and parity pins against migration 0008's text.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-archive-logic.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const A = await import("@/lib/archive/artifact");
const {
  ARTIFACT_TYPES, ARTIFACT_BUCKET, SIGNED_URL_SECONDS, BANNED_ENGAGEMENT_WORDS,
  isArtifactType, artifactStoragePath, parseArtifactPath, subjectOfStoragePath,
  artifactBelongsToSession, toArtifact, canReadSubjectArchive, canInsertArtifact,
} = A;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const stripSql = (src) => src.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
const MIGRATION = "supabase/migrations/20261008000008_phase8_archive.sql";

/* ── 1 · classification — three kinds, closed ─────────────────────────────── */
t("classification — exactly the brief's three kinds, in order", () => {
  assert.deepEqual([...ARTIFACT_TYPES], ["canvas_snapshot", "pedagogical_notes", "session_recording"]);
  assert.equal(isArtifactType("canvas_snapshot"), true);
  assert.equal(isArtifactType("pedagogical_notes"), true);
  assert.equal(isArtifactType("session_recording"), true);
});
t("classification — a fourth kind does not exist", () => {
  for (const bad of ["chat_log", "attendance", "homework", "CANVAS_SNAPSHOT", "", "recording"]) {
    assert.equal(isArtifactType(bad), false, `"${bad}" must not classify`);
  }
});
t("classification — toArtifact normalizes; unknown kinds are dropped, never guessed", () => {
  const row = (type) => ({
    id: "a-1", session_id: "s-1", subject_id: "mathematics", artifact_type: type,
    storage_path: "mathematics/s-1/a-1", metadata: { duration_s: 42 }, created_at: "2026-10-08T10:00:00Z",
  });
  const ok = toArtifact(row("session_recording"));
  assert.equal(ok.type, "session_recording");
  assert.deepEqual(ok.metadata, { duration_s: 42 });
  assert.equal(ok.subjectId, "mathematics");
  assert.equal(toArtifact(row("popularity_chart")), null);
  assert.equal(toArtifact(row("canvas_snapshot")).type, "canvas_snapshot");
  // metadata that is not an object degrades to facts-empty, never throws
  assert.deepEqual(toArtifact({ ...row("pedagogical_notes"), metadata: "oops" }).metadata, {});
});

/* ── 2 · the storage path convention ───────────────────────────────────────── */
t("paths — one convention, built once, parsed back", () => {
  const p = artifactStoragePath("physics", "11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222");
  assert.equal(p, "physics/11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222");
  const parsed = parseArtifactPath(p);
  assert.deepEqual(parsed, {
    subjectId: "physics",
    sessionId: "11111111-1111-1111-1111-111111111111",
    artifactId: "22222222-2222-2222-2222-222222222222",
  });
  assert.equal(subjectOfStoragePath(p), "physics");
});
t("paths — malformed paths are refused at the door", () => {
  for (const bad of [
    "", "physics", "physics/s-1", "physics/s-1/a-1/extra",
    "/physics/s-1/a-1", "physics//a-1", "physics/../secrets", "physics/./a-1",
  ]) {
    assert.equal(parseArtifactPath(bad), null, `"${bad}" must be refused`);
  }
  assert.equal(subjectOfStoragePath("/physics/s-1/a-1"), null);
  assert.equal(subjectOfStoragePath("physics/../secrets"), null);
});

/* ── 3 · subject isolation, as a provable predicate ───────────────────────── */
t("isolation — the pair (subject, session) is inseparable", () => {
  const session = { id: "s-1", subjectId: "mathematics" };
  assert.equal(artifactBelongsToSession({ subjectId: "mathematics", sessionId: "s-1" }, session), true);
  assert.equal(artifactBelongsToSession({ subjectId: "physics", sessionId: "s-1" }, session), false, "another subject's artifact cannot sit here");
  assert.equal(artifactBelongsToSession({ subjectId: "mathematics", sessionId: "s-2" }, session), false, "another session's artifact cannot sit here");
  assert.equal(artifactBelongsToSession({ subjectId: "physics", sessionId: "s-2" }, session), false);
});

/* ── 4 · the visibility mirror — the policies' words, offline ─────────────── */
const enrolled = (subjectId, status = "active") => ({ enrolments: [{ subjectId, status }], tutorRelations: [] });
const tutor = (subjectId, state = "active") => ({ enrolments: [], tutorRelations: [{ subjectId, state }] });
t("visibility — an actively enrolled student reads the subject's archive", () => {
  assert.equal(canReadSubjectArchive(enrolled("mathematics"), "mathematics"), true);
  assert.equal(canReadSubjectArchive(enrolled("mathematics"), "physics"), false, "never across subjects");
  assert.equal(canReadSubjectArchive(enrolled("mathematics", "ended"), "mathematics"), false, "a lapsed enrolment reads nothing");
});
t("visibility — an actively related tutor reads the subject's archive", () => {
  assert.equal(canReadSubjectArchive(tutor("chemistry"), "chemistry"), true);
  assert.equal(canReadSubjectArchive(tutor("chemistry"), "biology"), false, "never across subjects");
  assert.equal(canReadSubjectArchive(tutor("chemistry", "paused"), "chemistry"), false, "an inactive relationship reads nothing");
});
t("visibility — a stranger, a ghost, an anon: nobody else reads", () => {
  assert.equal(canReadSubjectArchive({ enrolments: [], tutorRelations: [] }, "mathematics"), false);
  // enrolled in physics, tutoring chemistry — mathematics stays closed
  const elsewhere = { enrolments: [{ subjectId: "physics", status: "active" }], tutorRelations: [{ subjectId: "chemistry", state: "active" }] };
  assert.equal(canReadSubjectArchive(elsewhere, "mathematics"), false);
});
t("visibility — writing is the session opener's alone, and never cross-subject", () => {
  const session = { id: "s-1", subjectId: "mathematics", tutorId: "tutor-a" };
  assert.equal(canInsertArtifact("tutor-a", session, "mathematics"), true);
  assert.equal(canInsertArtifact("tutor-b", session, "mathematics"), false, "a second tutor of the subject still cannot write here");
  assert.equal(canInsertArtifact("tutor-a", session, "physics"), false, "the artifact's subject must be the session's subject");
  assert.equal(canInsertArtifact("student-x", session, "mathematics"), false, "students never write artifacts");
});

/* ── 5 · parity pins — the migration says what the logic says ─────────────── */
const mig = rawFile(MIGRATION);
const migCode = stripSql(mig);
t("migration — numbered 0008 (0005 belongs to cohorts), RLS enabled AND forced", () => {
  assert.ok(existsSync(new URL("../supabase/migrations/20261008000008_phase8_archive.sql", import.meta.url)));
  assert.ok(!existsSync(new URL("../supabase/migrations/20261008000005_phase8_archive.sql", import.meta.url)), "0005 stays cohorts' number");
  assert.match(migCode, /alter table public\.session_artifacts enable row level security;/);
  assert.match(migCode, /alter table public\.session_artifacts force row level security;/);
});
t("migration — the three kinds exactly; subject CHECKed, never foreign-keyed to air", () => {
  assert.match(migCode, /artifact_type in \('canvas_snapshot', 'pedagogical_notes', 'session_recording'\)/);
  assert.match(migCode, /subject_id\s+text not null check \(public\.is_subject_id\(subject_id\)\)/);
});
t("migration — session FK cascades; the pair is one composite foreign key", () => {
  assert.match(migCode, /session_id\s+uuid not null references public\.cohort_sessions \(id\) on delete cascade/);
  assert.match(migCode, /foreign key \(subject_id, session_id\) references public\.cohort_sessions \(subject_id, id\)/);
  assert.match(migCode, /add constraint cohort_sessions_subject_id_uniq unique \(subject_id, id\)/);
  assert.match(migCode, /create index session_artifacts_subject_session on public\.session_artifacts \(subject_id, session_id\)/);
});
t("migration — storage_path unique; metadata capped at the 16 KB budget", () => {
  assert.match(migCode, /storage_path\s+text not null unique/);
  assert.match(migCode, /octet_length\(metadata::text\) <= 16384/);
});
t("migration — the three policies mirror the visibility words; no update/delete", () => {
  assert.match(migCode, /create policy artifacts_select_enrolled_student on public\.session_artifacts\s+for select/);
  assert.match(migCode, /e\.status = 'active'/);
  assert.match(migCode, /create policy artifacts_select_related_tutor on public\.session_artifacts\s+for select/);
  assert.match(migCode, /r\.state = 'active'/);
  assert.match(migCode, /create policy artifacts_insert_session_tutor on public\.session_artifacts\s+for insert/);
  assert.match(migCode, /s\.tutor_id = auth\.uid\(\)/, "write = the session opener");
  assert.doesNotMatch(migCode, /on public\.session_artifacts\s+for (update|delete)/, "lifecycle is service-role managed");
  assert.match(migCode, /revoke all on public\.session_artifacts from anon, authenticated;/);
});
t("migration — one PRIVATE bucket, one SELECT policy on objects, anon admitted nowhere", () => {
  assert.equal(ARTIFACT_BUCKET, "session-artifacts");
  assert.match(migCode, /insert into storage\.buckets \(id, name, public\)\s+values \('session-artifacts', 'session-artifacts', false\)/);
  assert.match(migCode, /create policy objects_select_session_artifacts on storage\.objects\s+for select/);
  assert.match(migCode, /\(storage\.foldername\(name\)\)\[1\]/, "the object's subject is its first path segment");
  assert.doesNotMatch(migCode, /on storage\.objects\s+for (insert|update|delete)/, "uploads belong to the service role");
});

/* ── 6 · zero engagement, zero telemetry — swept ──────────────────────────── */
t("archive — ZERO engagement vocabulary in schema or data layer", () => {
  assert.deepEqual([...BANNED_ENGAGEMENT_WORDS], ["view_count", "views", "download_count", "downloads", "popularity", "likes", "shares", "rating"]);
  for (const f of [MIGRATION, "src/lib/archive/data.ts", "src/lib/archive/artifact.ts"]) {
    const code = f.endsWith(".sql") ? stripSql(rawFile(f)) : strip(rawFile(f));
    // the banned-words constant itself is the one sanctioned mention
    const withoutConstant = code.replace(/BANNED_ENGAGEMENT_WORDS = \[[\s\S]*?\] as const;?/, "");
    for (const w of BANNED_ENGAGEMENT_WORDS) {
      assert.doesNotMatch(withoutConstant, new RegExp(`\\b${w}\\b`, "i"), `${f} must not name "${w}"`);
    }
  }
  assert.doesNotMatch(migCode, /create policy[^\n]*\bto (public|anon)\b/i, "no policy admits the public or anon role");
});
t("archive — zero telemetry: no timers, no device storage, no tracking in the layer", () => {
  for (const f of ["src/lib/archive/data.ts", "src/lib/archive/artifact.ts"]) {
    const code = strip(rawFile(f));
    assert.doesNotMatch(code, /setTimeout|setInterval|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|analytics|telemetry|visibilitychange/i);
  }
});

/* ── 7 · the signed-url seam is honest ────────────────────────────────────── */
t("seam — signing is narrow, service-only, and degrades to unsigned", () => {
  const data = rawFile("src/lib/archive/data.ts");
  assert.match(data, /SIGNED_URL_SECONDS/, "the window is named, not magic");
  assert.match(data, /createServiceClient\(\)/, "only the service client signs");
  assert.match(data, /if \(!admin\) return \{ mode: "unsigned" \};/, "no service key → unsigned, never a fabricated URL");
  assert.match(data, /return \{ mode: "unsigned" \}; \/\/ a signing failure is an absence, never an alarm/);
  assert.equal(SIGNED_URL_SECONDS <= 300, true, "the window stays short");
  assert.match(data, /if \(!user\) return null;[\s\S]*?maybeSingle/, "invisible and unknown stay the same null");
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
console.log(`\n${n - failed}/${n} archive-logic tests passed`);
process.exit(failed === 0 ? 0 : 1);
