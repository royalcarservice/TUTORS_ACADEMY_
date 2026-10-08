"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { createPlacement, type ActionResult, type RosterOptions } from "@/lib/admin/data";

/* Establish New Placement — the administrator's originating act:
   one student, one tutor, one subject. The select options arrive from
   the data layer; in demonstration mode they are the specimen ledger. */

const selectSkin =
  "w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground " +
  "min-h-[max(2.75rem,var(--ta-control-h))] focus:outline-none focus:ring-2 focus:ring-brand-300";

export function EstablishPlacement({ options }: { options: RosterOptions }) {
  const [result, formAction] = useActionState<ActionResult | null, FormData>(createPlacement, null);

  return (
    <Card id="establish" variant="raised">
      <Card.Header>
        <Card.Title>Establish new placement</Card.Title>
        <Card.Description>
          A placement admits one tutor to one student inside one subject. It is the only door between them.
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <form action={formAction} className="grid gap-4 sm:grid-cols-3">
          <Field id="est-student" label="Student">
            <select id="est-student" name="studentId" required className={selectSkin} defaultValue={options.students[0]?.id ?? ""}>
              {options.students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field id="est-tutor" label="Tutor">
            <select id="est-tutor" name="tutorId" required className={selectSkin} defaultValue={options.tutors[0]?.id ?? ""}>
              {options.tutors.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field id="est-subject" label="Subject">
            <select id="est-subject" name="subjectId" required className={selectSkin} defaultValue={options.subjects[0]?.id ?? ""}>
              {options.subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-3 flex items-center gap-4">
            <Button type="submit">Establish placement</Button>
            <p aria-live="polite" className="text-sm leading-relaxed text-foreground-muted">
              {result ? result.note : "Nothing happens outside the named subject."}
            </p>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
