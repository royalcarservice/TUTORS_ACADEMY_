"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { revokePlacement, type PlacementRow } from "@/lib/admin/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/* The placements ledger — who is placed with whom, in which subject, and
   the one quiet act an administrator holds here: ending a placement. */

function RevokeButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" size="sm" aria-busy={pending} disabled={pending}>
      {pending ? "Ending" : "Revoke"}
    </Button>
  );
}

function RevokeCell({ row }: { row: PlacementRow }) {
  const [result, formAction] = useActionState(revokePlacement, null);
  return (
    <div className="flex flex-col items-end gap-1.5">
      <form action={formAction}>
        <input type="hidden" name="relationshipId" value={row.id} />
        <RevokeButton />
      </form>
      {result ? (
        <p className="max-w-[16rem] text-right text-xs leading-relaxed text-foreground-muted">{result.note}</p>
      ) : null}
    </div>
  );
}

export function PlacementsTable({ rows }: { rows: PlacementRow[] }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Active and ended placements</Card.Title>
        <Card.Description>
          A placement is the arrangement of one student with one tutor inside one subject. Ending one closes the door without penalty.
        </Card.Description>
      </Card.Header>
      <Card.Body className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-foreground-subtle uppercase">
              <th scope="col" className="py-2 pr-4">Student</th>
              <th scope="col" className="py-2 pr-4">Tutor</th>
              <th scope="col" className="py-2 pr-4">Subject</th>
              <th scope="col" className="py-2 pr-4">Since</th>
              <th scope="col" className="py-2 pr-4">State</th>
              <th scope="col" className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/60 last:border-0">
                <td className="py-3 pr-4 font-medium text-foreground">{row.studentName}</td>
                <td className="py-3 pr-4 text-foreground-muted">{row.tutorName}</td>
                <td className="py-3 pr-4 text-foreground-muted">{row.subjectName}</td>
                <td className="py-3 pr-4 text-foreground-muted tabular-nums">{row.startedAt}</td>
                <td className="py-3 pr-4">
                  {row.state === "active" ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Ended</Badge>
                  )}
                </td>
                <td className="py-3">
                  {row.state === "active" ? (
                    <RevokeCell row={row} />
                  ) : (
                    <p className="text-right text-xs text-foreground-subtle">already ended</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
}
