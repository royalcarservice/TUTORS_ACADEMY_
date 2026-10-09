"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveTutorApplication, type TutorApplication } from "@/lib/admin/data";

/* Track 2 — the administrator's side of the application door: every
   pending application, and the one decision that opens an account. */

function ApproveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" aria-busy={pending} disabled={pending}>
      {pending ? "Approving" : "Approve"}
    </Button>
  );
}

function ApplicationCard({ application }: { application: TutorApplication }) {
  const [result, formAction] = useActionState(approveTutorApplication, null);
  return (
    <Card variant="raised">
      <Card.Header className="flex flex-row items-start justify-between gap-4">
        <div>
          <Card.Title>{application.name}</Card.Title>
          <Card.Description>
            {application.email ? `${application.email} · ` : ""}submitted {application.submittedAt}.
          </Card.Description>
        </div>
        <Badge tone="warning">Pending approval</Badge>
      </Card.Header>
      <Card.Body className="flex flex-col gap-3">
        {application.background ? (
          <p className="text-sm leading-relaxed text-foreground-muted">{application.background}</p>
        ) : null}
        {application.subjects.length ? (
          <div className="flex flex-wrap gap-1.5">
            {application.subjects.map((s) => (
              <Badge key={s} tone="brand">{s}</Badge>
            ))}
          </div>
        ) : null}
        <div className="flex items-start justify-end gap-3">
          {result ? (
            <p aria-live="polite" className="text-xs leading-relaxed text-foreground-muted">{result.note}</p>
          ) : null}
          <form action={formAction}>
            <input type="hidden" name="applicationId" value={application.id} />
            <ApproveButton />
          </form>
        </div>
      </Card.Body>
    </Card>
  );
}

export function TutorApplications({ applications }: { applications: TutorApplication[] }) {
  if (applications.length === 0) {
    return (
      <Card>
        <Card.Body>
          <p className="text-sm leading-relaxed text-foreground-muted">
            No application awaits a decision. The door at /tutor/apply stands open.
          </p>
        </Card.Body>
      </Card>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {applications.map((a) => (
        <ApplicationCard key={a.id} application={a} />
      ))}
    </div>
  );
}
