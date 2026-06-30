import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  TimelineFilters as TimelineFiltersState,
  TimelineViewModel,
} from "@/features/timeline/types";

type TimelineFiltersProps = {
  filters: TimelineFiltersState;
  filterOptions: TimelineViewModel["filterOptions"];
};

export function TimelineFilters({
  filters,
  filterOptions,
}: TimelineFiltersProps) {
  return (
    <form className="rounded-lg border bg-card p-5 shadow-sm">
      <input type="hidden" name="view" value={filters.view} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Filters</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Narrow the timeline by date, competition, activity status, and type.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm">
            <Filter aria-hidden="true" />
            Apply
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/timeline">
              <RotateCcw aria-hidden="true" />
              Reset
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="grid gap-1 text-sm font-medium">
          <span>Month</span>
          <input
            name="month"
            type="month"
            defaultValue={filters.month ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          <span>Start date</span>
          <input
            name="startDate"
            type="date"
            defaultValue={filters.startDate ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          <span>End date</span>
          <input
            name="endDate"
            type="date"
            defaultValue={filters.endDate ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          <span>Competition</span>
          <select
            name="competitionId"
            defaultValue={filters.competitionId ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All competitions</option>
            {filterOptions.competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.shortName ?? competition.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium">
          <span>Activity status</span>
          <select
            name="activityStatus"
            defaultValue={filters.activityStatus ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Default active set</option>
            {filterOptions.activityStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium">
          <span>Activity type</span>
          <select
            name="activityType"
            defaultValue={filters.activityType ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All types</option>
            {filterOptions.activityTypes.map((activityType) => (
              <option key={activityType} value={activityType}>
                {activityType}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
