#!/usr/bin/env node
// ============================================================================
// PHASE 8 GATE · W3 — THE PEDAGOGICAL TRUTH & LANGUAGE AUDIT
// Verdict written to audit/phase8-language.json. Pure — zero network.
//
// Proves the archive reads like an ACADEMY ARCHIVE and never like a video
// platform: no commercial buzzwords, no vanity counters, no gamified
// progress, no streaming-feed register — and that the REQUIRED vocabulary
// stands verbatim where DEC-030/031/032 placed it. Comments are stripped
// for the sweeps (they legitimately name the banned words in REFUSAL
// sentences); the copy itself must be clean.
// ============================================================================
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const raw = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const SURFACES = [
  "src/app/subjects/[subject]/archive/page.tsx",
  "src/app/subjects/[subject]/archive/actions.ts",
  "src/components/archive/artifact-shelf.tsx",
  "src/components/archive/artifact-card.tsx",
  "src/components/archive/artifact-opener.tsx",
  "src/components/archive/artifact-viewer.tsx",
  "src/components/archive/canvas-replay.tsx",
  "src/components/archive/media-player.tsx",
  "src/components/archive/board-record.ts",
  "src/components/archive/milestone-synthesis.tsx",
  "src/lib/archive/artifact.ts",
  "src/lib/archive/data.ts",
  "src/lib/archive/replay.ts",
  "src/lib/progress/synthesis.ts",
  "src/components/tutor/record.tsx",
];
/* The shelf's register (cards, shelf, page) is held to the stricter feed ban. */
const SHELF = SURFACES.slice(0, 3);
/* The chronology and everything that speaks a milestone. */
const CHRONOLOGY = [
  "src/components/archive/milestone-synthesis.tsx",
  "src/lib/progress/synthesis.ts",
  "src/components/student/slots.tsx",
  "src/components/tutor/record.tsx",
];

const results = [];
let failed = 0;
const check = (id, claim, fn) => {
  try { fn(); results.push({ id, claim, verdict: "PASS" }); console.log(`PASS  ${id} — ${claim}`); }
  catch (e) { failed++; results.push({ id, claim, verdict: "FAIL", error: e.message }); console.log(`FAIL  ${id} — ${claim}\n      ${e.message}`); }
};
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };
const noneOf = (files, re, what) => {
  for (const f of files) {
    const src = strip(raw(f));
    ok(!re.test(src), `${f} carries ${what}`);
  }
};

/* ── 1 · the archive's BANNED vocabulary is absent from every surface ─────── */
check("L1", "VOD · Replay File · Recording Upload appear nowhere in the archive's code or copy", () => {
  noneOf(SURFACES, /\bVOD\b|Replay File|Recording Upload/i, "a banned archive word");
});

/* ── 2 · the commercial video register is absent ──────────────────────────── */
check("L2", "no recommendation, trending, subscription, sharing or up-next machinery", () => {
  noneOf(SURFACES, /recommend|trending|subscrib|watch next|up next|up-next|playlist|related video|social embed/i, "a commercial register word");
});
check("L3", "no autoplay anywhere; the media element waits for the listener", () => {
  noneOf(SURFACES, /autoPlay|auto-play/i, "autoplay");
  const media = strip(raw("src/components/archive/media-player.tsx"));
  ok(/preload="metadata"/.test(media), "the element must not preload eagerly");
});
check("L4", "the shelf's register: no duration badge, no thumbnail feed, no counts", () => {
  noneOf(SHELF, /\bduration\b|\bbadge\b|thumbnail|grid of videos/i, "a feed word");
  noneOf(SHELF, /\bviews\b|\blikes\b|play count|download count/i, "a vanity counter");
});

/* ── 3 · zero vanity counters anywhere in the archive ─────────────────────── */
check("L5", "zero engagement vocabulary across every archive surface", () => {
  for (const f of SURFACES) {
    // artifact.ts NAMES the banned words in BANNED_ENGAGEMENT_WORDS — the
    // refusal-vocabulary class; sweep the module with that list removed.
    let src = strip(raw(f));
    if (f.endsWith("artifact.ts")) src = src.replace(/export const BANNED_ENGAGEMENT_WORDS = \[[\s\S]*?\] as const;/, "");
    ok(!/\bviews\b|\blikes\b|\bshares\b|popularity|download count|view count|\brating\b/i.test(src), `${f} carries an engagement word`);
  }
  const schema = raw("supabase/migrations/20261008000008_phase8_archive.sql").replace(/--.*$/gm, "");
  ok(!/view_count|download_count|popularity|likes|shares|\brating\b/i.test(schema), "the schema carries no counter column");
});

