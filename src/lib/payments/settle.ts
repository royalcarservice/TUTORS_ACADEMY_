import { DataReadError } from "@/lib/state/read-error";
import { SUBJECTS } from "@/lib/subjects/subjects";
import { isAuthConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { TERM_TUITION_CENTS, TUITION_CURRENCY } from "./tuition";

/* ════════════════════════════════════════════════════════════════════════
   SETTLEMENT (Unfinished Work · Track 3, DEC-044)

   The post-payment threshold, one code path, two modes:

   LIVE — the provider webhook verifies the signature, then calls
   settleInvoice(): the invoice flips to 'settled', the enrolment is
   inserted (on conflict, nothing), and when EXACTLY ONE tutor is active
   in the subject the placement follows deterministically. More than one
   candidate means a human decision belongs to the admin console, so the
   enrolment stands alone.

   DEMONSTRATION — no credentials: an in-process invoice ledger in the
   specimen register; the checkout's "simulate settlement" drives the
   same settleInvoice() so the post-payment transition is testable out
   of the box. Nothing persists; the banner says so.
   ════════════════════════════════════════════════════════════════════════ */

export interface InvoiceRow {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  amountCents: number;
  currency: string;
  status: "pending" | "settled" | "failed" | "refunded";
  provider: string;
  providerPaymentId: string | null;
  createdAt: string;
  settledAt: string | null;
}

export interface SettlementResult {
  ok: boolean;
  note: string;
  subjectId?: string;
  placementMade?: boolean;
}

function subjectNameOf(id: string): string {
  return SUBJECTS.find((s) => s.id === id)?.name ?? id;
}

/* ── demonstration ledger ───────────────────────────────────────────────── */

export const DEMO_STUDENT = { id: "a0000000-0000-4000-8000-000000000101", name: "Specimen One" };

const demoInvoices: InvoiceRow[] = [
  {
    id: "d0000000-0000-4000-8000-000000000401",
    studentId: DEMO_STUDENT.id,
    studentName: DEMO_STUDENT.name,
    subjectId: "mathematics",
    subjectName: "Mathematics",
    amountCents: TERM_TUITION_CENTS,
    currency: TUITION_CURRENCY,
    status: "settled",
    provider: "demonstration",
    providerPaymentId: "demo_settled_0001",
    createdAt: "2026-09-01",
    settledAt: "2026-09-01",
  },
];

/* ── reads ──────────────────────────────────────────────────────────────── */

export async function fetchInvoicesForStudent(studentId: string | null): Promise<{ mode: "live" | "demonstration"; rows: InvoiceRow[] }> {
  if (!isAuthConfigured()) {
    return { mode: "demonstration", rows: demoInvoices.filter((i) => i.studentId === (studentId ?? DEMO_STUDENT.id)) };
  }
  if (!studentId) return { mode: "live", rows: [] };
  /* The student's own receipts through the RLS-bounded anon client — the
     service role never answers a student-facing read. */
  const supabase = await createClient();
  if (!supabase) throw new DataReadError("invoices", new Error("client unavailable"));
  const { data, error } = await supabase
    .from("tuition_invoices")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) throw new DataReadError("tuition_invoices", error);
  return { mode: "live", rows: mapRows(data ?? []) };
}

export async function fetchAllInvoices(): Promise<{ mode: "live" | "demonstration"; rows: InvoiceRow[] }> {
  if (!isAuthConfigured()) return { mode: "demonstration", rows: [...demoInvoices] };
  const supabase = createServiceClient();
  if (!supabase) throw new DataReadError("invoices", new Error("service client unavailable"));
  const { data, error } = await supabase.from("tuition_invoices").select("*").order("created_at", { ascending: false });
  if (error) throw new DataReadError("tuition_invoices", error);
  const ids = Array.from(new Set((data ?? []).map((r) => r.student_id as string)));
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  if (profErr) throw new DataReadError("profiles", profErr);
  const names = new Map((profiles ?? []).map((p) => [p.id as string, (p.display_name as string) || ""]));
  const rows = mapRows(data ?? []).map((r) => ({ ...r, studentName: names.get(r.studentId) ?? r.studentName }));
  return { mode: "live", rows };
}

