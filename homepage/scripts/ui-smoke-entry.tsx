/* Drives the mounted App. See ui-smoke.mjs for the harness. */

import { act } from "react";
import { createRoot } from "react-dom/client";
import App from "../src/App";
import { LEARNING_STAGES } from "../src/data/copy";
import { SUBJECTS } from "../src/data/subjects";

type Check = (name: string, ok: boolean, detail?: string) => void;

let doc: Document;
let win: Window & typeof globalThis;

const q = <T extends Element = Element>(sel: string, root: Element | Document = doc) =>
  root.querySelector<T>(sel);
const qa = <T extends Element = Element>(sel: string, root: Element | Document = doc) =>
  Array.from(root.querySelectorAll<T>(sel));
const byText = (sel: string, needle: string, root: Element | Document = doc) =>
  qa<HTMLElement>(sel, root).find((el) => (el.textContent ?? "").includes(needle));

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function click(el: Element | null | undefined) {
  if (!el) throw new Error("click() called with no element");
  await act(async () => {
    el.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
  });
}

async function key(k: string, target: Element | Document = doc) {
  await act(async () => {
    target.dispatchEvent(
      new win.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }),
    );
  });
}

async function setInput(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    win.HTMLInputElement.prototype,
    "value",
  )!.set!;
  await act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new win.Event("input", { bubbles: true }));
  });
}

const dialog = () => q<HTMLElement>('[role="dialog"]');
const feedback = () => dialog()?.querySelector('[role="status"]')?.textContent ?? "";

