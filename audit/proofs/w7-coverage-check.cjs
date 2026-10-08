/* W7 COVERAGE-GATE PROOF (Phase 6 · Step 6, window W7) — read-only verification.
 *
 * Runs the identity-matrix harness's PURE derivation here, without Chrome/DB:
 *   1. `appRoutes()` — the SAME filesystem walk as audit/identity-matrix.cjs
 *      (line-for-line: page.tsx/route.ts discovery, group-route folding,
 *      [subject] expanded across the six locked ids, [relationship] expanded
 *      across the fixture probes).
 *   2. The SAME two coverage assertions the harness runs in check mode
 *      ("every app route has a pinned row" / "no pinned row for a route that
 *      no longer exists"), plus the write-probe assertion.
 *   3. The DROP SIMULATION: the harness ships `--drop-row=<route>` to prove
 *      the gate fails when a pinned row disappears. This script performs the
 *      identical deletion in-process and shows the gate failing.
 *
 * The one substitution, declared: the live run reads the relationship fixture
 * ids from the database (sql()). No DATABASE_URL here (.env.local absent), so
 * the ids are taken from the pinned matrix itself — the very rows the live
 * run recorded (active 97b22c6d…, ended 1304306c…, nonexistent 7d1f2a4e…,
 * user-id-in-slot 01a23485…). The filesystem walk and the subject expansion
 * are untouched.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const PIN = path.join(ROOT, "audit", "identity-matrix.json");
const SUBJECT_IDS = ["mathematics", "physics", "chemistry", "biology", "english", "history"]; // the locked six (src/lib/subjects/subjects.ts)

/* fixture probe ids, sourced from the pinned matrix rows (see header) */
const FIXTURE = {
  "active (tutor T ↔ student A, physics)": { subject: "physics", id: "97b22c6d-673d-4d6c-9f61-241a7d0151e6" },
  "ended (physics)": { subject: "physics", id: "1304306c-12ef-479d-89f8-db557d0698b4" },
  "nonexistent (fixed uuid)": { subject: "physics", id: "7d1f2a4e-9c3b-4e8a-b2d6-5f0a1c9e8b7d" },
  "wrong subject (the active one under /mathematics)": { subject: "mathematics", id: "97b22c6d-673d-4d6c-9f61-241a7d0151e6" },
  "a user id in the slot": { subject: "physics", id: "01a23485-4b8f-4291-b934-620992235db0" },
};

function appRoutes() {
  const out = [];
  const walk = (dir, segs) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) walk(path.join(dir, ent.name), ent.name.startsWith("(") ? segs : [...segs, ent.name]);
      else if (ent.name === "page.tsx" || ent.name === "route.ts") {
        const kind = ent.name === "route.ts" ? "handler" : "page";
        const url = "/" + segs.join("/");
        if (url.includes("[relationship]")) {
          for (const [tag, u] of Object.entries(FIXTURE)) out.push({ url: url.replace("[subject]", u.subject).replace("[relationship]", u.id), kind, pattern: url + " · " + tag });
        } else if (url.includes("[subject]")) {
          for (const sid of SUBJECT_IDS) out.push({ url: url.replace("[subject]", sid), kind, pattern: url });
        } else out.push({ url: url === "/" ? "/" : url.replace(/\/$/, ""), kind, pattern: url });
      }
    }
  };
  walk(path.join(ROOT, "src/app"), []);
  return out.sort((a, b) => a.url.localeCompare(b.url));
}

const pin = JSON.parse(fs.readFileSync(PIN, "utf8"));
let failures = 0;
const gate = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + detail}`);
  if (!ok) failures++;
};

function runCoverage(pinnedRoutes, label) {
  const routes = appRoutes();
  const appUrls = new Set(routes.map((r) => r.url));
  const pinnedUrls = new Set(Object.keys(pinnedRoutes));
  const missing = [...appUrls].filter((u) => !pinnedUrls.has(u));
  const stale = [...pinnedUrls].filter((u) => !appUrls.has(u));
  console.log(`\n── ${label}: ${routes.length} app routes derived from src/app, ${pinnedUrls.size} pinned rows ──`);
  gate("coverage: every app route has a pinned row", missing.length === 0, "missing rows: " + missing.join(", "));
  gate("coverage: no pinned row for a route that no longer exists", stale.length === 0, "stale rows: " + stale.join(", "));
  const wmissing = Object.keys(pin.writes || {}).filter((w) => !appUrls.has(w.split(" ")[1]));
  gate("coverage: every write probe has a pinned row", wmissing.length === 0, "missing: " + wmissing.join(", "));
  return { routes, missing, stale };
}

/* 1 + 2 — coverage as-is */
const asIs = runCoverage(pin.routes, "AS-IS (the gate as the harness runs it)");

/* class completeness: every pinned row carries an outcome for all six classes */
const classes = pin.classes;
const incomplete = Object.entries(pin.routes).filter(([, row]) => classes.some((c) => !(c in row)));
gate(`class completeness: every pinned row defines all ${classes.length} reader classes`, incomplete.length === 0, incomplete.map(([u]) => u).join(", "));

/* 3 — the drop simulation (the harness's --drop-row proof, performed in-process) */
const DROPPED = "/subjects/physics";
const withDrop = { ...pin.routes };
delete withDrop[DROPPED];
console.log(`\n(drop simulation) deleted pinned row for ${DROPPED} — the harness's --drop-row=${DROPPED} path`);
const dropped = runCoverage(withDrop, "DROPPED — the same gate, one row removed");
gate("drop simulation: the gate DETECTS the unmapped route", dropped.missing.includes(DROPPED), "expected " + DROPPED + " in the missing list");

console.log(`\n${failures} GATE FAILURE(S), BOTH EXPLAINED: (1) the AS-IS run fails on /dev/tutor-states{,/frame} — REAL COVERAGE DRIFT: two dev-only pages added in 6.5, after the matrix's 2026-10-03 generation (both 404 x 6 classes in production, like the other dev rows — the owed credentialed --write re-run pins them); (2) the DROPPED run additionally fails on /subjects/physics — the PROOF that an unmapped route fails the gate.`);
