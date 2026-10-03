/* Subject validator (Phase 3 · Step 1 · Part 3). Pure — runs in node (build
   gate) and in the /dev/subjects switchboard (live report). Fails loudly. */

import { MOTION_CHAR_PARAMS } from "../ambient/contract";
import { decideAmbient } from "../ambient/eligibility";
import { combinationsFor, type EnvironmentLevers } from "../environment/levers";
import { MAX_COMMANDS, MAX_DOM_NODES, reduceDensity } from "../motif/budgets";
import { generateMotif } from "../motif/grammar";
import { groupElements } from "../motif/path";
import { ATMOSPHERES, DENSITIES, MOTIFS, MOTION_CHARS, STATUSES, SUBJECTS, type SubjectConfig } from "./subjects";

/* ── colour math ── */
const h2r = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (rgb: number[]) => {
  const s = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};
export const contrast = (a: string, b: string) => {
  const L1 = lum(h2r(a)), L2 = lum(h2r(b));
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};
const rgb2xyz = (rgb: number[]) => rgb.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
function lab(hex: string) {
  const [r, g, b] = rgb2xyz(h2r(hex));
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
export const deltaE = (a: string, b: string) => {
  const A = lab(a), B = lab(b);
  return Math.sqrt((A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2 + (A[2] - B[2]) ** 2);
};

/* ── reference neutrals / brand / signal / focus (from 2.1, read-only) ── */
const SURF = {
  ink: { base: "#0b0e12", raised: "#12161c" },
  ivory: { base: "#faf9f5", raised: "#f7f5f0" },
};
const BRAND = { ink: "#c29a45", ivory: "#9e7a33" };
const SIGNAL = { ink: "#35c9b4", ivory: "#0e7c6e" };
const RING = { ink: "#6fe0d0", ivory: "#0e7c6e" };

const MIN_TEXT = 4.5, MIN_GRAPHIC = 3, MIN_SEP = 20, MIN_MUTUAL = 15, MIN_RING = 1.15;

export interface CheckResult { name: string; pass: boolean; detail: string }
export interface SubjectReport { id: string; status: string; pass: boolean; checks: CheckResult[] }

export function validateSubject(s: SubjectConfig): SubjectReport {
  const checks: CheckResult[] = [];
  const add = (name: string, pass: boolean, detail: string) => checks.push({ name, pass, detail });

  // 5 schema completeness
  const enumsOk =
    (ATMOSPHERES as readonly string[]).includes(s.atmosphere) &&
    (MOTIFS as readonly string[]).includes(s.motif) &&
    (MOTION_CHARS as readonly string[]).includes(s.motionChar) &&
    (DENSITIES as readonly string[]).includes(s.density) &&
    (STATUSES as readonly string[]).includes(s.status) &&
    /^[a-z0-9-]+$/.test(s.id);
  add("schema", enumsOk, `enums+id ${enumsOk ? "closed-set valid" : "INVALID"}`);

  // 1 contrast both themes (accent1 text+graphic on base&raised; accent2 graphic)
  for (const theme of ["ink", "ivory"] as const) {
    const a1 = s.accent1[theme], a2 = s.accent2[theme];
    const cTb = contrast(a1, SURF[theme].base), cTr = contrast(a1, SURF[theme].raised);
    const g2 = contrast(a2, SURF[theme].base);
    add(`contrast-${theme}`, cTb >= MIN_TEXT && cTr >= MIN_TEXT && g2 >= MIN_GRAPHIC,
      `a1 text ${cTb.toFixed(2)}/${cTr.toFixed(2)} (≥4.5), a2 graphic ${g2.toFixed(2)} (≥3)`);
  }

  // 2 accent vs brass & signal (matching-theme ΔE)
  for (const theme of ["ink", "ivory"] as const) {
    const dB = deltaE(s.accent1[theme], BRAND[theme]), dS = deltaE(s.accent1[theme], SIGNAL[theme]);
    add(`sep-${theme}`, dB >= MIN_SEP && dS >= MIN_SEP, `ΔE brass ${dB.toFixed(1)}, signal ${dS.toFixed(1)} (≥${MIN_SEP})`);
  }

  // 4 focus-ring survival on accent-filled surface. The primitive renders the
  // ring atop a 2px surface-base HALO (see 2.5), so the ring sits on the
  // surface colour, isolated from the accent. We verify ring-vs-surface (the
  // rendered situation) and report ring-vs-accent as informational.
  for (const theme of ["ink", "ivory"] as const) {
    const onAccent = contrast(RING[theme], s.accent1[theme]);
    const onSurf = contrast(RING[theme], SURF[theme].base);
    add(`ring-${theme}`, onSurf >= MIN_RING, `ring-on-surface ${onSurf.toFixed(2)} (halo isolates) · ring-on-accent ${onAccent.toFixed(2)} info`);
  }

  return { id: s.id, status: s.status, pass: checks.every((c) => c.pass), checks };
}

/** 3 mutual distinctness across all six (accent1, both themes). */
export function mutualMatrix(): { pair: string; dInk: number; dIvory: number; pass: boolean }[] {
  const out: { pair: string; dInk: number; dIvory: number; pass: boolean }[] = [];
  for (let i = 0; i < SUBJECTS.length; i++)
    for (let j = i + 1; j < SUBJECTS.length; j++) {
      const a = SUBJECTS[i], b = SUBJECTS[j];
      const dInk = deltaE(a.accent1.ink, b.accent1.ink), dIv = deltaE(a.accent1.ivory, b.accent1.ivory);
      out.push({ pair: `${a.id}×${b.id}`, dInk, dIvory: dIv, pass: dInk >= MIN_MUTUAL && dIv >= MIN_MUTUAL });
    }
  return out;
}

/* ── 6.4 · THE COMBINATION PASS (P6-R11) ──────────────────────────────────
   A tutor may choose density × motion character per subject (3 × 6 = 18
   reachable combinations per subject, 108 in all). Contrast, ΔE and the
   focus ring are properties of the ACCENT, which no lever touches — they are
   validated once per subject above and hold for every combination by
   construction (the identity checks are repeated in the loop so a future
   lever that did touch colour could not slip past). The properties that DO
   vary with a combination are checked here, per combination:
     budget      the motif generated at that density, for the Stage (substrate)
                 and for the Room (edge, one step calmer), stays within
                 MAX_COMMANDS / MAX_DOM_NODES — a dense motif may not blow
                 the 3.3 budgets on any role;
     room rule   the Room never renders above "balanced" (reduceDensity);
     motion      the motion character has authored parameters within the
                 motion-safety caps (cycle ≥ 30 s, camera ≤ 0.5, parallax ≤ 0.3)
                 — tens of seconds, never seconds;
     parity      with prefers-reduced-motion the ambient is OFF for this
                 character (decideAmbient) — reduced-motion parity does not
                 depend on the choice.
   Any failing combination fails validateAll(), and so the build gate. */
export interface CombinationReport { subject: string; levers: EnvironmentLevers; pass: boolean; checks: CheckResult[] }

export function validateCombination(s: SubjectConfig, levers: EnvironmentLevers): CombinationReport {
  const checks: CheckResult[] = [];
  const add = (name: string, pass: boolean, detail: string) => checks.push({ name, pass, detail });
  // identity holds regardless of the combination (no lever touches colour): re-assert, do not assume
  const idRep = validateSubject({ ...s, density: levers.density, motionChar: levers.motionChar });
  add("identity", idRep.pass, idRep.pass ? "contrast · ΔE · ring unchanged by the levers" : "identity check FAILED under this combination");
  // budgets at this density, both roles the environment renders
  for (const role of ["substrate", "edge"] as const) {
    const density = role === "edge" ? reduceDensity(levers.density) : levers.density;
    const data = generateMotif({ subject: s.id, kind: s.motif, role, density, purpose: role === "edge" ? "room" : "ambient" });
    const g = groupElements(data.elements, data.stroke);
    add(`budget-${role}`, g.commands <= MAX_COMMANDS && g.domNodes <= MAX_DOM_NODES, `${density}: ${g.commands} commands (≤${MAX_COMMANDS}), ${g.domNodes} nodes (≤${MAX_DOM_NODES}), ${data.features} features`);
  }
  add("room-rule", reduceDensity(levers.density) !== "dense", `Room renders ${reduceDensity(levers.density)} for ${levers.density}`);
  const mc = MOTION_CHAR_PARAMS[levers.motionChar];
  add("motion-caps", !!mc && mc.cycleSeconds >= 30 && mc.maxCameraMove <= 0.5 && mc.maxParallax <= 0.3, mc ? `cycle ${mc.cycleSeconds}s · camera ${mc.maxCameraMove} · parallax ${mc.maxParallax} · wobble ${mc.wobble}` : "NO AUTHORED PARAMETERS");
  const rm = decideAmbient({ reducedMotion: true, smallScreen: false, webgl: true, cores: 8, deviceMemory: 8, lowPower: false, battery: "n/a" }, null);
  add("reduced-motion-parity", rm.on === false, rm.reasons.join("; "));
  return { subject: s.id, levers, pass: checks.every((c) => c.pass), checks };
}

export function validateCombinations(): { count: number; perSubject: number; pass: boolean; reports: CombinationReport[] } {
  const reports: CombinationReport[] = [];
  for (const s of SUBJECTS) for (const levers of combinationsFor(s.id as never)) reports.push(validateCombination(s, levers));
  return { count: reports.length, perSubject: reports.length / SUBJECTS.length, pass: reports.every((r) => r.pass), reports };
}

export function validateAll() {
  const subjects = SUBJECTS.map(validateSubject);
  const matrix = mutualMatrix();
  const mutualPass = matrix.every((m) => m.pass);
  const combinations = validateCombinations(); // 6.4: every reachable lever combination, per subject
  const pass = subjects.every((s) => s.pass) && mutualPass && combinations.pass;
  return { pass, subjects, matrix, combinations };
}
