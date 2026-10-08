import { PageHeader } from "@/components/layout/page-header";
import { SubjectLevers } from "@/components/admin/subject-levers";
import { fetchSubjectRooms } from "@/lib/admin/data";

export const metadata = {
  title: "Subject Rooms · Academy Operations",
  description: "Global oversight of the six subject environments: density and motion character, per room.",
};

export default async function AdminSubjectsPage() {
  const rooms = await fetchSubjectRooms();

  return (
    <>
      <PageHeader
        title="Subject Rooms"
        description="Six environments, one lattice. Each room answers to two levers — density and motion character — and to nothing else."
      />
      <SubjectLevers rooms={rooms} />
    </>
  );
}
