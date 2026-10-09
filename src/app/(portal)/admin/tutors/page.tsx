import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { TutorApplications } from "@/components/admin/tutor-applications";
import { TutorRoster } from "@/components/admin/tutor-roster";
import { fetchTutorApplications, fetchTutorRoster } from "@/lib/admin/data";

export const metadata = {
  title: "Tutor Roster · Academy Operations",
  description: "Review registered tutors, approve the subjects they teach, and inspect their active relationships.",
};

export default async function AdminTutorsPage() {
  const [tutors, applications] = await Promise.all([fetchTutorRoster(), fetchTutorApplications()]);

  return (
    <>
      <PageHeader
        title="Tutor Roster"
        description="Who may teach where. A tutor's subjects are approved by the academy, never self-declared; each approved subject bounds what that tutor can see."
      />
      <div className="flex flex-col gap-8">
        <section aria-label="Pending approvals" className="flex flex-col gap-4">
          <SectionHeading
            title="Pending approvals"
            lede="Applications from the door at /tutor/apply. Approving verifies the account; the subjects it may teach are decided afterwards."
          />
          <TutorApplications applications={applications} />
        </section>
        <section aria-label="The roster" className="flex flex-col gap-4">
          <SectionHeading
            title="The roster"
            lede="Verified tutors, their approved subjects and their active relationships."
          />
          <TutorRoster tutors={tutors} />
        </section>
      </div>
    </>
  );
}
