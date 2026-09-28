/* DEV-ONLY MEASUREMENT HARNESS for /dev/motifs.
   Not a component, not shipped to any product surface.

   It mirrors the TOKEN HEXES from src/app/globals.css so contrast can be
   computed numerically. !! SYNC PAIR !! — if a token hex changes in
   globals.css, this mirror must change too; the specimen prints the values it
   used, so a drift is visible rather than silent.

   No colour is added to the design system here: these numbers exist only to
   MEASURE the ceilings the grammar declares.                                    */

import { generateMotif, type GenerateOptions } from "@/lib/motif/grammar";
import { groupElements } from "@/lib/motif/path";

export interface Hex {
  dark: string;
  light: string;
}

export const SURFACE: Record<"base" | "raised" | "sunken", Hex> = {
  base: { dark: "#0b0e12", light: "#faf9f5" }, // --ta-surface-base
  raised: { dark: "#12161c", light: "#f7f5f0" }, // --ta-surface-raised
  sunken: { dark: "#07090b", light: "#e2dcd1" }, // --ta-surface-sunken
};

export const TEXT: Record<"primary" | "secondary" | "muted", Hex> = {
  primary: { dark: "#f7f5f0", light: "#0b0e12" }, // --ta-text-primary
  secondary: { dark: "#efebe3", light: "#1a1f27" }, // --ta-text-secondary
  muted: { dark: "#9aa4b0", light: "#3e4753" }, // --ta-text-muted
};

const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/** Source-over alpha composite: what the pixel actually is under a motif. */
export function blend(fg: string, bg: string, alpha: number): string {
  const f = rgb(fg);
  const b = rgb(bg);
  return (
    "#" +
    f
      .map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)))
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/* ── determinism: generate N times, compare every fingerprint ─────────── */

export interface DeterminismResult {
  runs: number;
  identical: boolean;
  hash: string;
}

export function determinism(opts: GenerateOptions, runs = 100): DeterminismResult {
  let hash = "";
  let identical = true;
  for (let i = 0; i < runs; i++) {
    const h = generateMotif(opts).hash;
    if (i === 0) hash = h;
    else if (h !== hash) identical = false;
  }
  return { runs, identical, hash };
}

/* ── budget: exactly what the renderer will emit ──────────────────────── */

export interface BudgetResult {
  elements: number;
  domNodes: number;
  commands: number;
  ms: number;
}

export function budget(opts: GenerateOptions, masked: boolean): BudgetResult {
  const t0 = performance.now();
  const data = generateMotif(opts);
  const t1 = performance.now();
  const geo = groupElements(data.elements, data.stroke);
  return {
    elements: data.elements.length,
    domNodes: geo.domNodes + (masked ? 3 : 1),
    commands: geo.commands,
    ms: Math.round((t1 - t0) * 1000) / 1000,
  };
}
