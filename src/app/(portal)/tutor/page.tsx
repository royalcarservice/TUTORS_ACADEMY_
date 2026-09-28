import { PageHeader } from "@/components/layout/page-header";
import { NotBuiltYet } from "@/components/shared/not-built-yet";
import { getPlannedModules } from "@/config/modules";
import { PORTAL_META } from "@/config/routes";

export default function TutorOverviewPage() {
  return (
    <>
      <PageHeader title="Tutor overview" description={PORTAL_META.tutor.blurb} />

      <NotBuiltYet
        scope="Tutor dashboard"
        modules={getPlannedModules("tutor")}
        note="The dashboard is deliberately left out of this task; the next build drops it into this exact shell."
      />
    </>
  );
}
