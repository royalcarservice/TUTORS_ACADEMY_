import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchAdminOverview } from "@/lib/admin/data";
import { ROUTES } from "@/config/routes";

/* Track 1 — the operations overview. Disciplined figures, no flashing
   counters: every number is a still fact about the academy's rooms,
   placements and credentialing. */

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <Card.Body className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-foreground-subtle uppercase">{label}</p>
        <p className="text-3xl font-semibold text-foreground tabular-nums">{value}</p>
        <p className="text-sm leading-relaxed text-foreground-muted">{detail}</p>
      </Card.Body>
    </Card>
  );
}

export default async function AdminOverviewPage() {
  const overview = await fetchAdminOverview();
  const readyRooms = overview.rooms.filter((r) => r.status === "ready");

  return (
    <>
      <PageHeader
        title="Academy Operations"
        description="The back office: placements, credentialing and the six subject rooms, held in one quiet place."
        actions={
          <Link href={`${ROUTES.admin}/placements#establish`}>
            <Button>Establish new placement</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Placed students"
          value={String(overview.placedStudents)}
          detail="Students holding at least one active placement with a tutor."
        />
        <Metric
          label="Verified tutors"
          value={String(overview.verifiedTutors)}
          detail="Tutors whose credentialing has been decided by the academy."
        />
        <Metric
          label="Active placements"
          value={String(overview.activeRelationships)}
          detail="Living student–tutor arrangements across the subjects."
        />
        <Card>
          <Card.Body className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wide text-foreground-subtle uppercase">Platform lineage</p>
            <p className="text-sm leading-relaxed text-foreground">{overview.lineage}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="success">Phase 10 gate</Badge>
              <Badge tone="brand">DEC-040</Badge>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <Card.Header>
            <Card.Title>Active subject rooms</Card.Title>
            <Card.Description>
              {readyRooms.length === 1
                ? "One room stands ready."
                : `${readyRooms.length} rooms stand ready.`}{" "}
              Every subject is its own environment; the operations console shapes them from the Subject Rooms surface.
            </Card.Description>
          </Card.Header>
          <Card.Body className="flex flex-wrap gap-2">
            {overview.rooms.map((room) => (
              <Badge key={room.id} tone={room.status === "ready" ? "brand" : "outline"}>
                {room.room} · {room.name}
              </Badge>
            ))}
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
