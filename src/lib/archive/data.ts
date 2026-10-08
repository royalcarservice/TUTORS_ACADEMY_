// ============================================================================
// TUTORS ACADEMY · Phase 8 · Step 1 — THE ARCHIVE DATA LAYER (DEC-029)
//
// Server-only readers for public.session_artifacts (migration 0008) — the
// asynchronous academic archive. Its scope is granted by 0008 and nowhere
// else:
//   · a STUDENT reads the archive of a subject they are ACTIVELY enrolled in;
//   · a TUTOR reads the archive of a subject where they hold an ACTIVE
//     relationship — and writes artifacts only into sessions they opened.
//
// The posture is the classroom data layer's (src/lib/classroom/data.ts),
// unchanged: ONE identity source — the cookie session; RLS supplies the
// boundary; the query STATES the subject it means (the 6.1 rule — "mine" is
// spelled, not assumed); no service-role READ, no write of any kind here.
// The brief's userId parameters are reconciled away for exactly this reason
// (DEC-029): a second identity argument would be a second truth.
//
// THE ARCHIVE'S READ SHAPE
//   fetchSubjectArchive returns CONCLUDED sessions, newest first, each with
//   the artifacts the boundary lets the viewer see. "Concluded" is the
//   archive's own word: the room is over, its facts are settled, and nothing
//   of an in-flight session leaks into the library early.
//
// THE SIGNED-URL SEAM
//   fetchArtifactDetails signs the object's URL through the service client —
//   the ONLY place the archive touches the service role, and only AFTER the
//   row proved visible through RLS on the ordinary read. Without the service
//   key the details return `unsigned`: honest absence, no fabricated URL, no
//   error loop (the DEC-023 readiness posture).
//
// HONEST ERRORS (STATE_LANGUAGE 5.7)
//   A failed read THROWS DataReadError — "no artifacts" and "the read
//   failed" are never the same value. An artifact the viewer cannot see and
//   an artifact that does not exist return the SAME null: zero identity
//   leakage on 404/403, exactly as the brief demands.
// ============================================================================

import { DataReadError } from "@/lib/state/read-error";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

import {
  ARTIFACT_BUCKET,
  SIGNED_URL_SECONDS,
  toArtifact,
  wantsPreview,
  type ArtifactRecord,
} from "./artifact";

/** An artifact as the shelf presents it — a board record may carry a
 *  short-lived preview URL; every other kind carries none. */
export interface ArchiveArtifact extends ArtifactRecord {
  previewUrl: string | null;
}

/** A concluded session as the archive presents it. */
export interface ArchiveSession {
  id: string;
  title: string;
  /** The tutor who opened the session — null when the boundary withholds it. */
  tutorName: string | null;
  scheduledAt: string;
  /** The instant the session concluded — the archive's own ordering fact. */
  concludedAt: string;
  artifacts: ArchiveArtifact[];
}

/** One subject's archive: concluded sessions, newest first. */
export interface SubjectArchive {
  subjectId: string;
  sessions: ArchiveSession[];
}

/** How an artifact's bytes may be reached. */
export type ArtifactAccess =
  | { mode: "signed"; url: string; expiresInSeconds: number }
  | { mode: "unsigned" };

/** An artifact with its access decision attached. */
export interface ArtifactDetails extends ArtifactRecord {
  access: ArtifactAccess;
}

/**
 * The archive of ONE subject for the CURRENT identity — enrolled student or
 * related tutor, decided by RLS (migration 0008), never by this code.
 * Concluded sessions only, newest first (scheduled instant descending, id as
 * the deterministic tie-break); each session carries the artifacts the
 * boundary returns for it. No identity → an empty archive, honestly; a
 * failed read THROWS DataReadError (5.7).
 */
