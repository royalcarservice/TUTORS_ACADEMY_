"use client";

import { useActionState } from "react";

import { Alert, Button, Checkbox, Input, Label, Textarea } from "@/components/ui";
import { submitTutorApplication, type ActionResult } from "@/lib/admin/data";
import { SUBJECTS } from "@/lib/subjects/subjects";

/* Track 2 — the scholarly application door. A prospective educator names
   their background and the subjects they would teach; an administrator
   decides each application before any subject opens. */

export function ApplyForm({ configured }: { configured: boolean }) {
  const [result, action] = useActionState<ActionResult | null, FormData>(submitTutorApplication, null);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Apply to teach
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
        The academy reviews every application before a subject opens. An
        approved tutor teaches only inside the subjects of their placement,
        and sees only the students placed with them there.
      </p>

      {!configured ? (
        <div className="mt-6">
          <Alert variant="info" title="Demonstration deployment">
            <p>
              No database is configured here; a submission joins the demonstration ledger an
              administrator reviews at the operations console, and no production store.
            </p>
          </Alert>
        </div>
      ) : null}

      <form action={action} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-name">Full name</Label>
          <Input id="apply-name" name="name" autoComplete="name" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-email">Email address</Label>
          <Input id="apply-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-password">Password</Label>
          <Input id="apply-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <p className="text-xs leading-relaxed text-foreground-muted">
            At least 8 characters. It becomes your account password if the application is approved.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-background">Academic background</Label>
          <Textarea id="apply-background" name="background" rows={5} required />
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Subjects you would teach</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {SUBJECTS.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              >
                <Checkbox name="subjects" value={s.id} />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center gap-4">
          <Button type="submit">Submit for review</Button>
          {result ? (
            <p aria-live="polite" className="text-sm leading-relaxed text-foreground-muted">
              {result.note}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
