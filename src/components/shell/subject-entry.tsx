"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* ENVIRONMENT SHELL — ENTRY SEMANTICS (Phase 3 · Step 6 · Part 4)
 *
 * Lives in src/app/subjects/layout.tsx so it PERSISTS across client-side
 * navigation between subject routes.
 *
 *  · DIRECT LOAD  — first render only: nothing is announced, nothing is
 *    focused. NO FOCUS THEFT ON FIRST PAINT. The server-rendered state simply
 *    arrives correct.
 *  · CLIENT-SIDE NAVIGATION (Link or back/forward) — the pathname effect runs
 *    after the new page's DOM commits: the identity heading receives focus
 *    (navigation-triggered entry) and the polite 3.4 announcement fires
 *    EXACTLY ONCE ("Now entering {name} — {tagline}"), read from the
 *    server-rendered heading attributes (no config import — 3.1 guard).
 *  · The route integration runs the switch at its INSTANT-tier semantics
 *    (state swap + single announcement + focus, no motion) — the full
 *    PREPARE→TRANSFER ceremony stays where the switch owns a surface
 *    (/dev/switch, and the Phase 4 chooser). Reduced motion therefore changes
 *    nothing here: there is no motion to remove.
 *  · STRUCTURAL ENFORCEMENT, checked at runtime: a Room can never contain a
 *    Stage, and a Room can never hold a canvas. Violations log an error.
 *
 * The announcement is written straight to the live region's textContent (no
 * state) — aria-live announces DOM changes, and nothing re-renders.
 */

const SUBJECT_RE = /^\/subjects\/([^/]+)$/;

function assertContainment() {
  const stageInRoom = document.querySelectorAll('[data-spatial="room"] [data-spatial="stage"]').length;
  const canvasInRoom = document.querySelectorAll('[data-spatial="room"] canvas').length;
  if (stageInRoom || canvasInRoom) {
    console.error("[shell] Room containment violated", { stageInRoom, canvasInRoom });
  }
}

export function SubjectEntry() {
  const pathname = usePathname();
  const first = useRef(true);
  const prev = useRef<string | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  /* Direct load: verify structure only. No announcement, no focus. */
  useEffect(() => {
    assertContainment();
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      prev.current = pathname;
      return; // direct load — announce nothing
    }
    if (prev.current === pathname) return;
    prev.current = pathname;

    assertContainment();

    const m = SUBJECT_RE.exec(pathname ?? "");
    if (!m) return; // leaving the subject environment (e.g. /subjects index)

    const h = document.getElementById("subject-heading") as HTMLHeadingElement | null;
    if (!h) return;
    const name = h.getAttribute("data-subject-name") ?? m[1];
    const tagline = h.getAttribute("data-subject-tagline") ?? "";
    if (liveRef.current) liveRef.current.textContent = `Now entering ${name} — ${tagline}`;
    h.focus();
  }, [pathname]);

  return (
    <div
      ref={liveRef}
      aria-live="polite"
      role="status"
      data-shell-announce
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    />
  );
}
