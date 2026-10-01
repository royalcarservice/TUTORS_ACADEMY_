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
        note="No admin account exists: the route and its guard are the whole of this portal today."
      />
    </>
  );
}
