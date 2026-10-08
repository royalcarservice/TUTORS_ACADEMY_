// ============================================================================
// TUTORS ACADEMY · Phase 8 · Step 1 — THE ARCHIVE'S PURE LOGIC (DEC-029)
//
// The archive's discipline, written once as PURE functions so the rules can
// be proven offline (scripts/test-archive-logic.mjs) and never drift from
// migration 0008:
//
//   · CLASSIFICATION — three artifact kinds, closed: canvas_snapshot,
//     pedagogical_notes, session_recording. An unknown kind is dropped,
//     never guessed (the classroom-data posture).
//   · SUBJECT ISOLATION — an artifact belongs strictly to ONE session of ONE
//     subject. The SQL enforces it with a composite foreign key; the pairing
//     predicate here is the same rule, testable without a database.
//   · VISIBILITY — the RLS policies' predicates, mirrored as functions over
//     plain facts: an enrolled student reads the subject's archive; a tutor
//     reads it where an active relationship stands; a tutor WRITES an
//     artifact only into a session they opened. Same env facts in, same
//     answer out — the tests pin parity with the migration's wording.
//   · ZERO ENGAGEMENT — the archive carries no view counter, download count,
//     popularity score or sharing link. The banned vocabulary is named here
//     so the gate can sweep the schema and the data layer against it.
//
// This file imports nothing that touches the network: it is the seam the
// data layer (src/lib/archive/data.ts) composes, exactly as surface-sync is
// the seam the transport composes (DEC-025/028).
// ============================================================================

/** The three artifact kinds — a CLOSED set (migration 0008's CHECK). */
export const ARTIFACT_TYPES = ["canvas_snapshot", "pedagogical_notes", "session_recording"] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

/** The one bucket; PRIVATE by construction (no policy admits anon). */
export const ARTIFACT_BUCKET = "session-artifacts";

/** Signed-URL window, seconds — narrow by design; the reader consumes at once. */
export const SIGNED_URL_SECONDS = 60;

/** Vocabulary the archive must never carry — swept by the gate's tests. */
export const BANNED_ENGAGEMENT_WORDS = [
  "view_count",
  "views",
  "download_count",
  "downloads",
  "popularity",
  "likes",
  "shares",
  "rating",
] as const;

/** An artifact row as the archive consumes it. */
export interface ArtifactRecord {
  id: string;
  sessionId: string;
  subjectId: string;
  type: ArtifactType;
  storagePath: string;
  /** Machine facts only (duration, dimensions, page count). Never engagement. */
  metadata: Readonly<Record<string, unknown>>;
  createdAt: string;
}

/** Is this one of the three kinds? Anything else is dropped, never guessed. */
export function isArtifactType(value: string): value is ArtifactType {
  return (ARTIFACT_TYPES as readonly string[]).includes(value);
}

/** One storage path, built once so the convention cannot drift. */
export function artifactStoragePath(subjectId: string, sessionId: string, artifactId: string): string {
  return `${subjectId}/${sessionId}/${artifactId}`;
}

/** The path's parts, or null when the path does not follow the convention. */
export function parseArtifactPath(path: string): { subjectId: string; sessionId: string; artifactId: string } | null {
  const parts = path.split("/");
  if (parts.length !== 3) return null;
  if (parts.some((p) => p.length === 0 || p.includes("..") || p.includes("."))) return null;
  const [subjectId, sessionId, artifactId] = parts;
  return { subjectId, sessionId, artifactId };
}

/** The subject an object path names — the storage policy's first segment. */
export function subjectOfStoragePath(path: string): string | null {
  return parseArtifactPath(path)?.subjectId ?? null;
}

/**
 * SUBJECT ISOLATION, as a predicate: the artifact's subject and the session's
 * subject are one subject, and the artifact names exactly that session. The
 * composite foreign key enforces this in SQL; the archive's logic mirrors it
 * so a test can prove the rule with zero network.
 */
export function artifactBelongsToSession(
  artifact: { subjectId: string; sessionId: string },
  session: { id: string; subjectId: string },
): boolean {
  return artifact.sessionId === session.id && artifact.subjectId === session.subjectId;
}

/** A row-shaped artifact, normalized — unknown kinds return null. */
export function toArtifact(row: {
  id: string;
  session_id: string;
  subject_id: string;
  artifact_type: string;
  storage_path: string;
  metadata: unknown;
  created_at: string;
}): ArtifactRecord | null {
  if (!isArtifactType(row.artifact_type)) return null; // unknown kind: dropped, never guessed
  const metadata =
    row.metadata !== null && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};
  return {
    id: row.id,
    sessionId: row.session_id,
    subjectId: row.subject_id,
    type: row.artifact_type,
    storagePath: row.storage_path,
    metadata,
    createdAt: row.created_at,
  };
}

/* ── the visibility predicates — the migration's words, as pure functions ── */

/** One enrolment fact as the archive's mirror reads it. */
export interface EnrolmentFact {
  subjectId: string;
  status: string;
}

/** One relationship fact as the archive's mirror reads it. */
export interface RelationshipFact {
  subjectId: string;
  state: string;
}

/** The facts a viewer carries into the archive's mirror. */
export interface ViewerFacts {
  enrolments: readonly EnrolmentFact[];
  tutorRelations: readonly RelationshipFact[];
}

/**
 * READ — the select policies' predicate: an ACTIVE enrolment in the subject,
 * or an ACTIVE relationship there. Nothing else reads the archive.
 */
export function canReadSubjectArchive(viewer: ViewerFacts, subjectId: string): boolean {
  const enrolled = viewer.enrolments.some((e) => e.subjectId === subjectId && e.status === "active");
  const related = viewer.tutorRelations.some((r) => r.subjectId === subjectId && r.state === "active");
  return enrolled || related;
}

/**
 * WRITE — the insert policy's predicate, exactly: the session exists for the
 * artifact's subject AND the writer is the tutor who OPENED it. Subject
 * relatedness alone never writes an artifact (DEC-029).
 */
export function canInsertArtifact(
  viewerId: string,
  session: { id: string; subjectId: string; tutorId: string },
  artifactSubjectId: string,
): boolean {
  return session.subjectId === artifactSubjectId && session.tutorId === viewerId;
}
