/* ════════════════════════════════════════════════════════════════════════
   THE SOCRATIC SEAM — server data access for the lens
   (Phase 9 · Step 2, DEC-034)

   The persistence half of DEC-033's owed seam: the reader that shows a
   student their own recent exchanges, and the assembly that hands the lens
   everything it renders — exchanges, the subject's preserved artifacts (for
   the guidance's citations) and the scaffold options the composer names.

   THE CLASSROOM POSTURE, unchanged (P5-R1): the signatures carry no userId
   parameter. Identity rides the cookie session; RLS is the ONLY boundary
   (migration 0009 — own-student SELECT, related-tutor SELECT). A student
   sees their own rows because the policy says so, never because this code
   filters for them; a mismatched subject yields the honest empty — zero
   enumeration, zero leakage.

   PURE AT THE EDGES: a failed or unconfigured read is an absence, exactly
   as the archive's (DEC-029): no client → empty; a thrown read propagates
   to the caller's isolate (P5-R8.9: a supplemental region that fails is
   silent, never an alarm).
   ════════════════════════════════════════════════════════════════════════ */

import { fetchSubjectArchive } from "@/lib/archive/data";
import type { ArtifactRecord } from "@/lib/archive/artifact";
import { createClient } from "@/lib/supabase/server";

import { PROMPT_TYPE_OF_GUIDANCE, type GuidanceKind, type SocraticPromptType } from "./contract";
import { milestoneKeysFor, scaffoldFor } from "./resolver";

/** How many of the student's own exchanges the lens shows, newest first. */
export const RECENT_EXCHANGE_LIMIT = 6;

/** One guidance item as the lens renders it — enriched at persistence with
 *  the citation's word and date (the payload carries what the card needs;
 *  the surface never re-reads the archive for a link). */
export interface ExchangeGuidanceItem {
  type: GuidanceKind;
  text: string;
  referencedArtifactId?: string;
  /** The archive's own word for the cited kind. */
  artifactWord?: string;
  /** The cited record's own date (ISO, YYYY-MM-DD). */
  artifactDate?: string;
}

/** One exchange as the lens renders it. */
export interface ExchangeRecord {
  id: string;
  milestoneKey: string;
  promptType: SocraticPromptType;
  queryText: string;
  createdAt: string;
  guidance: readonly ExchangeGuidanceItem[];
}

/** Everything the lens renders for one subject, assembled server-side. */
export interface SocraticLensData {
  exchanges: readonly ExchangeRecord[];
  /** The subject's preserved artifacts — the citations' source of truth. */
  artifacts: readonly ArtifactRecord[];
  /** The scaffold options the composer names: key + the concept's path. */
  options: readonly { key: string; path: string }[];
}

/** The payload shape the DB stores — guidance structure only. */
export function guidancePayload(guidance: readonly ExchangeGuidanceItem[]): Record<string, unknown> {
  return { guidance: guidance.map((g) => ({ ...g })) };
}

/** The class an exchange lands as — the FIRST guidance's kind, mapped
 *  through the contract (deterministic; an exchange always has ≥1 item). */
export function promptTypeOfExchange(guidance: readonly ExchangeGuidanceItem[]): SocraticPromptType {
  return PROMPT_TYPE_OF_GUIDANCE[guidance[0].type];
}

/** Parse one stored payload back into guidance items. Malformed entries are
 *  defects — dropped, never repaired (the 5.6 posture). */
export function parseGuidancePayload(payload: unknown): ExchangeGuidanceItem[] {
  if (typeof payload !== "object" || payload === null) return [];
  const list = (payload as Record<string, unknown>)["guidance"];
  if (!Array.isArray(list)) return [];
  const out: ExchangeGuidanceItem[] = [];
  for (const item of list) {
    if (typeof item !== "object" || item === null) continue;
    const g = item as Record<string, unknown>;
    if (typeof g["text"] !== "string" || g["text"].length === 0) continue;
    if (g["type"] !== "hint" && g["type"] !== "question" && g["type"] !== "reference") continue;
    const entry: ExchangeGuidanceItem = { type: g["type"], text: g["text"] };
    if (typeof g["referencedArtifactId"] === "string") entry.referencedArtifactId = g["referencedArtifactId"];
    if (typeof g["artifactWord"] === "string") entry.artifactWord = g["artifactWord"];
    if (typeof g["artifactDate"] === "string") entry.artifactDate = g["artifactDate"];
    out.push(entry);
  }
  return out;
}

/**
 * The student's own recent exchanges for one subject — RLS shows only their
 * rows (0009); this reader spells the subject and the order, nothing else.
 * No client or no rows → the honest empty. A thrown read propagates.
 */
export async function fetchRecentExchanges(subjectId: string): Promise<ExchangeRecord[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("socratic_exchanges")
    .select("id, milestone_key, prompt_type, query_text, response_payload, created_at")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })
    .limit(RECENT_EXCHANGE_LIMIT);
  if (error) throw new Error(`socratic: exchange read failed (${error.code ?? "unknown"})`);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    milestoneKey: String(row.milestone_key),
    promptType: String(row.prompt_type) as SocraticPromptType,
    queryText: String(row.query_text),
    createdAt: String(row.created_at),
    guidance: parseGuidancePayload(row.response_payload),
  }));
}

/** The subject's preserved artifacts, flattened from the archive's read —
 *  the same RLS-bounded seam the shelf uses (DEC-029). A failed archive
 *  read leaves the citations absent, never the whole lens. */
async function fetchSubjectArtifactRecords(subjectId: string): Promise<ArtifactRecord[]> {
  try {
    const archive = await fetchSubjectArchive(subjectId);
    return archive.sessions.flatMap((s) => s.artifacts.map((a) => ({
      id: a.id,
      sessionId: a.sessionId,
      subjectId: a.subjectId,
      type: a.type,
      storagePath: a.storagePath,
      metadata: a.metadata,
      createdAt: a.createdAt,
    })));
  } catch {
    return [];
  }
}

/**
 * Assemble everything the lens renders for one subject: the student's own
 * recent exchanges, the subject's preserved artifacts and the scaffold
 * options the composer names. The options come from the resolver's map —
 * deterministic, offline.
 */
export async function fetchSocraticLensData(subjectId: string): Promise<SocraticLensData> {
  const [exchanges, artifacts] = await Promise.all([
    fetchRecentExchanges(subjectId),
    fetchSubjectArtifactRecords(subjectId),
  ]);
  const options = milestoneKeysFor(subjectId)
    .map((key) => ({ key, path: scaffoldFor(subjectId, key)?.path ?? key }));
  return { exchanges, artifacts, options };
}