/* ── 4 · no gamified progress — the record-not-score model holds ──────────── */
check("L6", "the reward register is banned wherever a milestone is spoken", () => {
  /* bare "points" is refused here on purpose: the replay engine speaks
     GEOMETRIC points (stroke packets), and the record-not-score ban is on
     reward points — the unambiguous words carry the class alone. */
  noneOf(CHRONOLOGY.concat(SURFACES), /badge unlock|unlocked|\bxp\b|xp gain|level up|level-up|reward points|points system|streak|trophy|medal|leaderboard|congratulations|well done|you did it|great job/i, "a reward word");
});
check("L7", "a milestone entry carries no figure: the synthesis output stays a record", () => {
  const synth = strip(raw("src/lib/progress/synthesis.ts"));
  ok(!/ratio|percent|score|rank|grade|composite/i.test(synth.replace(/MilestoneRecord/g, "")), "no figure vocabulary in the composer");
  ok(/sources: \[e\.id\]/.test(synth), "every entry names its row — traceability stands");
});

/* ── 5 · the REQUIRED vocabulary stands VERBATIM ──────────────────────────── */
check("L8", "the archive's own words stand in the seam and on the card", () => {
  const seam = raw("src/lib/archive/artifact.ts");
  for (const w of ["Board Record", "Session Notation", "Chamber Audio"]) ok(seam.includes(w), `the seam lacks "${w}"`);
  const card = raw("src/components/archive/artifact-card.tsx");
  for (const w of ["Board Record", "Session Notation", "Chamber Audio"]) ok(card.includes(w), `the card lacks "${w}"`);
});
check("L9", "the chronology's register stands verbatim (DEC-032)", () => {
  const view = raw("src/components/archive/milestone-synthesis.tsx");
  for (const w of ["Conceptual Arc", "Milestone Reached", "Substantiated by", "Your Milestone Record in", "Milestones co-certified"]) {
    ok(view.includes(w), `the chronology lacks "${w}"`);
  }
});
check("L10", "the viewer's calm sentences stand verbatim (DEC-031)", () => {
  const viewer = raw("src/components/archive/artifact-viewer.tsx");
  for (const w of [
    "The archive is fetching this artifact.",
    "This artifact stands in the archive; its bytes open in a credentialed environment.",
    "This artifact could not be opened. The archive has not lost it.",
    "The board record could not be read back.",
  ]) ok(viewer.includes(w), `the viewer lacks "${w}"`);
});

/* ── 6 · the dignity sweeps: no exclamation marks, no emoji ───────────────── */
check("L11", "no exclamation marks in any quoted copy; no emoji anywhere", () => {
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
  for (const f of SURFACES) {
    const src = raw(f);
    const literals = src.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g) ?? [];
    for (const lit of literals) {
      /* PostgREST embed grammar is identifier!identifier — query syntax,
         not exclamation; strip it before judging the remainder. */
      ok(!lit.replace(/\w!\w/g, "").includes("!"), `${f} exclaims: ${lit.slice(0, 40)}`);
    }
    ok(!EMOJI.test(src), `${f} carries emoji`);
  }
});

/* ── verdict ──────────────────────────────────────────────────────────────── */
const total = results.length;
const pass = total - failed;
const report = {
  gate: "PHASE 8 · W3 — The Pedagogical Truth & Language Audit",
  date: new Date().toISOString().slice(0, 10),
  verdict: failed === 0 ? "PASS" : "FAIL",
  checks: `${pass}/${total}`,
  surfaces: SURFACES.length,
  results,
};
mkdirSync(new URL("../audit", import.meta.url).pathname, { recursive: true });
writeFileSync(new URL("../audit/phase8-language.json", import.meta.url).pathname, JSON.stringify(report, null, 2) + "\n");
console.log(`\n${pass}/${total} language checks passed — verdict ${report.verdict} (audit/phase8-language.json)`);
process.exit(failed === 0 ? 0 : 1);
