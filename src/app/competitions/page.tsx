import { CompetitionForm } from "@/components/competitions/competition-form";
import { CompetitionList } from "@/components/competitions/competition-list";
import {
  listCompetitionEnrollments,
  listCompetitionEnrollmentStudentOptions,
} from "@/features/competition-enrollments/queries";
import { listCompetitions } from "@/features/competitions/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function CompetitionsPage() {
  await requireUser("/competitions");

  const [competitions, enrollments, studentOptions] = await Promise.all([
    listCompetitions(),
    listCompetitionEnrollments(),
    listCompetitionEnrollmentStudentOptions(),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Settings</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Competition Settings
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Manage dynamic competition categories used across the planner.
            Competition names come from the database so future categories can be
            added without application code changes.
          </p>
        </div>
      </div>

      <CompetitionForm mode="create" />
      <CompetitionList
        competitions={competitions}
        enrollments={enrollments}
        studentOptions={studentOptions}
      />
    </section>
  );
}
