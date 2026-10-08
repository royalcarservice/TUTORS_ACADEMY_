#!/usr/bin/env node
// Archive surface tests (Phase 8 · Step 2, DEC-030).
// Pure — zero network: the archive route's guards, the shelf's register, the
// card's vocabulary, the doors, and the discipline that this is an ACADEMY
// ARCHIVE, never a streaming feed.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-archive-surface.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const A = await import("@/lib/archive/artifact");
const { ARTIFACT_WORD, wantsPreview } = A;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const PAGE = "src/app/subjects/[subject]/archive/page.tsx";
const SHELF = "src/components/archive/artifact-shelf.tsx";
const CARD = "src/components/archive/artifact-card.tsx";

/* ── 1 · the route's guards — the live chamber's gate, carried over ───────── */
t("route — invalid subject 404s; no identity meets the login door, back here after", () => {
  const src = rawFile(PAGE);
  assert.match(src, /if \(!s\) notFound\(\);/);
  assert.match(src, /redirect\(`\/login\?next=\$\{encodeURIComponent\(`\/subjects\/\$\{subject\}\/archive`\)\}`\)/);
});
t("route — enrolment and relationship decide; everyone else gets the SAME 404 (no enumeration)", () => {
  const src = rawFile(PAGE);
  assert.match(src, /identity\.role === "student" && isEnrolled \? "student" : identity\.role === "tutor" && isRelated \? "tutor" : null/);
  assert.match(src, /if \(!viewer\) notFound\(\);/);
  assert.match(src, /s\.status === "draft" && prod && !isEnrolled && !isRelated/, "the draft guard stands");
});
t("route — layout ruling carried: the subjects layout is inherited, no second layout", () => {
  assert.ok(!existsSync(new URL("../src/app/subjects/[subject]/archive/layout.tsx", import.meta.url)), "DEC-026's ruling applies: no new layout.tsx");
  assert.ok(existsSync(new URL("../src/app/subjects/layout.tsx", import.meta.url)), "the standing subjects layout exists");
});
t("route — the archive read is PRIMARY and the page is a server component", () => {
  const src = rawFile(PAGE);
  assert.doesNotMatch(src, /^"use client"/m);
  assert.match(src, /await fetchSubjectArchive\(s\.id\)/);
  assert.doesNotMatch(src, /isolateAsync\("archive/, "no isolation wrapper — a failed read fails the page honestly");
  assert.match(src, /title: `\$\{s\.name\} — archive`/);
});

/* ── 2 · the shelf — a library, not a feed ────────────────────────────────── */
t("shelf — server component; the empty notice stands VERBATIM", () => {
  const src = rawFile(SHELF);
  assert.doesNotMatch(src, /^"use client"/m);
  assert.match(src, /No archived sessions in \$\{subjectName\} yet\. Artifacts are preserved here after learning sessions conclude\./);
});
t("shelf — chronological, most recent first; date · title · tutor name the session facts", () => {
  const src = rawFile(SHELF);
  assert.match(src, /<ol /, "the shelf is an ordered list");
  assert.match(src, /data-archive-session=\{s\.id\}/);
  assert.match(src, /sessionDate\(s\.scheduledAt\)/, "the date stands first");
  assert.match(src, /\{s\.title\}/);
  assert.match(src, /s\.tutorName && /, "the tutor is named only when the boundary allows");
  assert.match(src, /toLocaleDateString\("en-GB", \{ day: "numeric", month: "long", year: "numeric", timeZone: "UTC" \}\)/, "the house date precedent (when.ts), UTC-deterministic");
});
t("shelf — no counts, no badges, no feed vocabulary", () => {
  const src = strip(rawFile(SHELF));
  assert.doesNotMatch(src, /\bviews\b|\bwatching\b|duration|badge|thumbnail|grid of videos/i);
});

/* ── 3 · the card — the archive's own words ───────────────────────────────── */
t("card — the three REQUIRED words stand in both the card and the pure seam", () => {
  const src = rawFile(CARD);
  assert.deepEqual(ARTIFACT_WORD, { canvas_snapshot: "Board Record", pedagogical_notes: "Session Notation", session_recording: "Chamber Audio" });
  for (const word of ["Board Record", "Session Notation", "Chamber Audio"]) assert.match(src, new RegExp(word), `${word} must stand`);
});
t("card — BANNED vocabulary absent: VOD, Replay File, Recording Upload", () => {
  const src = strip(rawFile(CARD)) + strip(rawFile(SHELF)) + strip(rawFile(PAGE));
  assert.doesNotMatch(src, /\bVOD\b|Replay File|Recording Upload/i);
});
t("card — server component; the board's preview is subtle and accent-framed; playback is WIRED", () => {
  const src = rawFile(CARD);
  assert.doesNotMatch(src, /^"use client"/m);
  assert.match(src, /border: "1px solid var\(--ta-accent-1\)"/, "the preview wears the subject's accent");
  /* Declared pin evolution (DEC-031): Step 2's debt sentence — "Playback
     opens with the recordings wiring." — is DISCHARGED by Step 3, which
     wires the viewer. The pin moves from the sentence to the wiring. */
  assert.match(src, /<ArtifactOpener/, "every card carries the one quiet opener");
  assert.doesNotMatch(src, /Playback opens with the recordings wiring/, "the debt sentence stands no longer");
  assert.match(src, /data-artifact-type=\{artifact\.type\}/);
});
t("card — zero commercial clutter anywhere in the archive's surfaces", () => {
  const src = strip(rawFile(CARD)) + strip(rawFile(SHELF)) + strip(rawFile(PAGE));
  for (const w of ["recommend", "trending", "popular", "subscribe", "share", "likes", "views", "download count", "watch next"]) {
    assert.doesNotMatch(src, new RegExp(`\\b${w}\\b`, "i"), `"${w}" must never appear`);
  }
});

/* ── 4 · the doors ────────────────────────────────────────────────────────── */
t("door (student) — the recordings-notes region is filled through the documented fill point", () => {
  const slots = rawFile("src/components/shell/slots.tsx");
  assert.match(slots, /"recordings-notes": ArchiveDoorSlot/);
  assert.match(slots, /data-archive-door-link/);
  assert.match(slots, /href=\{`\/subjects\/\$\{subjectId\}\/archive`\}/);
  assert.match(slots, /View past sessions/);
  const shell = rawFile("src/components/shell/subject-shell.tsx");
  assert.match(shell, /<Slot subjectId=\{subject\.id\} subjectName=\{subject\.name\} regionTitle=\{r\.title\} \/\>/, "the shell hands the slot its subject");
});
t("door (tutor) — one quiet archive link per subject group, ShapeLink's own grammar", () => {
  const link = rawFile("src/components/tutor/archive-link.tsx");
  assert.match(link, /Review the \$\{subjectName\} archive/);
  assert.match(link, /href=\{`\/subjects\/\$\{subjectId\}\/archive`\}/);
  const shell = rawFile("src/components/tutor/tutor-shell.tsx");
  assert.match(shell, /<ArchiveLink subjectId=\{g\.subjectId\} subjectName=\{name\} \/\>/);
  assert.match(shell, /<ShapeLink subjectId=\{g\.subjectId\} subjectName=\{name\} \/\>/, "the levers' link stands as before");
});
t("door — a relationship's surface stays untouched (P6 distance kept)", () => {
  const rel = rawFile("src/components/tutor/relationship-surface.tsx");
  assert.doesNotMatch(rel, /archive/i, "no archive link beside a student — reviewing past work is a subject act");
});

/* ── 5 · the discipline sweeps ────────────────────────────────────────────── */
t("sweep — zero telemetry in every archive surface", () => {
  for (const f of [PAGE, SHELF, CARD, "src/components/shell/slots.tsx", "src/components/tutor/archive-link.tsx"]) {
    const src = strip(rawFile(f));
    assert.doesNotMatch(src, /setTimeout|setInterval|localStorage|sessionStorage|indexedDB|document\.cookie|geolocation|analytics|telemetry|visibilitychange|onPlay|onPause/i);
  }
});
t("sweep — the preview is board-only and best-effort in the data layer", () => {
  assert.equal(wantsPreview("canvas_snapshot"), true);
  assert.equal(wantsPreview("pedagogical_notes"), false);
  assert.equal(wantsPreview("session_recording"), false);
  const data = rawFile("src/lib/archive/data.ts");
  assert.match(data, /wantsPreview\(record\.type\) \? await previewFor\(record\.storagePath\) : null/);
  assert.match(data, /tutor:profiles!cohort_sessions_tutor_id_fkey\(display_name\)/, "the tutor's name is read through the standing join");
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
console.log(`\n${n - failed}/${n} archive-surface tests passed`);
process.exit(failed === 0 ? 0 : 1);
