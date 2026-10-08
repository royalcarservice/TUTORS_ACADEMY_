/* ════════════════════════════════════════════════════════════════════════
   UI SMOKE TEST — mounts the real App in jsdom and drives it

   Verifies what the sculpture test cannot: that the page renders, that every
   subject panel opens and answers, that all four practice interactions give
   correct feedback for a right and a wrong answer, that the learning stages
   switch, and that the keyboard paths (mobile menu, Escape) work.

   jsdom has no WebGL, so `detectWebGL()` returns false and the run also
   exercises the static-fallback branch the shipped page uses on unsupported
   browsers.

   Run: npm run smoke:ui
   ════════════════════════════════════════════════════════════════════════ */

import { JSDOM } from "jsdom";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { transpileTree } from "./lib-transpile.mjs";

const REDUCED = process.argv.includes("--reduced-motion");

/* ── DOM ──────────────────────────────────────────────────────────────── */

const dom = new JSDOM(
  `<!doctype html><html lang="en"><body><div id="root"></div></body></html>`,
  { url: "http://localhost/", pretendToBeVisual: true },
);

const { window } = dom;

// jsdom has no WebGL: getContext returns null, exactly the unsupported case.
window.HTMLCanvasElement.prototype.getContext = () => null;

class StubObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver = StubObserver;
window.ResizeObserver = StubObserver;

const realMatchMedia = window.matchMedia?.bind(window);
window.matchMedia = (query) => {
  const reducedQuery = /prefers-reduced-motion/.test(query);
  const compactQuery = /max-width/.test(query);
  return {
    media: query,
    matches: reducedQuery ? REDUCED : compactQuery ? false : false,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  };
};
void realMatchMedia;

// Node 22 ships its own Event / CustomEvent / EventTarget, and jsdom refuses
// to accept those instances — so these three are overwritten unconditionally.
const forced = ["Event", "CustomEvent", "EventTarget", "AbortController", "DOMRect"];
const lazy = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLButtonElement",
  "Element",
  "Node",
  "MouseEvent",
  "KeyboardEvent",
  "PointerEvent",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "IntersectionObserver",
  "ResizeObserver",
  "matchMedia",
  "SVGElement",
];
for (const key of forced) globalThis[key] = window[key];
for (const key of lazy) {
  if (globalThis[key] === undefined) globalThis[key] = window[key];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

/* ── app ──────────────────────────────────────────────────────────────── */

const out = transpileTree({
  root: process.cwd(),
  sources: ["src", "scripts/ui-smoke-entry.tsx"],
  out: join(process.cwd(), "node_modules", ".ui-smoke"),
  skip: ["main.tsx"],
});

const entry = await import(pathToFileURL(join(out, "scripts/ui-smoke-entry.mjs")).href);

let failures = 0;
const check = (name, ok, detail = "") => {
  if (ok) console.log(`  ok   ${name}`);
  else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

console.log(
  `\nTutors Academy — UI (jsdom${REDUCED ? ", prefers-reduced-motion" : ""})\n`,
);

try {
  await entry.run(check, window);
} catch (err) {
  failures += 1;
  console.log(`  FAIL the page threw during the run — ${err?.stack ?? err}`);
}

// jsdom's pretendToBeVisual keeps a rAF loop alive, so the process would never
// exit on its own.
dom.window.close();

if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll UI checks passed.\n");
process.exit(0);
