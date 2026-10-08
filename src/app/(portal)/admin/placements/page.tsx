import { PageHeader } from "@/components/layout/page-header";
import { EstablishPlacement } from "@/components/admin/establish-placement";
import { PlacementsTable } from "@/components/admin/placements-table";
import { fetchPlacementsList, fetchRosterOptions } from "@/lib/admin/data";

export const metadata = {
  title: "Placements · Academy Operations",
  description: "Establish and end student–tutor placements within subjects.",
};

export default async function AdminPlacementsPage() {
  const [rows, options] = await Promise.all([fetchPlacementsList(), fetchRosterOptions()]);

  return (
    <>
      <PageHeader
        title="Placements"
        description="A placement admits one tutor to one student inside one subject. Establish new arrangements, or end them — the door closes without penalty."
      />
      <div className="flex flex-col gap-6">
        <EstablishPlacement options={options} />
        <PlacementsTable rows={rows} />
      </div>
    </>
  );
}
