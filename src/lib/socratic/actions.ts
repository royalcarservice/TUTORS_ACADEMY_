"use server";

// ============================================================================
// THE SOCRATIC REFLECTION SEAM — Phase 9 · Step 2 (DEC-034)
//
// ONE server action: reflectOnInquiry. The composer island calls it; it
// resolves the inquiry through the PURE engine (src/lib/socratic/resolver),
// enriches any archive citation with the cited record's own word and date,
// and persists ONE exchange row through the student's OWN INSERT (0009's
// policy: with check student_id = auth.uid()). No identity argument — the
// cookie session is the only identity source (the archive-actions posture,
// DEC-031). The action returns the closed vocabulary of outcomes the
// composer may speak; invisible and refused are deliberately the SAME
// honest answer (STATE_LANGUAGE 5.7): zero leakage, zero alarm.
// ============================================================================

import { revalidatePath } from "next/cache";

import { ARTIFACT_WORD } from "@/lib/archive/artifact";
import { getIdentity } from "@/lib/auth/session";
import { SUBJECTS } from "@/lib/subjects/subjects";
import { createClient } from "@/lib/supabase/server";
import type { SubjectId } from "@/lib/student/contract";

import { checkInquiry, COMPOSER_CHAR_LIMIT, type SocraticPrompt } from "./contract";
import { fetchSocraticLensData, guidancePayload, promptTypeOfExchange, type ExchangeGuidanceItem } from "./data";
import { resolveGuidance } from "./resolver";

/** The closed vocabulary of outcomes the composer may speak. */
export type ReflectResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "overlong" | "refused" };

export async function reflectOnInquiry(input: {
  subjectId: string;
  milestoneKey: string;
  inquiry: string;
}): Promise<ReflectResult> {
  if (typeof input !== "object" || input === null) return { ok: false, reason: "refused" };
  const { subjectId, milestoneKey, inquiry } = input;
  if (typeof subjectId !== "string" || typeof milestoneKey !== "string" || typeof inquiry !== "string") {
    return { ok: false, reason: "refused" };
  }

  try {
    /* The writer is the enrolled student themselves — identity from the
       cookie session alone, never from an argument. */
    const identity = await getIdentity();
    if (!identity || identity.role !== "student") return { ok: false, reason: "refused" };
    if (!SUBJECTS.some((s) => s.id === subjectId)) return { ok: false, reason: "refused" };

    /* Brevity first — the composer's stricter limit at the seam, the
       contract's outer bound behind it (the DB mirrors 500). */
    if (inquiry.trim().length > COMPOSER_CHAR_LIMIT) return { ok: false, reason: "overlong" };
    const checked = checkInquiry(inquiry);
    if (!checked.ok) return { ok: false, reason: checked.reason === "empty" ? "empty" : "overlong" };

    /* The prompt: the subject's preserved artifacts join the inquiry, so a
       citation can point at the student's own record. A failed archive
       read leaves citations absent, never the reflection. */
    let data;
    try {
      data = await fetchSocraticLensData(subjectId);
    } catch {
      data = { exchanges: [], artifacts: [], options: [] };
    }
    const prompt: SocraticPrompt = {
      subjectId: subjectId as SubjectId,
      currentMilestone: milestoneKey,
      studentInquiry: checked.text,
      previousArtifacts: data.artifacts,
    };
    const resolved = resolveGuidance(prompt);

    /* Enrich citations with the record's own word and date — the card
       renders from the payload alone and never re-reads the archive. */
    const guidance: ExchangeGuidanceItem[] = resolved.map((g) => {
      const item: ExchangeGuidanceItem = { type: g.guidanceType, text: g.responseText };
      if (g.referencedArtifactId) {
        const record = data.artifacts.find((a) => a.id === g.referencedArtifactId);
        if (record) {
          item.referencedArtifactId = record.id;
          item.artifactWord = ARTIFACT_WORD[record.type];
          item.artifactDate = record.createdAt.slice(0, 10);
        }
      }
      return item;
    });
    if (guidance.length === 0) return { ok: false, reason: "refused" };

    /* ONE row per exchange — the student's own INSERT under 0009's policy. */
    const supabase = await createClient();
    if (!supabase) return { ok: false, reason: "refused" };
    const { error } = await supabase.from("socratic_exchanges").insert({
      student_id: identity.id,
      subject_id: subjectId,
      milestone_key: milestoneKey,
      prompt_type: promptTypeOfExchange(guidance),
      query_text: checked.text,
      response_payload: guidancePayload(guidance),
    });
    if (error) return { ok: false, reason: "refused" };

    revalidatePath(`/subjects/${subjectId}`);
    return { ok: true };
  } catch {
    return { ok: false, reason: "refused" }; // a failed write is an absence, never an alarm
  }
}
