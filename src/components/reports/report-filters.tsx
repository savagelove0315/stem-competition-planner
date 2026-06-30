import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  ReportFilterOptions,
  ReportFilters,
} from "@/features/reports/types";

type ReportFiltersProps = {
  filters: ReportFilters;
  filterOptions: ReportFilterOptions;
};

export function ReportFilters({
  filters,
  filterOptions,
}: ReportFiltersProps) {
  return (
    <form className="rounded-lg border bg-card p-5 shadow-sm">
      <input type="hidden" name="report" value={filters.report} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Filters</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Narrow reports by date range, competition, student profile, and
            activity status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm">
            <Filter aria-hidden="true" />
            Apply
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/reports?report=${filters.report}`}>
              <RotateCcw aria-hidden="true" />
              Reset
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          <span>Grade level</span>
          <select
            name="gradeLevel"
            defaultValue={filters.gradeLevel ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All grades</option>
            {filterOptions.gradeLevels.map((gradeLevel) => (
              <option key={gradeLevel} value={gradeLevel}>
                {gradeLevel}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium">
          <span>Class name</span>
          <select
            name="className"
            defaultValue={filters.className ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All classes</option>
            {filterOptions.classNames.map((className) => (
              <option key={className} value={className}>
                {className}
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
            <option value="">All activity statuses</option>
            <option value="draft">Draft</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
    </form>
  );
}