export async function fetchSubjectArchive(subjectId: string): Promise<SubjectArchive> {
  const supabase = await createClient();
  if (!supabase) return { subjectId, sessions: [] };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { subjectId, sessions: [] };

  const { data: sessions, error } = await supabase
    .from("cohort_sessions")
    .select("id, title, scheduled_at, updated_at, tutor:profiles!cohort_sessions_tutor_id_fkey(display_name)")
    .eq("subject_id", subjectId)          // subject isolation spelled in the query
    .eq("state", "concluded")             // the archive's own word: the room is over
    .order("scheduled_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw new DataReadError("cohort_sessions", error);
  const rows = sessions ?? [];
  if (rows.length === 0) return { subjectId, sessions: [] };

  const ids = rows.map((r) => r.id);
  const { data: artifacts, error: artifactError } = await supabase
    .from("session_artifacts")
    .select("id, session_id, subject_id, artifact_type, storage_path, metadata, created_at")
    .eq("subject_id", subjectId)          // isolation spelled again, never assumed
    .in("session_id", ids)
    .order("created_at", { ascending: true });
  if (artifactError) throw new DataReadError("session_artifacts", artifactError);

  const bySession = new Map<string, ArchiveArtifact[]>();
  for (const row of artifacts ?? []) {
    const record = toArtifact(row);
    if (!record) continue; // unknown kind: dropped, never guessed
    // Board records get a short-lived preview (best effort — without the
    // service key the card simply stands without a picture); nothing else
    // is previewable, and nothing is ever counted or ranked.
    const previewUrl = wantsPreview(record.type) ? await previewFor(record.storagePath) : null;
    const list = bySession.get(record.sessionId) ?? [];
    list.push({ ...record, previewUrl });
    bySession.set(record.sessionId, list);
  }

  return {
    subjectId,
    sessions: rows.map((s) => {
      const tutor = Array.isArray(s.tutor) ? s.tutor[0] : s.tutor;
      return {
        id: s.id,
        title: s.title,
        tutorName: (tutor?.display_name as string | undefined) ?? null,
        scheduledAt: s.scheduled_at,
        concludedAt: s.updated_at,
        artifacts: bySession.get(s.id) ?? [],
      };
    }),
  };
}

/** Best-effort preview signing for ONE object: absent, never an error. */
async function previewFor(storagePath: string): Promise<string | null> {
  const access = await signArtifactAccess(storagePath);
  return access.mode === "signed" ? access.url : null;
}

/**
 * ONE artifact by id, with its access decision. The read carries no subject
 * argument on purpose: RLS decides visibility, and an invisible artifact
 * returns the SAME null as an unknown one — zero identity leakage. Signing
 * happens only after the row proves visible, through the service client;
 * without the service key the answer is `unsigned`, never a fabricated URL.
 */
export async function fetchArtifactDetails(artifactId: string): Promise<ArtifactDetails | null> {
  const supabase = await createClient();
  if (!supabase) return null; // no identity, no archive — the honest empty
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("session_artifacts")
    .select("id, session_id, subject_id, artifact_type, storage_path, metadata, created_at")
    .eq("id", artifactId)
    .maybeSingle();
  if (error) throw new DataReadError("session_artifacts", error);
  const record = data ? toArtifact(data) : null;
  if (!record) return null; // invisible or unknown — deliberately the same answer

  const access = await signArtifactAccess(record.storagePath);
  return { ...record, access };
}

/**
 * The signed-URL seam. The service client signs because a signed URL is a
 * bearer token: it must not widen the boundary RLS just enforced, and only
 * the service role can mint one scoped to this single path for this short
 * window. Any failure — missing key, storage unreachable — degrades to
 * `unsigned`: the metadata still stands, the bytes wait for a credentialed
 * environment.
 */
async function signArtifactAccess(storagePath: string): Promise<ArtifactAccess> {
  const admin = createServiceClient();
  if (!admin) return { mode: "unsigned" };
  try {
    const { data, error } = await admin.storage.from(ARTIFACT_BUCKET).createSignedUrl(storagePath, SIGNED_URL_SECONDS);
    if (error || !data?.signedUrl) return { mode: "unsigned" };
    return { mode: "signed", url: data.signedUrl, expiresInSeconds: SIGNED_URL_SECONDS };
  } catch {
    return { mode: "unsigned" }; // a signing failure is an absence, never an alarm
  }
}