export async function run(check: Check, window: Window & typeof globalThis) {
  win = window;
  doc = window.document;

  const container = doc.getElementById("root")!;
  const root = createRoot(container);

  await act(async () => {
    root.render(<App />);
  });
  await flush();

  /* ── 1. the page renders ────────────────────────────────────────────── */
  check(
    "hero headline renders",
    q("#hero-heading")?.textContent === "Learning, in a place of its own.",
    q("#hero-heading")?.textContent ?? "missing",
  );
  check(
    "hero body names all six subjects",
    SUBJECTS.every((s) => q("main")?.textContent?.includes(s.name)),
  );
  check(
    "introduction heading renders",
    q("#approach-heading")?.textContent === "One academy. Six ways to explore.",
  );
  check(
    "learning experience heading renders",
    q("#experience-heading")?.textContent === "From curiosity to understanding.",
  );
  check(
    "final call to action renders",
    q("#final-heading")?.textContent === "Find your subject. Start exploring.",
  );
  check(
    "three feature cards render",
    qa("article[aria-labelledby^='card-']").length === 3,
  );

  /* ── 2. navigation ──────────────────────────────────────────────────── */
  const navLinks = qa<HTMLAnchorElement>('nav[aria-label="Primary"] a');
  check(
    "desktop nav lists Subjects / Our approach / Learning experience",
    navLinks.map((a) => a.textContent).join("|") ===
      "Subjects|Our approach|Learning experience",
    navLinks.map((a) => a.textContent).join("|"),
  );
  check(
    "nav primary action is 'Explore subjects'",
    Boolean(byText("header button", "Explore subjects")),
  );
  const anchors = ["#subjects", "#approach", "#experience"];
  check(
    "footer links resolve to real section ids",
    anchors.every(
      (a) =>
        Boolean(byText('footer a', a.slice(1) === "subjects" ? "Subjects" : a.slice(1))) &&
        Boolean(doc.getElementById(a.slice(1))),
    ),
  );

  // Mobile disclosure
  const toggle = q<HTMLButtonElement>('button[aria-controls="ta-mobile-menu"]');
  check("mobile menu toggle is present", Boolean(toggle));
  check("mobile menu is closed initially", toggle?.getAttribute("aria-expanded") === "false");
  await click(toggle);
  check("mobile menu opens", Boolean(doc.getElementById("ta-mobile-menu")));
  check(
    "mobile menu toggle reports expanded",
    toggle?.getAttribute("aria-expanded") === "true",
  );
  await key("Escape");
  check("Escape closes the mobile menu", !doc.getElementById("ta-mobile-menu"));

  /* ── 3. WebGL fallback ──────────────────────────────────────────────── */
  const windows = qa("[data-sculpture-window]");
  check(
    "3D windows are declared for hero, feature card, experience and emblem",
    windows.length === 4,
    `${windows.length} found`,
  );
  check(
    "every window carries a composition when the live sculpture is off",
    windows.length > 0 && windows.every((w) => w.querySelector("svg")),
    `${windows.filter((w) => w.querySelector("svg")).length}/${windows.length}`,
  );
  check(
    "no canvas is mounted when WebGL is unavailable",
    qa("canvas").length === 0,
  );

  /* ── 4. every subject panel opens and is honest about being a preview ── */
  const cards = qa<HTMLButtonElement>('button[aria-haspopup="dialog"]');
  check("six subject cards render", cards.length === 6, `${cards.length} found`);
  check(
    "each card is labelled with its subject",
    SUBJECTS.every((s, i) => cards[i]?.textContent?.includes(s.name)),
  );
  check(
    "every card advertises a distinct motif",
    new Set(SUBJECTS.map((s) => s.motif)).size === 6,
  );

  for (const subject of SUBJECTS) {
    const index = SUBJECTS.findIndex((s) => s.id === subject.id);
    await click(cards[index]);
    const d = dialog();
    check(
      `${subject.name}: panel opens as a modal dialog`,
      d?.getAttribute("aria-modal") === "true" &&
        d?.querySelector("#subject-dialog-title")?.textContent === subject.name,
    );
    check(
      `${subject.name}: introduction shown`,
      Boolean(d?.textContent?.includes(subject.intro.slice(0, 40))),
    );
    const topics = subject.topics.map((t) =>
      Boolean(d?.textContent?.includes(t.title)),
    );
    check(`${subject.name}: all three example topics listed`, topics.every(Boolean));
    check(
      `${subject.name}: labelled as preview material`,
      Boolean(d?.textContent?.includes("Preview material")),
    );
    check(
      `${subject.name}: a working practice interaction is present`,
      Boolean(d?.querySelector("[data-practice]")) &&
        Boolean(byText("button", "Check", d!)),
    );

    await runInteraction(check, subject.id);

    await key("Escape");
    check(`${subject.name}: Escape closes the panel`, !dialog());
  }

  /* ── 5. learning stages ─────────────────────────────────────────────── */
  const tabs = qa<HTMLButtonElement>('[role="tab"]');
  check("three learning stages are selectable", tabs.length === 3);
  for (let i = 0; i < LEARNING_STAGES.length; i += 1) {
    await click(tabs[i]);
    const panel = q<HTMLElement>('[role="tabpanel"]');
    check(
      `${LEARNING_STAGES[i]!.label} stage explains itself`,
      Boolean(
        panel?.textContent?.includes(LEARNING_STAGES[i]!.heading) &&
          panel?.textContent?.includes(LEARNING_STAGES[i]!.detail[0]!),
      ),
    );
    check(
      `${LEARNING_STAGES[i]!.label} stage is announced as selected`,
      tabs[i]?.getAttribute("aria-selected") === "true",
    );
  }

  /* ── 6. the sample question in the experience section answers ───────── */
  const experienceSection = doc.getElementById("experience")!;
  const expInput = q<HTMLInputElement>("input", experienceSection);
  const expCheck = byText("button", "Check answer", experienceSection);
  if (expInput && expCheck) {
    await setInput(expInput, "12");
    await click(expCheck);
    check(
      "sample question rejects a wrong answer",
      experienceSection.textContent?.includes("Not yet.") ?? false,
    );
    await setInput(expInput, "72");
    await click(expCheck);
    check(
      "sample question accepts 72 km/h and shows the working",
      (experienceSection.textContent?.includes("Correct.") ?? false) &&
        (experienceSection.textContent?.includes("90 ÷ 1.25") ?? false),
    );
  } else {
    check("sample question input is present", false, "input or check button missing");
  }
  await act(async () => {
    root.unmount();
  });
}

/* ── per-subject interaction drivers ─────────────────────────────────── */

