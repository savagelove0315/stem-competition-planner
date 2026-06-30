import { TimelineFilters } from "@/components/timeline/timeline-filters";
import { TimelineOverviewTable } from "@/components/timeline/timeline-overview-table";
import { TimelineSummaryCards } from "@/components/timeline/timeline-summary-cards";
import { TimelineViewToggle } from "@/components/timeline/timeline-view-toggle";
import { getTimelineData } from "@/features/timeline/queries";
import {
  buildTimelineViewModel,
  parseTimelineFilters,
} from "@/features/timeline/utils";

type TimelinePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseTimelineFilters(resolvedSearchParams);
  const timelineData = await getTimelineData();
  const viewModel = buildTimelineViewModel({
    ...timelineData,
    filters,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Planning</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Timeline Overview
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            View activities across competitions and dates.
          </p>
        </div>
      </div>

      <TimelineFilters
        filters={filters}
        filterOptions={viewModel.filterOptions}
      />

      <TimelineSummaryCards summary={viewModel.summary} />

      <TimelineViewToggle filters={filters} />

      <TimelineOverviewTable viewModel={viewModel} />
    </section>
  );
}
