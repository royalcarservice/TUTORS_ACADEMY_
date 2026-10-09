"use server";

// ============================================================================
// THE ARCHIVE'S OPENING SEAM — Phase 8 · Step 3 (DEC-031)
//
// ONE server action: openArtifact. The shelf itself carries no object URLs —
// a signed URL is a bearer token, so the window opens ONLY when a reader
// actually reaches for an artifact, and only after the row proves visible
// through RLS on the ordinary read (fetchArtifactDetails' discipline,
// unchanged). The action returns plain serializable facts; the client island
// does the fetching. No identity argument — the cookie session is the only
// identity source, exactly as the data layer's (DEC-029).
//
// An invisible artifact and an unknown one return the SAME honest answer
// (ok: false): zero identity leakage on 404/403 (STATE_LANGUAGE 5.7).
// Without the service key the answer is `unsigned` — the metadata stands,
// the bytes wait for a credentialed environment (DEC-023 readiness).
// ============================================================================

import { ARTIFACT_WORD, type ArtifactType } from "@/lib/archive/artifact";
import { fetchArtifactDetails } from "@/lib/archive/data";

export interface OpenedArtifact {
  ok: boolean;
  /** Present when ok — the artifact's kind. */
  type?: ArtifactType;
  /** Present when ok — the archive's own word for the kind. */
  word?: string;
  /** Present when ok — how the bytes may be reached. */
  access?: { mode: "signed"; url: string; expiresInSeconds: number } | { mode: "unsigned" };
  /** Present when ok — the machine facts the row carries. */
  metadata?: Readonly<Record<string, unknown>>;
}

/** The closed vocabulary of failures the island may speak. */
export type OpenFailure = "unavailable" | "unsigned";

export async function openArtifact(artifactId: string): Promise<OpenedArtifact> {
  if (typeof artifactId !== "string" || artifactId.length === 0) return { ok: false };
  try {
    const details = await fetchArtifactDetails(artifactId);
    if (!details) return { ok: false }; // invisible or unknown — deliberately the same answer
    return {
      ok: true,
      type: details.type,
      word: ARTIFACT_WORD[details.type],
      access: details.access,
      metadata: details.metadata,
    };
  } catch {
    return { ok: false }; // a failed read is an absence, never an alarm
  }
}
