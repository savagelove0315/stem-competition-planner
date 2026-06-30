import { StudentTimelineFilters } from "@/components/student-timeline/student-timeline-filters";
import { StudentTimelineTable } from "@/components/student-timeline/student-timeline-table";
import { getStudentTimelineData } from "@/features/student-timeline/queries";
import {
  buildStudentTimelineViewModel,
  parseStudentTimelineFilters,
} from "@/features/student-timeline/utils";
import { requireUser } from "@/lib/auth/require-user";

type StudentTimelinePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-normal">{value}</div>
    </div>
  );
}

export default async function StudentTimelinePage({
  searchParams,
}: StudentTimelinePageProps) {
  await requireUser("/student-timeline");

  const resolvedSearchParams = await searchParams;
  const filters = parseStudentTimelineFilters(resolvedSearchParams);
  const timelineData = await getStudentTimelineData();
  const viewModel = buildStudentTimelineViewModel({
    ...timelineData,
    filters,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Planning</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Student Timeline
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            View student activity schedules across competitions.
          </p>
        </div>
      </div>

      <StudentTimelineFilters
        filters={filters}
        filterOptions={viewModel.filterOptions}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Students shown"
          value={viewModel.summary.studentsShown}
        />
        <SummaryCard
          label="Activities shown"
          value={viewModel.summary.activitiesShown}
        />
        <SummaryCard
          label="Date range"
          value={viewModel.summary.dateRangeLabel}
        />
        <SummaryCard
          label="Multi-competition students"
          value={viewModel.summary.multiCompetitionStudents}
        />
      </div>

      <StudentTimelineTable viewModel={viewModel} />
    </section>
  );
}
