import { PageHeader } from "@/components/layout/page-header";
import { NotBuiltYet } from "@/components/shared/not-built-yet";
import { getPlannedModules } from "@/config/modules";
import { PORTAL_META } from "@/config/routes";

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="Admin overview" description={PORTAL_META.admin.blurb} />

      <NotBuiltYet
        scope="Admin dashboard"
        modules={getPlannedModules("admin")}
        note="The dashboard is deliberately left out of this task; the next build drops it into this exact shell."
      />
    </>
  );
}
