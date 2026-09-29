import Link from "next/link";

/* THE HONEST PAGE (Phase 5 · Step 7 · Part 2) — the ONE shape every
 * page-scope failure takes: the brand frame, ONE h1, ONE sentence, ONE
 * action. Same typography as the primary surface (display face for the
 * heading, secondary text for the sentence, the existing button primitive
 * for the action). No colour of alarm, no icon, no numeral, no panel, no
 * second list of destinations — a failure page is not a second homepage.
 * Subject rule (P5-R8.3): the sentence's subject is the page/the environment/
 * the sign-in, never the student. Copy lives in docs/STATE_LANGUAGE.md.
 * Plain server-safe component (no hooks) so error.tsx (client) and
 * not-found.tsx (server) render the identical element. */

export interface HonestPageProps {
  eyebrow: string;
  heading: string;
  sentence: string;
  action: { label: string; href: string };
  /** a stable name for harnesses; never shown */
  state: string;
  /** true when the parent layout already provides the content container (the student segment) */
  bare?: boolean;
}

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 };

export function HonestPage({ eyebrow, heading, sentence, action, state, bare = false }: HonestPageProps) {
  return (
    <section aria-labelledby="honest-heading" data-state-page={state} className={bare ? undefined : "ta-container ta-container--content"} style={{ paddingBlock: bare ? "var(--ta-space-10) 0" : "var(--ta-space-16) var(--ta-space-section)" }}>
      <p style={MONO}>{eyebrow}</p>
      <h1 id="honest-heading" style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--ta-text-primary)", textWrap: "balance" }}>
        {heading}
      </h1>
      <p style={{ margin: "var(--ta-space-4) 0 0", fontSize: "var(--ta-text-base)", lineHeight: 1.55, color: "var(--ta-text-secondary)", maxWidth: "36rem" }}>{sentence}</p>
      <div style={{ marginTop: "var(--ta-space-6)" }}>
        {/* A plain anchor, not a client-side reset: a GET of the destination re-reads the truth from the server (P5-R8.5 — the retry is a read, so it is safe). */}
        <Link href={action.href} className="ta-btn" data-variant="primary" data-size="lg" data-primary-action style={{ minWidth: "12rem" }}>
          {action.label}
        </Link>
      </div>
    </section>
  );
}
