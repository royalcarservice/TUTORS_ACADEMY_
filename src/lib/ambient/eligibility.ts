/* ════════════════════════════════════════════════════════════════════════
   AMBIENT ELIGIBILITY + BATTERY AWARENESS (Step 5)

   Off by default on small screens and on low-power / limited-capability
   devices. The exact signals + thresholds live here and are printed on the
   specimen, so the decision is evidence, not vibes.

   Signals used:
     · prefers-reduced-motion      → OFF (layer completely off; SVG stands in)
     · viewport width < 768        → OFF (small screen)
     · no WebGL context            → OFF (SVG substrate is the baseline)
     · hardwareConcurrency <= 4    → OFF (limited capability)
     · deviceMemory <= 4 (if rep.) → OFF (low memory)
     · battery level < 0.25 and not charging (if reportable) → OFF (low power)
   Everything else → ON (desktop-class), subject to the session tier.
   ════════════════════════════════════════════════════════════════════════ */

export interface AmbientSignals {
  reducedMotion: boolean;
  smallScreen: boolean;
  webgl: boolean;
  cores: number;
  deviceMemory: number | null;
  lowPower: boolean;
  battery: string;
}

export function gatherSignals(): AmbientSignals {
  const nav = navigator as Navigator & { deviceMemory?: number; getBattery?: () => Promise<BatteryLike> };
  const reduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.getAttribute("data-reduced-motion") === "on";
  const webgl = (() => {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  })();
  return {
    reducedMotion: !!reduced,
    smallScreen: window.innerWidth < 768,
    webgl,
    cores: nav.hardwareConcurrency || 4,
    deviceMemory: nav.deviceMemory ?? null,
    lowPower: false, // filled async where battery is reportable
    battery: "n/a",
  };
}

interface BatteryLike {
  level: number;
  charging: boolean;
}

export async function withBattery(s: AmbientSignals): Promise<AmbientSignals> {
  const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike> };
  if (typeof nav.getBattery === "function") {
    try {
      const b = await nav.getBattery();
      const low = b.level < 0.25 && !b.charging;
      return { ...s, lowPower: low, battery: `${Math.round(b.level * 100)}% ${b.charging ? "charging" : "discharging"}` };
    } catch {
      return s;
    }
  }
  return s;
}

export interface AmbientDecision {
  on: boolean;
  reasons: string[];
}

export function decideAmbient(s: AmbientSignals, forced: boolean | null): AmbientDecision {
  const reasons: string[] = [];
  if (forced !== null) {
    reasons.push(`forced ${forced ? "on" : "off"} by specimen`);
    return { on: forced, reasons };
  }
  if (s.reducedMotion) return { on: false, reasons: ["prefers-reduced-motion → ambient completely off"] };
  if (s.smallScreen) return { on: false, reasons: ["small screen (<768px) → off by default"] };
  if (!s.webgl) return { on: false, reasons: ["no WebGL → SVG substrate is the baseline"] };
  if (s.cores <= 4) return { on: false, reasons: [`hardwareConcurrency ${s.cores} ≤ 4 → limited capability, off`] };
  if (s.deviceMemory !== null && s.deviceMemory <= 4) return { on: false, reasons: [`deviceMemory ${s.deviceMemory} ≤ 4 → off`] };
  if (s.lowPower) return { on: false, reasons: [`battery ${s.battery} → low power, off`] };
  reasons.push("desktop-class, WebGL available, motion allowed → on");
  return { on: true, reasons };
}
