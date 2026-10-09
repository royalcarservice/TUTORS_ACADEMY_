import type { Metadata } from "next";

import { requireIdentity } from "@/lib/auth/session";
import { fetchInvoicesForStudent } from "@/lib/payments/settle";
import { formatTuition } from "@/lib/payments/tuition";

/* /student/account — the third real destination. Profile facts the row
 * actually holds, and the real sign-out. No settings that do nothing.     */

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 };

export default async function StudentAccountPage() {
  const id = await requireIdentity("student", "/student/account");
  const invoices = await fetchInvoicesForStudent(id.id);
  const rows: Array<[string, string]> = [
    ["Name", id.displayName || "—"],
    ["Email", id.email ?? "—"],
    ["Role", id.role],
  ];
  return (
    <div data-density="compact" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-6)" }}>
      <div>
        <p style={MONO}>Account</p>
        <h1 style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, color: "var(--ta-text-primary)" }}>
          {id.displayName || "Your account"}
        </h1>
        {id.isTestAccount && (
          <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>
            This is a test account. It may be deleted while the academy is being built.
          </p>
        )}
      </div>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: "var(--ta-space-6)", rowGap: "var(--ta-space-3)", fontSize: "var(--ta-text-base)" }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt style={{ ...MONO, alignSelf: "baseline" }}>{k}</dt>
            <dd style={{ margin: 0, color: "var(--ta-text-primary)", overflowWrap: "anywhere" }}>{v}</dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="receipts">
        <p style={MONO} id="receipts">Tuition receipts</p>
        {invoices.rows.length === 0 ? (
          <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>
            No tuition settled yet. The threshold, when it comes, is one payment per term per subject.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: "var(--ta-space-3) 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
            {invoices.rows.map((row) => (
              <li
                key={row.id}
                style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-4)", alignItems: "baseline", border: "1px solid var(--ta-border)", borderRadius: 8, padding: "var(--ta-space-3) var(--ta-space-4)", fontSize: "var(--ta-text-sm)" }}
              >
                <span style={{ color: "var(--ta-text-primary)", fontWeight: 500 }}>{row.subjectName}</span>
                <span style={{ color: "var(--ta-text-secondary)" }}>{formatTuition(row.amountCents, row.currency)} · {row.status}</span>
                <span style={{ color: "var(--ta-text-muted)", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)" }}>
                  {row.settledAt ?? row.createdAt}{row.providerPaymentId ? ` · …${row.providerPaymentId.slice(-4)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <form action="/auth/signout" method="post">
        <button type="submit" className="ta-btn" data-variant="secondary" data-size="md">Sign out</button>
      </form>
    </div>
  );
}
