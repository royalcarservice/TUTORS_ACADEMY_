#!/usr/bin/env node
// Socratic oversight tests (Phase 9 · Step 3, DEC-035).
// Pure — zero network, zero database: the diagnostic mirror's grouping and
// time words are proven offline, then the panel's register (zero evaluative
// vocabulary), the preparation mark's schema, the toggle's posture, the
// wiring and the documentation are pinned.
// Run: node --import ./scripts/ts-loader.mjs scripts/test-socratic-oversight.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const OVERSIGHT = await import("@/lib/socratic/oversight");
const { groupInquiries, timeWordOf, TUTOR_OVERVIEW_LIMIT } = OVERSIGHT;

let n = 0, failed = 0;
const t = (name, fn) => { n++; try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); } };
const rawFile = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const literalsOf = (src) => [...strip(src).matchAll(/"([^"\\]*)"|'([^'\\]*)'|`([^`\\]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);

const PANEL = "src/components/tutor/socratic-reflections.tsx";
const SURFACE = "src/components/tutor/relationship-surface.tsx";
const PAGE = "src/app/(portal)/tutor/[subject]/[relationship]/page.tsx";
const ACTIONS = "src/lib/socratic/actions.ts";
const DATA = "src/lib/socratic/data.ts";
const MIGRATION = "supabase/migrations/20261008000010_phase9_socratic_pins.sql";
const VISIBILITY = "docs/TUTOR_VISIBILITY.md";
const DISTANCE = "docs/TUTOR_DISTANCE.md";

const row = (id, milestoneKey, createdAt) => ({ id, milestoneKey, queryText: `q-${id}`, createdAt });

/* ── 1 · the pure half — grouping and time words ─────────────────────────── */
t("limit — the overview reads twelve inquiries at most", () => {
  assert.equal(TUTOR_OVERVIEW_LIMIT, 12);
});

t("grouping — rows gather by milestone key, in the read's own order, deterministically", () => {
  const rows = [
    row("e-3", "physics:harmonic-motion", "2026-10-03T10:00:00.000Z"),
    row("e-2", "physics:newton-laws", "2026-10-02T10:00:00.000Z"),
    row("e-1", "physics:harmonic-motion", "2026-10-01T10:00:00.000Z"),
  ];
  const pathOf = (k) => `path:${k}`;
  const groups = groupInquiries(rows, pathOf);
  assert.deepEqual(groups.map((g) => g.milestoneKey), ["physics:harmonic-motion", "physics:newton-laws"]);
  assert.deepEqual(groups[0].inquiries.map((q) => q.id), ["e-3", "e-1"]);
  assert.equal(groups[0].path, "path:physics:harmonic-motion");
  assert.deepEqual(groupInquiries(rows, pathOf), groups); // determinism
  assert.deepEqual(groupInquiries([], pathOf), []);
});

t("time words — the reflection's instant stands as date and UTC time, no clock read", () => {
  assert.equal(timeWordOf("2026-09-24T12:00:00.000Z"), "24 September 2026 · 12:00 UTC");
  assert.equal(timeWordOf("2026-01-01T00:05:00.000Z"), "1 January 2026 · 00:05 UTC");
  assert.equal(timeWordOf("defective"), "defective");
});

/* ── 2 · the panel's register — a mirror, never a judgment ───────────────── */
t("panel — the heading, the framing word and the purpose sentence stand verbatim", () => {
  const src = rawFile(PANEL);
  assert.ok(src.includes("`Conceptual Explorations · ${subjectName}`"));
  assert.ok(src.includes('listLabel: "Conceptual inquiries"'));
  assert.ok(src.includes("The student's inquiries to the study lens, preserved as asked. They stand here to prepare the next dialogue — nothing on this panel scores, rates or flags them."));
});

t("panel — the preparation mark's two states stand verbatim", () => {
  const src = rawFile(PANEL);
  assert.ok(src.includes('mark: "Mark for Next Live Session"'));
  assert.ok(src.includes('marked: "Marked for Next Live Session"'));
  assert.ok(src.includes("aria-pressed={q.pinned || undefined}"));
});

t("panel — zero evaluative vocabulary anywhere the panel can speak", () => {
  const BANNED = ["struggl", "comprehension", "difficulty flag", "rating", "needs attention", "attention score", "idle", "time on task", "/5", "out of 5", "weak", "strong student", "slow learner"];
  const src = strip(rawFile(PANEL));
  const low = src.toLowerCase();
  for (const b of BANNED) assert.ok(!low.includes(b), `evaluative vocabulary (${b}) in the panel`);
  // The one word "scores" the panel speaks is the REFUSAL of scoring — pinned.
  const hits = literalsOf(rawFile(PANEL)).filter((l) => l.toLowerCase().includes("score"));
  assert.ok(hits.length > 0 && hits.every((l) => l.includes("nothing on this panel scores, rates or flags them")), "a non-refusal 'score' string exists");
});

