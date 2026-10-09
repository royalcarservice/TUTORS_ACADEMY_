import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchAllInvoices } from "@/lib/payments/settle";
import { formatTuition } from "@/lib/payments/tuition";

export const metadata = {
  title: "Billing · Academy Operations",
  description: "The platform's invoice ledger: settlement states, receipts and refunds, for audit.",
};

const statusTone = {
  pending: "warning",
  settled: "success",
  failed: "danger",
  refunded: "neutral",
} as const;

export default async function AdminBillingPage() {
  const { mode, rows } = await fetchAllInvoices();
  const settledTotal = rows.filter((r) => r.status === "settled").reduce((sum, r) => sum + r.amountCents, 0);

  return (
    <>
      <PageHeader
        title="Billing"
        description="The financial threshold, held for audit. Tutors have no read path here — who paid never colours the pedagogy."
      />
      <Card>
        <Card.Header>
          <Card.Title>Invoice ledger</Card.Title>
          <Card.Description>
            {mode === "demonstration"
              ? "Demonstration ledger — fixtures only."
              : "Live ledger."}{" "}
            Settled this term: {formatTuition(settledTotal, "USD")}.
          </Card.Description>
        </Card.Header>
        <Card.Body className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-foreground-subtle uppercase">
                <th scope="col" className="py-2 pr-4">Student</th>
                <th scope="col" className="py-2 pr-4">Subject</th>
                <th scope="col" className="py-2 pr-4">Amount</th>
                <th scope="col" className="py-2 pr-4">State</th>
                <th scope="col" className="py-2 pr-4">Settled</th>
                <th scope="col" className="py-2">Provider reference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{row.studentName || "—"}</td>
                  <td className="py-3 pr-4 text-foreground-muted">{row.subjectName}</td>
                  <td className="py-3 pr-4 text-foreground-muted tabular-nums">{formatTuition(row.amountCents, row.currency)}</td>
                  <td className="py-3 pr-4"><Badge tone={statusTone[row.status]}>{row.status}</Badge></td>
                  <td className="py-3 pr-4 text-foreground-muted tabular-nums">{row.settledAt ?? "—"}</td>
                  <td className="py-3 font-mono text-xs text-foreground-subtle">{row.providerPaymentId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card.Body>
      </Card>
    </>
  );
}
