import { PageHeader } from "@/components/layout/page-header";
import { NotBuiltYet } from "@/components/shared/not-built-yet";
import { getPlannedModules } from "@/config/modules";
import { PORTAL_META } from "@/config/routes";

export default function StudentOverviewPage() {
  return (
    <>
      <PageHeader
        title="Student overview"
        description={PORTAL_META.student.blurb}
      />

      <NotBuiltYet
        scope="Student dashboard"
        modules={getPlannedModules("student")}
        note="The dashboard is deliberately left out of this task; the next build drops it into this exact shell."
      />
    </>
  );
}