t("panel — no exclamation, no emoji, no animation vocabulary", () => {
  const src = rawFile(PANEL);
  for (const lit of literalsOf(src)) assert.ok(!lit.includes("!"), `exclamation in: ${lit.slice(0, 50)}`);
  assert.ok(!EMOJI.test(src));
  for (const b of ["animation", "transition", "bounce", "spring", "pulse"]) {
    assert.ok(!strip(src).toLowerCase().includes(b), `animation vocabulary (${b})`);
  }
});

t("panel — the 3.1 guard holds: no direct subject-config import", () => {
  const src = rawFile(PANEL);
  assert.ok(!src.includes("@/lib/subjects/subjects"));
  assert.ok(!src.includes("@/config/scene"));
});

/* ── 3 · the preparation mark's schema ───────────────────────────────────── */
t("migration — RLS enabled AND forced; the unique pair; no update; anon nowhere", () => {
  const sql = rawFile(MIGRATION);
  assert.ok(/alter table public\.socratic_pins enable row level security/.test(sql));
  assert.ok(/alter table public\.socratic_pins force row level security/.test(sql));
  assert.ok(sql.includes("unique (tutor_id, exchange_id)"));
  assert.ok(!/for update/.test(sql), "an update policy exists");
  assert.ok(!/to anon/.test(sql), "a policy admits anon");
  assert.ok(/pins_select_own_tutor[\s\S]*is_related_tutor\(student_id, subject_id\)/.test(sql), "the select policy must re-decide relatedness");
  assert.ok(/pins_insert_own_tutor[\s\S]*exists \([\s\S]*from public\.socratic_exchanges/.test(sql), "the insert policy must re-derive the pair from the exchange");
  for (const lit of literalsOf(sql)) assert.ok(!lit.includes("!"), `exclamation in migration string: ${lit.slice(0, 40)}`);
});

/* ── 4 · the toggle's posture ────────────────────────────────────────────── */
t("action — no identity argument, tutor role re-decided, visibility before the write", () => {
  const src = rawFile(ACTIONS);
  assert.ok(src.includes("export async function toggleSocraticPin(input: {"));
  assert.ok(!/function toggleSocraticPin\([^)]*identity/i.test(src), "identity may never be an argument");
  assert.ok(src.includes('identity.role !== "tutor"'));
  const body = src.slice(src.indexOf("export async function toggleSocraticPin"));
  assert.ok(body.includes('.eq("student_id", studentId)'), "the visibility read must spell the student");
  assert.ok(body.includes('.eq("subject_id", subjectId)'), "the visibility read must spell the subject");
  assert.ok(body.includes('revalidatePath("/tutor", "layout")'));
});

t("reader — the overview carries no tutorId, spells subject and student, caps the read", () => {
  const src = rawFile(DATA);
  const fn = src.slice(src.indexOf("export async function fetchTutorSocraticOverview"));
  assert.ok(fn.includes("subjectId: string,\n  studentId: string"), "the signature is (subjectId, studentId) — no tutorId");
  assert.ok(!fn.slice(0, fn.indexOf(")")).includes("tutorId"));
  assert.ok(fn.includes('limit(TUTOR_OVERVIEW_LIMIT)'));
  assert.ok(fn.includes('.eq("student_id", studentId)'));
});

/* ── 5 · the wiring and the documents ────────────────────────────────────── */
t("wiring — the page resolves the oversight and the surface renders it beneath the record", () => {
  const page = rawFile(PAGE);
  assert.ok(page.includes('import { resolveOversight } from "@/components/tutor/socratic-reflections"'));
  assert.ok(page.includes("resolveOversight(r.view)"));
  assert.ok(page.includes("oversight={oversight}"));
  const surface = rawFile(SURFACE);
  assert.ok(surface.includes("oversight?: React.ReactNode | null"));
  const recordAt = surface.indexOf("{record}");
  const oversightAt = surface.indexOf("{oversight}");
  assert.ok(recordAt > -1 && oversightAt > recordAt, "the oversight renders beneath the record region");
});

t("surface — the statement names the page's posture (reading + preparation), declared evolution", () => {
  const src = rawFile(SURFACE);
  assert.ok(src.includes("This page reads the record and prepares the next dialogue. Nothing else is done here by a tutor yet: teaching surfaces are not built."));
  assert.ok(!src.includes("reads the record and changes nothing"));
});

t("docs — TUTOR_VISIBILITY records the mirror's rows and its refusals", () => {
  const src = rawFile(VISIBILITY);
  assert.ok(src.includes("the student's Socratic inquiries in that subject"));
  assert.ok(src.includes("diagnostic mirror"));
  assert.ok(src.includes("socratic_select_related_tutor"));
  assert.ok(src.includes("pins_select_own_tutor"));
  assert.ok(src.includes("pins_insert_own_tutor"));
  assert.ok(src.includes("pins_delete_own_tutor"));
});

t("docs — TUTOR_DISTANCE affirms the engine does not grade or score inquiry history", () => {
  const src = rawFile(DISTANCE);
  assert.ok(src.includes("The engine does not grade or score student inquiry history."));
  assert.ok(src.includes("No comprehension rating, no difficulty flag"));
  assert.ok(src.includes("reads the record and prepares the next dialogue"));
});

console.log(`\n${n - failed}/${n} socratic oversight tests passed`);
if (failed > 0) process.exit(1);
