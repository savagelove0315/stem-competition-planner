import { ActivityScheduleReport } from "@/components/reports/activity-schedule-report";
import { ClassGradeReport } from "@/components/reports/class-grade-report";
import { CompetitionReport } from "@/components/reports/competition-report";
import { ConflictStatusReport } from "@/components/reports/conflict-status-report";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportSummaryCards } from "@/components/reports/report-summary-cards";
import { ReportTypeTabs } from "@/components/reports/report-type-tabs";
import { StudentWorkloadReport } from "@/components/reports/student-workload-report";
import { getReportsData } from "@/features/reports/queries";
import {
  buildReportsViewModel,
  parseReportFilters,
} from "@/features/reports/utils";
import { requireUser } from "@/lib/auth/require-user";

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireUser("/reports");

  const resolvedSearchParams = await searchParams;
  const filters = parseReportFilters(resolvedSearchParams);
  const reportsData = await getReportsData();
  const viewModel = buildReportsViewModel(reportsData, filters);

  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Planning</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Reports
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Review participation, workload, schedules, and conflict status.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Reports are read-only summaries. Export and print options will be
            added in a later phase.
          </p>
        </div>
      </div>

      <ReportTypeTabs filters={viewModel.filters} />

      <ReportFilters
        filters={viewModel.filters}
        filterOptions={viewModel.filterOptions}
      />

      <ReportSummaryCards summaryCards={viewModel.summaryCards} />

      {viewModel.filters.report === "competition" ? (
        <CompetitionReport rows={viewModel.competitionRows} />
      ) : null}

      {viewModel.filters.report === "student-workload" ? (
        <StudentWorkloadReport rows={viewModel.studentWorkloadRows} />
      ) : null}

      {viewModel.filters.report === "activity-schedule" ? (
        <ActivityScheduleReport rows={viewModel.activityScheduleRows} />
      ) : null}

      {viewModel.filters.report === "conflicts" ? (
        <ConflictStatusReport report={viewModel.conflictStatus} />
      ) : null}

      {viewModel.filters.report === "class-grade" ? (
        <ClassGradeReport rows={viewModel.classGradeRows} />
      ) : null}
    </section>
  );
}
