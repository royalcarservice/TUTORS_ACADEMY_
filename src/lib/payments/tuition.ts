/* ════════════════════════════════════════════════════════════════════════
   TUITION CONFIG & COPY (Unfinished Work · Track 3, DEC-044)

   ONE flat term tuition, identical for every chamber: no tiers, no
   anchors, no "was/now", no countdown. What the threshold buys is stated
   in the product's own vocabulary; the refund policy is the withdrawal
   policy, pro-rata to the day of leaving.
   ════════════════════════════════════════════════════════════════════════ */

export const TERM_TUITION_CENTS = 24000;
export const TUITION_CURRENCY = "USD";

export function formatTuition(cents: number, currency: string): string {
  const units = (cents / 100).toFixed(0);
  return currency === "USD" ? `$${units}` : `${units} ${currency}`;
}

export const TUITION_INCLUDES = [
  "Live chamber sessions with the placed tutor, camera and microphone always opt-in.",
  "The academic board record — each concluded session's board as it stood, preserved in the archive.",
  "Milestone co-certification — progress stated in words the relationship certifies together.",
] as const;

export const TUITION_REFUND_POLICY =
  "Withdrawal is one quiet act. The enrolment is marked withdrawn, the door closes without penalty, and the term's tuition is refunded pro-rata to the day of leaving. Nothing is designed to be difficult to leave." as const;
