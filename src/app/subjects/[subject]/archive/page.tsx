import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ArtifactShelf } from "@/components/archive/artifact-shelf";
import { SubjectMark } from "@/components/brand/subject-mark";
import { Room } from "@/components/motif/stage";
import { environmentName } from "@/components/spine/scenes/choice";
import { fetchSubjectArchive } from "@/lib/archive/data";
import { getIdentity } from "@/lib/auth/session";
import { getEnvironmentSettings } from "@/lib/environment/settings";
import { getEnrolledSubjectIds } from "@/lib/student/data";
import type { SubjectId } from "@/lib/student/contract";
import { getSubject } from "@/lib/subjects/subjects";
import { getTutorSubjectIds } from "@/lib/tutor/data";

/* /subjects/[subject]/archive — THE SUBJECT ARCHIVE (Phase 8 · Step 2, DEC-030)
 *
 * The asynchronous study archive: what a session leaves behind once it has
 * concluded — the board as it stood, the tutor's notation, the chamber's
 * audio — read like a library shelf, never like a feed. Server-rendered
 * complete with NO client JavaScript: identity, the archive's facts and the
 * shelf all arrive in the HTML. The media viewer island mounts only when a
 * recording exists to play and a wiring step is ruled (DEC-030) — nothing
 * here pretends to stream, and nothing counts a viewing: ZERO ENGAGEMENT
 * METRICS BY CONSTRUCTION (DEC-029).
 *
 * WHO MAY STAND HERE — decided server-side, one fact at a time (the live
 * chamber's gate, carried over unchanged, DEC-026):
 *   · no identity            → the login door, back here after;
 *   · student, enrolled      → admitted (enrolment is the standing boundary);
 *   · tutor, ACTIVE RELATIONSHIP in the subject → admitted;
 *   · anyone else            → the framework 404 — the SAME bytes an unknown
 *                              subject gets, so the route enumerates nothing.
 * Draft subjects keep the environment's guard (5.3).
 *
 * THE ARCHIVE READ IS PRIMARY: unlike the chamber's supplemental session
 * facts, the shelf IS the page's answer — a failed read fails the page
 * honestly (error boundary) rather than standing behind a sentence that says
 * "yet". An UNCONFIGURED identity (no credentials) is not a failure: the
 * data layer answers an honest empty shelf, and the shelf says so.
 *
 * LAYOUT — DEC-026's ruling carries: the standing subjects layout
 * (src/app/subjects/layout.tsx) already supplies the chrome, so this route
 * adds NO layout.tsx of its own.
 */

interface Params {
  params: Promise<{ subject: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subject } = await params;
  const s = getSubject(subject);
  if (!s) return {};
  return { title: `${s.name} — archive` };
}

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export default async function SubjectArchivePage({ params }: Params) {
  const { subject } = await params;
  const s = getSubject(subject);

  /* UNKNOWN OR INVALID SUBJECT → the framework 404, same as the environment. */
  if (!s) notFound();

  const identity = await getIdentity();
  if (!identity) redirect(`/login?next=${encodeURIComponent(`/subjects/${subject}/archive`)}`);

  const prod = process.env.NODE_ENV === "production";
  const [enrolled, related] = await Promise.all([
    identity.role === "student" ? getEnrolledSubjectIds() : Promise.resolve(new Set<string>()),
    identity.role === "tutor" ? getTutorSubjectIds() : Promise.resolve(new Set<SubjectId>()),
  ]);
  const isEnrolled = enrolled.has(s.id);
  const isRelated = related.has(s.id as SubjectId);

  /* DRAFT GUARD AT THE ROUTE — the environment's rule, unchanged (5.3). */
  if (s.status === "draft" && prod && !isEnrolled && !isRelated) notFound();

  /* ACCESS — a student stands here by enrolment, a tutor by relationship;
     anyone else receives the same 404 an unknown subject gets. */
  const viewer: "student" | "tutor" | null =
    identity.role === "student" && isEnrolled ? "student" : identity.role === "tutor" && isRelated ? "tutor" : null;
  if (!viewer) notFound();

  /* The room's levers, read exactly as the environment reads them (6.4). */
  const settings = await getEnvironmentSettings(s.id as SubjectId);

  /* THE ARCHIVE — concluded sessions, newest first, with the artifacts the
     boundary returns (migration 0008). PRIMARY read (see header). */
  const archive = await fetchSubjectArchive(s.id);

  const env = environmentName(s.tagline);

  return (
    <div data-archive-surface data-subject={s.id} style={{ paddingBlock: "var(--ta-space-8) var(--ta-space-24)" }}>
      {/* THE DISCIPLINED HEADING — environment · subject, then the archive's
          own word. The breadcrumb the brief names, as a two-line lockup. */}
      <header style={{ paddingInline: "var(--ta-gutter)", maxWidth: "var(--ta-container)", marginInline: "auto" }}>
        <p style={MONO}>
          {env ? `${env} · ` : ""}
          {s.name} archive
        </p>
        <h1 style={{ margin: "var(--ta-space-2) 0 0", display: "flex", alignItems: "center", gap: "var(--ta-space-3)", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, lineHeight: 1.1, color: "var(--ta-text-primary)", textWrap: "balance" }}>
          <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden>
            <SubjectMark subject={s.id} size={24} />
          </span>
          {s.name} archive
        </h1>
        <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-md)", lineHeight: 1.6, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
          What a session leaves behind once it has concluded — the board as it stood, the notation,
          the chamber&apos;s audio — preserved here in order, and read like a shelf.
        </p>
      </header>

      {/* THE SHELF stands inside the subject's own room: graphite substrate,
          the subject's tokens, academic type — an archive, not a feed. */}
      <div style={{ marginTop: "var(--ta-space-8)" }}>
        <Room subject={s.id} motif={s.motif} density={settings.levers.density} role="edge" purpose="archive" style={{ padding: "clamp(1.25rem, 1rem + 2vw, 2.5rem)" }}>
          <ArtifactShelf subjectName={s.name} sessions={archive.sessions} />
        </Room>
      </div>

      {/* THE WAY BACK — one quiet link to the environment, never a primary. */}
      <p style={{ paddingInline: "var(--ta-gutter)", maxWidth: "var(--ta-container)", marginInline: "auto", marginTop: "var(--ta-space-6)", marginBottom: 0 }}>
        <Link href={`/subjects/${s.id}`} data-archive-back style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-primary)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>
          Back to the {s.name} environment
        </Link>
      </p>
    </div>
  );
}
