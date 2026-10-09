import { readdirSync } from "node:fs";
import { join } from "node:path";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isAuthConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "System · Academy Operations",
  description: "Service connection status: which services are live, and which stand in demonstration.",
};

/* The inspection panel. It reads env NAMES only — the values never
   render. Every card states the honest posture of one service. */

function StatusCard({
  title,
  live,
  liveLabel,
  demoLabel,
  detail,
}: {
  title: string;
  live: boolean;
  liveLabel: string;
  demoLabel: string;
  detail: string;
}) {
  return (
    <Card>
      <Card.Header className="flex flex-row items-start justify-between gap-4">
        <Card.Title>{title}</Card.Title>
        {live ? <Badge tone="success">{liveLabel}</Badge> : <Badge tone="warning">{demoLabel}</Badge>}
      </Card.Header>
      <Card.Body>
        <p className="text-sm leading-relaxed text-foreground-muted">{detail}</p>
      </Card.Body>
    </Card>
  );
}

export default function AdminSystemPage() {
  const supabaseLive = isAuthConfigured();
  const stripeLive = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  const livekitLive = Boolean(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);

  const migrations = readdirSync(join(process.cwd(), "supabase/migrations")).filter((f) => f.endsWith(".sql"));
  const first = migrations[0]?.slice(0, 4) ?? "0001";
  const last = migrations[migrations.length - 1]?.slice(0, 4) ?? "0000";

  return (
    <>
      <PageHeader
        title="System Status"
        description="The connection posture of the deployment. Absent credentials are stated calmly; nothing here renders a secret."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <StatusCard
          title="Database & Auth"
          live={supabaseLive}
          liveLabel="Live Supabase"
          demoLabel="Specimen Mock"
          detail={`${migrations.length} migrations authored, ${first}–${last}. ${
            supabaseLive
              ? "The anon key reads through Row Level Security; the service role answers only the admin console."
              : "Unapplied at launch by the owner's checklist; until then the specimen ledger serves every surface."
          }`}
        />
        <StatusCard
          title="Commerce Engine"
          live={stripeLive}
          liveLabel="Stripe Webhook Active"
          demoLabel="Simulated Demo"
          detail={
            stripeLive
              ? "Checkout hands the browser to the provider's hosted page; settlement arrives through the verified webhook."
              : "Settlement is simulated against the fixture ledger; the webhook answers one calm sentence."
          }
        />
        <StatusCard
          title="Live Acoustic Chambers"
          live={livekitLive}
          liveLabel="LiveKit Connected"
          demoLabel="Standby"
          detail={
            livekitLive
              ? "The room service stands ready; camera and microphone remain opt-in per participant."
              : "The chambers keep their quiet reduced state; the honest standby sentence renders in each room."
          }
        />
        <Card>
          <Card.Header className="flex flex-row items-start justify-between gap-4">
            <Card.Title>Compliance</Card.Title>
            <Badge tone="success">Certified</Badge>
          </Card.Header>
          <Card.Body className="flex flex-col gap-2">
            <p className="text-sm leading-relaxed text-foreground-muted">
              DPDP Act 2023 framework certified through Phase 10; exception E-07 stands closed; the
              zero-tracking posture holds (no cookie banner, nothing to consent to).
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="brand">DPDP Act 2023</Badge>
              <Badge tone="success">E-07 closed</Badge>
              <Badge tone="outline">18 open exceptions, all declared</Badge>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
