import { Activity, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

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
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 md:gap-5">
      <div className="overflow-hidden rounded-lg border border-cyan-200/20 bg-[#071a3a] text-white shadow-sm">
        <div className="relative isolate px-4 py-4 sm:px-6 md:px-8 md:py-5">
          <div
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(124,58,237,0.55),transparent_30%),radial-gradient(circle_at_28%_90%,rgba(20,184,166,0.45),transparent_34%),linear-gradient(120deg,#071a3a_0%,#0b255c_46%,#06223f_100%)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]"
            aria-hidden="true"
          />
          <div className="absolute right-5 top-4 hidden h-16 w-16 rounded-full border border-cyan-300/20 md:block" />
          <div className="absolute bottom-4 right-10 hidden h-16 w-40 rounded-full bg-cyan-300/10 blur-2xl md:block" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Competition command centre
              </div>
              <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-5 text-cyan-50/90">
                Plan, train, compete, and achieve.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs sm:w-auto sm:min-w-80">
              <div className="rounded-md border border-white/15 bg-white/10 p-2.5 backdrop-blur">
                <ShieldCheck className="mb-1 size-4 text-cyan-200" aria-hidden="true" />
                <p className="text-base font-semibold leading-none">
                  {viewModel.summary.activeCompetitions}
                </p>
                <p className="text-cyan-50/75">Active</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-2.5 backdrop-blur">
                <Activity className="mb-1 size-4 text-violet-200" aria-hidden="true" />
                <p className="text-base font-semibold leading-none">
                  {viewModel.summary.upcomingActivities}
                </p>
                <p className="text-cyan-50/75">Upcoming</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-2.5 backdrop-blur">
                <AlertTriangle
                  className="mb-1 size-4 text-amber-200"
                  aria-hidden="true"
                />
                <p className="text-base font-semibold leading-none">
                  {viewModel.summary.seriousUnresolvedConflicts}
                </p>
                <p className="text-cyan-50/75">Serious</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardSummaryCards summary={viewModel.summary} />

      <div className="grid min-w-0 gap-4 md:gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <UpcomingActivitiesCard
          activities={viewModel.upcomingActivities}
          hasActivities={viewModel.hasActivities}
        />
        <ConflictAlertsCard
          conflicts={viewModel.unresolvedConflicts}
          seriousCount={viewModel.summary.seriousUnresolvedConflicts}
          unresolvedCount={viewModel.summary.unresolvedConflicts}
        />
      </div>

      <div className="grid min-w-0 gap-4 md:gap-5 xl:grid-cols-[1fr_1fr]">
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