async function runInteraction(check: Check, id: string) {
  const d = dialog()!;
  const subject = SUBJECTS.find((s) => s.id === id)!;
  const spec = subject.interaction;

  if (spec.kind === "numeric") {
    const block = q<HTMLElement>('[data-practice="numeric"]', d)!;
    const input = q<HTMLInputElement>("input", block)!;
    const button = byText("button", "Check answer", block)!;
    await setInput(input, String(spec.answer + 1000));
    await click(button);
    check(
      `${subject.name}: wrong numeric answer is rejected`,
      feedback().includes("Not yet."),
      feedback(),
    );
    await setInput(input, String(spec.answer));
    await click(button);
    check(
      `${subject.name}: correct numeric answer is accepted with the working`,
      feedback().includes("Correct.") && feedback().includes(spec.work.slice(0, 20)),
      feedback(),
    );
    await click(byText("button", "Reset", block)!);
    check(
      `${subject.name}: reset clears the feedback`,
      !block.querySelector('[role="status"]'),
    );
    return;
  }

  if (spec.kind === "choice") {
    const wrong = spec.options.find((o) => o.id !== spec.answer)!;
    const right = spec.options.find((o) => o.id === spec.answer)!;
    const block = q<HTMLElement>('[data-practice="choice"]', d)!;
    await click(byText("label", wrong.label, block)!);
    await click(byText("button", "Check answer", block)!);
    check(
      `${subject.name}: wrong choice is rejected`,
      feedback().includes("Not yet."),
      feedback(),
    );
    await click(byText("label", right.label, block)!);
    await click(byText("button", "Check answer", block)!);
    check(
      `${subject.name}: correct choice is accepted with the explanation`,
      feedback().includes("Correct.") && feedback().includes(spec.work.slice(0, 20)),
      feedback(),
    );
    return;
  }

  if (spec.kind === "sequence") {
    const block = q<HTMLElement>('[data-practice="sequence"]', d)!;
    const rows = () => qa<HTMLElement>("ol > li", block);
    const orderOf = () =>
      rows().map((li) => li.querySelector("span > span")?.textContent?.trim() ?? "");
    const labelToId = new Map(spec.items.map((i) => [i.label, i.id]));

    await click(byText("button", "Check order", block)!);
    const initial = orderOf().map((l) => labelToId.get(l));
    check(
      `${subject.name}: the shipped (out-of-order) list is rejected`,
      initial.join(",") !== spec.answer.join(",") &&
        feedback().includes("Not yet."),
      `order ${initial.join(",")} · ${feedback()}`,
    );

    // Sort it with the same buttons a keyboard user would press.
    for (let target = 0; target < spec.answer.length; target += 1) {
      const wanted = spec.answer[target]!;
      for (let guard = 0; guard < 12; guard += 1) {
        const at = orderOf().findIndex((l) => labelToId.get(l) === wanted);
        if (at === target) break;
        const direction = at > target ? "Move" : "Move";
        const row = rows()[at]!;
        const buttons = qa<HTMLButtonElement>("button", row);
        // First button moves the row up, second moves it down.
        await click(at > target ? buttons[0] : buttons[1]);
        void direction;
      }
    }
    await click(byText("button", "Check order", block)!);
    check(
      `${subject.name}: the corrected order is accepted`,
      feedback().includes("Correct.") && feedback().includes(spec.work.slice(0, 20)),
      `${feedback()} · order ${orderOf().join(" → ")}`,
    );
    return;
  }

  // match
  const matchBlock = q<HTMLElement>('[data-practice="match"]', d)!;
  const assign = async (mapping: ReadonlyArray<readonly [string, string]>) => {
    for (const [left, right] of mapping) {
      await click(byText("button", left, matchBlock)!);
      const unit = qa<HTMLButtonElement>("button", matchBlock).find(
        (b) => b.textContent?.trim() === right,
      );
      await click(unit!);
    }
  };

  const rotated = spec.pairs.map((p, i) => [
    p.left,
    spec.pairs[(i + 1) % spec.pairs.length]!.right,
  ] as const);
  await assign(rotated);
  await click(byText("button", "Check pairs", matchBlock)!);
  check(
    `${subject.name}: mismatched pairs are rejected`,
    feedback().includes("Not yet."),
    feedback(),
  );

  await click(byText("button", "Reset", matchBlock)!);
  await assign(spec.pairs.map((p) => [p.left, p.right] as const));
  await click(byText("button", "Check pairs", matchBlock)!);
  check(
    `${subject.name}: correctly matched pairs are accepted`,
    feedback().includes("Correct.") && feedback().includes(spec.work.slice(0, 20)),
    feedback(),
  );
}
