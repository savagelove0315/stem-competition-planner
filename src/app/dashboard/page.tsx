import { CompetitionOverviewCard } from "@/components/dashboard/competition-overview-card";
import { ConflictAlertsCard } from "@/components/dashboard/conflict-alerts-card";
import { DashboardShortcuts } from "@/components/dashboard/dashboard-shortcuts";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { StudentWorkloadCard } from "@/components/dashboard/student-workload-card";
import { UpcomingActivitiesCard } from "@/components/dashboard/upcoming-activities-card";
import { getDashboardData } from "@/features/dashboard/queries";
import { buildDashboardViewModel } from "@/features/dashboard/utils";
import { requireUser } from "@/lib/auth/require-user";

export default async function DashboardPage() {
  await requireUser("/dashboard");

  const dashboardData = await getDashboardData();
  const viewModel = buildDashboardViewModel(dashboardData);

  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Planning</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Overview of competitions, activities, student workload, and
            schedule risks.
          </p>
        </div>
      </div>

      <DashboardSummaryCards summary={viewModel.summary} />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <UpcomingActivitiesCard
          activities={viewModel.upcomingActivities}
          hasActivities={viewModel.hasActivities}
        />
        <ConflictAlertsCard conflicts={viewModel.unresolvedConflicts} />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[1fr_1fr]">
        <CompetitionOverviewCard
          competitions={viewModel.competitionOverviews}
          hasCompetitions={viewModel.hasCompetitions}
        />
        <StudentWorkloadCard
          students={viewModel.studentWorkloads}
          hasStudents={viewModel.hasStudents}
        />
      </div>

      <DashboardShortcuts />
    </section>
  );
}
