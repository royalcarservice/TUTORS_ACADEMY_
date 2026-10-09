"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveTutorSubject, type TutorRow } from "@/lib/admin/data";

/* The credentialing ledger — who may teach where. Approval is the
   administrator's; a tutor's subjects are never self-serve. */

function ApproveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" aria-busy={pending} disabled={pending}>
      {pending ? "Approving" : "Approve subject"}
    </Button>
  );
}

function ApproveCell({ tutor, subjectId, subjectName }: { tutor: TutorRow; subjectId: string; subjectName: string }) {
  const [result, formAction] = useActionState(approveTutorSubject, null);
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-border-strong px-3 py-2">
      <div>
        <p className="text-sm text-foreground">{subjectName}</p>
        <p className="text-xs text-foreground-subtle">awaiting credentialing decision</p>
        {result ? <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{result.note}</p> : null}
      </div>
      <form action={formAction} className="shrink-0">
        <input type="hidden" name="tutorId" value={tutor.id} />
        <input type="hidden" name="subjectId" value={subjectId} />
        <ApproveButton />
      </form>
    </div>
  );
}

export function TutorRoster({ tutors }: { tutors: TutorRow[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tutors.map((tutor) => (
        <Card key={tutor.id}>
          <Card.Header className="flex flex-row items-start justify-between gap-4">
            <div>
              <Card.Title>{tutor.name}</Card.Title>
              <Card.Description>
                {tutor.activeRelationships === 1
                  ? "One active relationship."
                  : `${tutor.activeRelationships} active relationships.`}
              </Card.Description>
            </div>
            {tutor.status === "verified" ? (
              <Badge tone="success">Verified</Badge>
            ) : (
              <Badge tone="warning">Pending</Badge>
            )}
          </Card.Header>
          <Card.Body className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wide text-foreground-subtle uppercase">Approved subjects</p>
            {tutor.activeSubjects.length ? (
              <div className="flex flex-wrap gap-1.5">
                {tutor.activeSubjects.map((s) => (
                  <Badge key={s} tone="brand">{s}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No subject approved yet.</p>
            )}
            {tutor.pendingSubjects.length ? (
              <>
                <p className="mt-3 text-xs font-semibold tracking-wide text-foreground-subtle uppercase">Awaiting approval</p>
                {tutor.pendingSubjects.map((s) => (
                  <ApproveCell
                    key={s}
                    tutor={tutor}
                    subjectId={s.toLowerCase()}
                    subjectName={s}
                  />
                ))}
              </>
            ) : null}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
