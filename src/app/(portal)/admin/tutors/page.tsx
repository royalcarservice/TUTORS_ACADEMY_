import { PageHeader } from "@/components/layout/page-header";
import { TutorRoster } from "@/components/admin/tutor-roster";
import { fetchTutorRoster } from "@/lib/admin/data";

export const metadata = {
  title: "Tutor Roster · Academy Operations",
  description: "Review registered tutors, approve the subjects they teach, and inspect their active relationships.",
};

export default async function AdminTutorsPage() {
  const tutors = await fetchTutorRoster();

  return (
    <>
      <PageHeader
        title="Tutor Roster"
        description="Who may teach where. A tutor's subjects are approved by the academy, never self-declared; each approved subject bounds what that tutor can see."
      />
      <TutorRoster tutors={tutors} />
    </>
  );
}
