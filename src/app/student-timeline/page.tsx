import { CalendarDays, Layers3, UsersRound, UserRoundCheck } from "lucide-react";

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

const summaryCards = [
  {
    key: "studentsShown",
    label: "Students shown",
    helper: "Rows in the current view",
    icon: UsersRound,
    accent: "border-violet-500/20 bg-violet-500/10 text-violet-700",
  },
  {
    key: "activitiesShown",
    label: "Activities shown",
    helper: "Unique visible activities",
    icon: CalendarDays,
    accent: "border-teal-500/20 bg-teal-500/10 text-teal-700",
  },
  {
    key: "dateRangeLabel",
    label: "Date range",
    helper: "Current timeline window",
    icon: Layers3,
    accent: "border-blue-500/20 bg-blue-500/10 text-blue-700",
  },
  {
    key: "multiCompetitionStudents",
    label: "Multi-competition students",
    helper: "Students in 2+ competitions",
    icon: UserRoundCheck,
    accent: "border-purple-500/20 bg-purple-500/10 text-purple-700",
  },
] as const;

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof UsersRound;
  accent: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg border ${accent}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 truncate text-xl font-semibold tracking-normal md:text-2xl">
            {value}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{helper}</p>
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
      <div className="relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm md:p-7">
        <div
          className="absolute right-0 top-0 h-40 w-72 rounded-full bg-blue-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -right-8 bottom-0 h-32 w-72 rounded-full bg-teal-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
            Student Timeline
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            View student schedules across dates to identify workload and potential
            clashes.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.key}
            label={card.label}
            value={viewModel.summary[card.key]}
            helper={card.helper}
            icon={card.icon}
            accent={card.accent}
          />
        ))}
      </div>

      <StudentTimelineFilters
        filters={filters}
        filterOptions={viewModel.filterOptions}
        dateColumns={viewModel.dateColumns}
      />

      <StudentTimelineTable viewModel={viewModel} />
    </section>
  );
}
