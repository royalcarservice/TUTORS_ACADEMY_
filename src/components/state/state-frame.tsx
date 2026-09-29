import Link from "next/link";

import { BrandMark } from "@/components/brand/brand";

/* THE STATE FRAME (Phase 5 · Step 7 · Part 2): the brand frame for the ROOT
 * boundaries (404 and error), where no segment layout is rendering. The
 * brand mark as a ≥44×44 link home, a hairline, one <main>. Deliberately
 * NOT the nav shell: a root boundary ships with EVERY route, and a second
 * copy of the nav shell in that chunk cost 20 KB on every page (measured);
 * a failure page needs one way onward, and the honest page carries it. */
export function StateFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header style={{ borderBottom: "1px solid var(--ta-border-subtle)" }}>
        <div className="ta-container ta-container--wide" style={{ display: "flex", alignItems: "center", paddingBlock: "var(--ta-space-3)" }}>
          <Link href="/" aria-label="Tutors Academy home" style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-min)", minWidth: "var(--ta-target-min)", paddingInline: "var(--ta-space-2)", marginInline: "calc(-1 * var(--ta-space-2))", borderRadius: "var(--ta-radius-2)" }}>
            <BrandMark size={28} variant="brass" title="Tutors Academy" />
          </Link>
        </div>
      </header>
      <main id="main" style={{ flex: 1 }}>{children}</main>
    </>
  );
}