function mapRows(data: Array<Record<string, unknown>>): InvoiceRow[] {
  return data.map((r) => ({
    id: r.id as string,
    studentId: r.student_id as string,
    studentName: "",
    subjectId: r.subject_id as string,
    subjectName: subjectNameOf(r.subject_id as string),
    amountCents: r.amount_cents as number,
    currency: r.currency as string,
    status: r.status as InvoiceRow["status"],
    provider: r.provider as string,
    providerPaymentId: (r.provider_payment_id as string) ?? null,
    createdAt: String(r.created_at).slice(0, 10),
    settledAt: r.settled_at ? String(r.settled_at).slice(0, 10) : null,
  }));
}

/* ── settlement ─────────────────────────────────────────────────────────── */

/** The single threshold act: settle, enrol, and place when unambiguous. */
export async function settleInvoice(invoiceId: string, providerPaymentId: string | null): Promise<SettlementResult> {
  if (!isAuthConfigured()) {
    const invoice = demoInvoices.find((i) => i.id === invoiceId);
    if (!invoice) return { ok: false, note: "That invoice is not in the ledger. Nothing was changed." };
    invoice.status = "settled";
    invoice.settledAt = new Date().toISOString().slice(0, 10);
    if (providerPaymentId) invoice.providerPaymentId = providerPaymentId;
    const placed = activeTutorCountDemo(invoice.subjectId) === 1;
    return {
      ok: true,
      note: "Tuition confirmed.",
      subjectId: invoice.subjectId,
      placementMade: placed,
    };
  }

  const supabase = createServiceClient();
  if (!supabase) return { ok: false, note: "The payment provider is not configured for this deployment." };

  const { data: invoice, error: readErr } = await supabase.from("tuition_invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (readErr) throw new DataReadError("tuition_invoices", readErr);
  if (!invoice) return { ok: false, note: "That invoice does not exist. Nothing was changed." };

  const { error: settleErr } = await supabase
    .from("tuition_invoices")
    .update({ status: "settled", settled_at: new Date().toISOString(), provider_payment_id: providerPaymentId })
    .eq("id", invoiceId);
  if (settleErr) return { ok: false, note: "The settlement was refused. Nothing was changed." };

  const { error: enrolErr } = await supabase
    .from("enrolments")
    .upsert({ student_id: invoice.student_id, subject_id: invoice.subject_id, status: "active" }, { onConflict: "student_id,subject_id", ignoreDuplicates: true });
  if (enrolErr) return { ok: false, note: "The enrolment could not be recorded. An administrator will reconcile." };

  const { data: active } = await supabase
    .from("relationships")
    .select("tutor_id")
    .eq("subject_id", invoice.subject_id)
    .eq("state", "active");
  const tutorIds = Array.from(new Set((active ?? []).map((r) => r.tutor_id as string)));
  let placementMade = false;
  if (tutorIds.length === 1) {
    const { error: relErr } = await supabase
      .from("relationships")
      .insert({ student_id: invoice.student_id, tutor_id: tutorIds[0], subject_id: invoice.subject_id, state: "active" });
    placementMade = !relErr;
  }

  return { ok: true, note: "Tuition confirmed.", subjectId: invoice.subject_id as string, placementMade };
}

/** Demonstration counterpart of "exactly one tutor active in the subject". */
function activeTutorCountDemo(subjectId: string): number {
  // The Track 1 ledger approves Specimen Tutor One for mathematics only.
  return subjectId === "mathematics" ? 1 : 0;
}

/** Demonstration checkout: create the invoice, then settle it through the same path. */
export async function demoSettle(subjectId: string): Promise<SettlementResult & { invoiceId: string }> {
  const invoice: InvoiceRow = {
    id: `d0000000-0000-4000-8000-${String(Date.now()).slice(-12)}`,
    studentId: DEMO_STUDENT.id,
    studentName: DEMO_STUDENT.name,
    subjectId,
    subjectName: subjectNameOf(subjectId),
    amountCents: TERM_TUITION_CENTS,
    currency: TUITION_CURRENCY,
    status: "pending",
    provider: "demonstration",
    providerPaymentId: null,
    createdAt: new Date().toISOString().slice(0, 10),
    settledAt: null,
  };
  demoInvoices.unshift(invoice);
  const result = await settleInvoice(invoice.id, `demo_settled_${String(Date.now()).slice(-6)}`);
  return { ...result, invoiceId: invoice.id };
}
