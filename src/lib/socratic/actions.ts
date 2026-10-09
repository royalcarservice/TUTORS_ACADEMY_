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

// ============================================================================
// THE PREPARATION MARK — Phase 9 · Step 3 (DEC-035)
//
// ONE more server action: toggleSocraticPin. The oversight panel's mark is
// the tutor's OWN preparation note for their next live dialogue — a
// diagnostic mirror, never an evaluation. The action carries NO identity
// argument (the cookie session is the only source): it verifies the marker
// is a tutor, verifies the exchange is visible to them in that subject for
// that student (the read re-decides under 0009's RLS), and then lets the
// mark's own shape decide — an existing mark is withdrawn (DELETE), an
// absent one is made (INSERT, the unique pair keeping idempotence). No
// success theatre: the panel re-renders from the read, and the read is
// truth. A failure leaves the mark as it stood — silence, never alarm.
// ============================================================================

/** Toggle the tutor's preparation mark on one inquiry. */
export async function toggleSocraticPin(input: {
  studentId: string;
  subjectId: string;
  exchangeId: string;
}): Promise<void> {
  if (typeof input !== "object" || input === null) return;
  const { studentId, subjectId, exchangeId } = input;
  if (typeof studentId !== "string" || typeof subjectId !== "string" || typeof exchangeId !== "string") return;
  if (studentId.length === 0 || subjectId.length === 0 || exchangeId.length === 0) return;

  try {
    const identity = await getIdentity();
    if (!identity || identity.role !== "tutor") return;

    const supabase = await createClient();
    if (!supabase) return;

    /* The exchange must be visible to THIS marker in THIS subject for THIS
       student — 0009's tutor-read policy re-decides; invisible and unknown
       are the same refusal: the action simply does nothing. */
    const { data: exchange, error: exchangeError } = await supabase
      .from("socratic_exchanges")
      .select("id")
      .eq("id", exchangeId)
      .eq("subject_id", subjectId)
      .eq("student_id", studentId)
      .maybeSingle();
    if (exchangeError || !exchange) return;

    /* The mark's own state decides the act: present → withdraw; absent → make. */
    const { data: existing, error: pinReadError } = await supabase
      .from("socratic_pins")
      .select("id")
      .eq("exchange_id", exchangeId)
      .maybeSingle();
    if (pinReadError) return;

    if (existing) {
      const { error } = await supabase.from("socratic_pins").delete().eq("id", existing.id);
      if (error) return;
    } else {
      const { error } = await supabase.from("socratic_pins").insert({
        tutor_id: identity.id,
        student_id: studentId,
        subject_id: subjectId,
        exchange_id: exchangeId,
      });
      if (error) return;
    }

    revalidatePath("/tutor", "layout");
  } catch {
    /* a failed toggle is an absence, never an alarm — the mark stands as it stood */
  }
}
