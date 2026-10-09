"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { LEVER_LABELS, LEVER_OPTIONS } from "@/lib/environment/levers";
import { updateSubjectLevers, type SubjectRoomRow } from "@/lib/admin/data";

/* Subject Chamber oversight — the two levers a room honestly has
   (density and motion character, P6-R11). The copy stays truthful
   about their reach: the ambient is off under reduced motion and on
   small screens regardless of the setting. */

const selectSkin =
  "w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-foreground " +
  "min-h-[max(2.75rem,var(--ta-control-h))] focus:outline-none focus:ring-2 focus:ring-brand-300";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" aria-busy={pending} disabled={pending}>
      {pending ? "Shaping" : "Shape room"}
    </Button>
  );
}

function RoomLeverForm({ room }: { room: SubjectRoomRow }) {
  const [result, formAction] = useActionState(updateSubjectLevers, null);
  return (
    <Card key={`${room.subjectId}-${room.density}-${room.motionChar}`}>
      <Card.Header className="flex flex-row items-start justify-between gap-4">
        <div>
          <Card.Title>{room.room}</Card.Title>
          <Card.Description>{room.name} — {room.shapedNote}.</Card.Description>
        </div>
        <Badge tone="outline">{room.density} · {room.motionChar}</Badge>
      </Card.Header>
      <Card.Body>
        <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <input type="hidden" name="subjectId" value={room.subjectId} />
          <Field id={`density-${room.subjectId}`} label="Density">
            <select name="density" className={selectSkin} defaultValue={room.density}>
              {LEVER_OPTIONS.density.map((d) => (
                <option key={d} value={d}>{LEVER_LABELS.density[d]}</option>
              ))}
            </select>
          </Field>
          <Field id={`motion-${room.subjectId}`} label="Motion character">
            <select name="motionChar" className={selectSkin} defaultValue={room.motionChar}>
              {LEVER_OPTIONS.motionChar.map((m) => (
                <option key={m} value={m}>{LEVER_LABELS.motionChar[m]}</option>
              ))}
            </select>
          </Field>
          <SaveButton />
          <p aria-live="polite" className="sm:col-span-3 text-xs leading-relaxed text-foreground-muted">
            {result
              ? result.note
              : "Reach is honest: the ambient answers to these levers only where it runs, and stands down under reduced motion and on small screens."}
          </p>
        </form>
      </Card.Body>
    </Card>
  );
}

export function SubjectLevers({ rooms }: { rooms: SubjectRoomRow[] }) {
  return <div className="grid gap-4 lg:grid-cols-2">{rooms.map((r) => <RoomLeverForm key={r.subjectId} room={r} />)}</div>;
}
