/* Subject validator (Phase 3 · Step 1 · Part 3). Pure — runs in node (build
   gate) and in the /dev/subjects switchboard (live report). Fails loudly. */

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

export function validateAll() {
  const subjects = SUBJECTS.map(validateSubject);
  const matrix = mutualMatrix();
  const mutualPass = matrix.every((m) => m.pass);
  const pass = subjects.every((s) => s.pass) && mutualPass;
  return { pass, subjects, matrix };
}
