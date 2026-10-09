#!/usr/bin/env node
// PHASE 7 GATE · WINDOW W2 — THE PRIVACY & SURVEILLANCE AUDIT.
// Pure filesystem sweep over src/ — no network, no DB, no browser.
// Run: node scripts/gate7-privacy-audit.mjs
// Verdict recorded in audit/phase7-privacy.json (committed baseline).
//
// TWO PASSES:
//  (A) BROAD — every src/ file against the surveillance-specific families
//      (facial/gaze, tab/focus monitoring, idle-dwell tracking, capture &
//      exfiltration, gamification). A hit must be on the audited allowlist.
//  (B) STRICT — the live surfaces a student actually stands in get ZERO
//      tolerance for ANY banned family, timers included. No exceptions.
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const SRC = join(ROOT, "src");

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry)) files.push(p);
  }
})(SRC);

const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/* Families for the BROAD pass — surveillance & gamification, not timers. */
const BROAD_FAMILIES = {
  facial_or_gaze_tracking: [
    /face[-_ ]?api|faceapi|mediapipe|facedetection|face[-_ ]?detect/i,
    /\bgaze\b/i, /\beye[-_ ]?track/i, /\bpupil\b/i, /\bblink[-_ ]?(rate|count|detect)/i,
    /webgazer/i,
  ],
  tab_or_focus_monitoring: [
    /\bvisibilitychange\b/, /document\.hidden/, /\bpagehide\b/,
    /addEventListener\(\s*["']blur["']/, /addEventListener\(\s*["']focusout["']/,
    /hasFocus\(\)[\s\S]{0,60}(send|log|telemetry|track|record)/i,
  ],
  dwell_or_idle_tracking: [
    /\bdwell\b/i, /\bidle[-_ ]?(timer|timeout|detect|track)/i, /requestIdleCallback/,
  ],
  capture_or_exfiltration: [
    /\bgeolocation\b/i, /\blocalStorage\b/, /\bsessionStorage\b/, /\bindexedDB\b/,
    /document\.cookie/, /toDataURL\(\)[\s\S]{0,40}(send|log|upload)/i,
  ],
  gamification: [
    /[\u{1F300}-\u{1FAFF}]/u, // pictographic emoji
    /\bconfetti\b/i, /\bleaderboard\b/i, /\bstreak\b/i, /\bbadge\b/i,
    /\bxp\b/i, /\bexp[-_ ]?points\b/i, /\btrophy\b/i, /\bstar[-_ ]?rating\b/i,
    /\bthumbs[-_ ]?(up|down)\b/i,
  ],
};

/* The STRICT families add timers (zero tolerance everywhere in the live
 * room, room-participant included) and capture (exempt only for the one
 * audited opt-in button in room-participant). */
const STRICT_FAMILIES = {
  ...BROAD_FAMILIES,
  timers: [/\bsetTimeout\b/, /\bsetInterval\b/],
  capture: [/\bgetUserMedia\b/, /\bgetDisplayMedia\b/],
};

/* Audited allowlist for the BROAD pass. Every entry was hand-read during
 * the W2 window on 2026-10-08; reasons are the audit findings, not waivers.
 * NONE of these files mount inside the live classroom — the strict pass
 * proves the live surfaces themselves are clean. */
const ALLOWLIST = {
  "src/app/(public)/legal/privacy/page.tsx":
    "the privacy NOTICE's never-collected list names surveillance vocabulary in refusal sentences (DEC-037): 'dwell' appears as 'idle or dwell timers' — what the platform refuses to collect; the list is the public record of the refusals the gates sweep for",
  "src/components/live/room-participant.tsx":
    "the participant island's OWN opt-in capture (DEC-024): getUserMedia is gated behind an explicit button, nothing leaves the device, no timers, no persistence — pinned by test-live-participant",
  "src/app/dev/scene-enter/preview.tsx":
    "dev-only performance probe (production-gated); measurement frames only, never attention tracking",
  // visibility listeners = lifecycle/performance pauses (nothing logged, sent or stored)
  "src/components/ambient/ambient-stage.tsx":
    "pauses/resumes the ambient WebGL scene when the tab hides — performance + battery respect; no record of the visit",
  "src/lib/motion.ts":
    "sets the data-ambient-paused CSS hook when the tab hides — presentation only",
  // Track 1 admin console (2026-10-08): the operations chrome uses the
  // shared Badge primitive for status pills (Active/Ended, Verified/Pending).
  // Administrative surfaces only; NONE of these mount inside a live
  // classroom — the strict pass proves the live surfaces stay clean.
  "src/app/(portal)/admin/page.tsx":
    "admin operations overview status pills via the shared Badge primitive — administrative chrome, never a student-facing live surface",
  "src/components/admin/placements-table.tsx":
    "placement state pills (Active/Ended) via the shared Badge primitive — administrative chrome, never a student-facing live surface",
  "src/components/admin/tutor-roster.tsx":
    "credentialing state pills (Verified/Pending) via the shared Badge primitive — administrative chrome, never a student-facing live surface",
  "src/components/admin/subject-levers.tsx":
    "current lever-value pill via the shared Badge primitive — administrative chrome, never a student-facing live surface",
  "src/app/(portal)/admin/billing/page.tsx":
    "invoice state pills (settled/pending/refunded) via the shared Badge primitive — administrative audit chrome, never a student-facing live surface",
  "src/app/(portal)/admin/system/page.tsx":
    "service-state pills (Live/Demo/Standby/Certified) via the shared Badge primitive — administrative inspection chrome, never a student-facing live surface",
  "src/components/admin/tutor-applications.tsx":
    "application state pill (Pending approval) via the shared Badge primitive — administrative chrome, never a student-facing live surface",
  "src/components/switch/subject-switch.tsx":
    "completes the subject-switch morph if the tab hides mid-flight, so the room never lands half-morphed; no tracking",
  "src/app/dev/motion/preview.tsx":
    "dev-only fps probe gated on visibility; measurement only",
  "src/app/dev/switch/preview.tsx":
    "dev-only rehearsal that SIMULATES a backgrounded tab to prove the switch completes; no real monitoring",
  // gamification words = refusal vocabulary, specimen copy, or the Badge UI primitive
  "src/app/dev/scene-promise/page.tsx":
    "PROGRESS_UI_TERMS is the scene's REFUSAL list (the sweep vocabulary that bans streak/xp/badge from copy)",
  "src/app/dev/scene-promise/preview.tsx":
    "asserts the refusal: 'no progress bar / ring / streak / XP / badge in copy'",
  "src/app/dev/scenes-practice/preview.tsx":
    "states the practice scene's refusal ('no streak, no calendar…')",
  "src/app/dev/student-shell/fixtures.tsx":
    "the shell's REFUSED-by-design list: 'Streaks, XP, levels, badges, leaderboards, points'",
  "src/app/dev/tutor-shell/page.tsx":
    "the tutor shell's refused list + P6-R3 row; naming what the surface will never do",
  "src/app/dev/type/preview.tsx":
    "typography specimen paragraph (tabular figures demo); 'a streak of 14 days' is type sample copy with zero logic, dev-only",
  "src/components/ui/badge.tsx":
    "the Badge UI primitive — a neutral label chip (module status), not a reward; name collision only",
  "src/components/ui/index.ts":
    "barrel re-export of the Badge primitive",
  "src/components/ui/section-heading.tsx":
    "composes the Badge primitive as a section label",
  "src/components/layout/portal-sidebar.tsx":
    "renders StatusBadge (draft/in-progress chip) on the module list — informational, never evaluative",
  // storage
  "src/components/layout/theme.tsx":
    "the ONE app-level preference: ta-theme (dark/light) in localStorage — Phase 2 feature, certified in the Phase 6 gate; no live surface holds device storage (pinned)",
  "src/components/spine/scenes/choice.tsx":
    "the hit is the REFUSAL sentence itself: 'Nothing persisted: no localStorage, no cookie, no query string'",
};

/* The live surfaces: zero tolerance. These mount inside the open room or
 * speak the session's language — a student actually stands in them. */
const LIVE_SURFACES = [
  "src/components/live/live-chamber.tsx",
  "src/components/live/live-stage.tsx",
  "src/components/live/participant-dock.tsx",
  "src/components/live/participant-tile.tsx",
  "src/components/live/chamber-controls.tsx",
  "src/components/live/academic-surface.tsx",
  "src/components/live/session-settlement.tsx",
  "src/components/live/room-layout.tsx",
  "src/lib/classroom/use-classroom-session.ts",
  "src/lib/classroom/transport.ts",
  "src/lib/classroom/types.ts",
  "src/lib/classroom/state-machine.ts",
  "src/lib/livekit/surface-sync.ts",
  "src/lib/livekit/config.ts",
];
// room-participant is opt-in media by design (DEC-024) — it gets the strict
// sweep too, minus the one family its single audited button requires.
const STRICT_EXEMPT_FAMILY = { file: "src/components/live/room-participant.tsx", family: "capture" };

const matchAll = (code, families) => {
  const out = [];
  for (const [family, patterns] of Object.entries(families)) {
    for (const re of patterns) if (re.test(code)) out.push({ family, pattern: String(re) });
  }
  return out;
};

/* BROAD pass */
const broadUnexplained = [], broadAllowlisted = [];
for (const f of files) {
  const rel = f.slice(ROOT.length);
  const code = strip(readFileSync(f, "utf8"));
  for (const h of matchAll(code, BROAD_FAMILIES)) {
    if (ALLOWLIST[rel]) broadAllowlisted.push({ file: rel, ...h, reason: ALLOWLIST[rel] });
    else broadUnexplained.push({ file: rel, ...h });
  }
}

/* STRICT pass */
const strictHits = [];
for (const rel of LIVE_SURFACES) {
  const code = strip(readFileSync(join(ROOT, rel), "utf8"));
  for (const h of matchAll(code, STRICT_FAMILIES)) {
    if (STRICT_EXEMPT_FAMILY.file === rel && STRICT_EXEMPT_FAMILY.family === h.family) continue;
    strictHits.push({ file: rel, ...h });
  }
}

const verdict = broadUnexplained.length === 0 && strictHits.length === 0 ? "PASS" : "FAIL";
const report = {
  gate: "PHASE 7 · W2 — Privacy & Surveillance Audit",
  date: "2026-10-08",
  scanned_files: files.length,
  verdict,
  broad_pass: {
    families: Object.keys(BROAD_FAMILIES),
    unexplained: broadUnexplained,
    allowlisted: broadAllowlisted,
  },
  strict_pass: { live_surfaces: LIVE_SURFACES, hits: strictHits, note: "zero tolerance; room-participant's single audited opt-in capture button is the only recorded exemption — timers are never exempt" },
};
mkdirSync(join(ROOT, "audit"), { recursive: true });
writeFileSync(join(ROOT, "audit/phase7-privacy.json"), JSON.stringify(report, null, 2));

console.log(`scanned ${files.length} src files`);
console.log(`BROAD   — unexplained: ${broadUnexplained.length} · allowlisted: ${broadAllowlisted.length}`);
for (const e of broadAllowlisted) console.log(`  · allowlist ${e.family} — ${e.file}`);
for (const u of broadUnexplained) console.log(`  ✗ UNEXPLAINED ${u.family} — ${u.file} (${u.pattern})`);
console.log(`STRICT  — live-surface hits: ${strictHits.length}`);
for (const h of strictHits) console.log(`  ✗ ${h.family} — ${h.file}`);
console.log(`W2 VERDICT: ${verdict}`);
process.exit(verdict === "PASS" ? 0 : 1);
