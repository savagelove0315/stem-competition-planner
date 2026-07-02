import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  StudentTimelineDateColumn,
  StudentTimelineFilters,
  StudentTimelineViewModel,
} from "@/features/student-timeline/types";

type StudentTimelineFiltersProps = {
  filters: StudentTimelineFilters;
  filterOptions: StudentTimelineViewModel["filterOptions"];
  dateColumns: StudentTimelineDateColumn[];
};

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(value: Date, days: number) {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function getWeekStart(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return addDays(date, mondayOffset);
}

function buildRangeHref({
  filters,
  startDate,
  endDate,
}: {
  filters: StudentTimelineFilters;
  startDate: string;
  endDate: string;
}) {
  const params = new URLSearchParams();

  params.set("startDate", startDate);
  params.set("endDate", endDate);

  if (filters.competitionId) {
    params.set("competitionId", filters.competitionId);
  }

  if (filters.gradeLevel) {
    params.set("gradeLevel", filters.gradeLevel);
  }

  if (filters.className) {
    params.set("className", filters.className);
  }

  if (filters.onlyMultiCompetition) {
    params.set("onlyMultiCompetition", "1");
  }

  return `/student-timeline?${params.toString()}`;
}

function getRangeLinks(
  filters: StudentTimelineFilters,
  dateColumns: StudentTimelineDateColumn[],
) {
  const firstColumn = dateColumns[0];
  const lastColumn = dateColumns[dateColumns.length - 1];
  const fallbackStart = getWeekStart(new Date());
  const currentStart = firstColumn?.key ?? filters.startDate ?? toDateKey(fallbackStart);
  const currentEnd =
    lastColumn?.key ?? filters.endDate ?? toDateKey(addDays(parseDateKey(currentStart), 6));
  const previousStart = addDays(parseDateKey(currentStart), -7);
  const previousEnd = addDays(parseDateKey(currentEnd), -7);
  const nextStart = addDays(parseDateKey(currentStart), 7);
  const nextEnd = addDays(parseDateKey(currentEnd), 7);
  const todayStart = getWeekStart(new Date());
  const todayEnd = addDays(todayStart, 6);

  return {
    previous: buildRangeHref({
      filters,
      startDate: toDateKey(previousStart),
      endDate: toDateKey(previousEnd),
    }),
    next: buildRangeHref({
      filters,
      startDate: toDateKey(nextStart),
      endDate: toDateKey(nextEnd),
    }),
    today: buildRangeHref({
      filters,
      startDate: toDateKey(todayStart),
      endDate: toDateKey(todayEnd),
    }),
  };
}

export function StudentTimelineFilters({
  filters,
  filterOptions,
  dateColumns,
}: StudentTimelineFiltersProps) {
  const rangeLinks = getRangeLinks(filters, dateColumns);

  return (
    <form className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Timeline controls</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust the date window and student filters.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild type="button" variant="outline" size="icon">
              <Link href={rangeLinks.previous} aria-label="Previous week">
                <ChevronLeft aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild type="button" variant="outline" size="sm">
              <Link href={rangeLinks.today}>Today</Link>
            </Button>
            <Button asChild type="button" variant="outline" size="icon">
              <Link href={rangeLinks.next} aria-label="Next week">
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.2fr]">
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

          <label className="flex min-h-16 items-end gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium">
            <input
              name="onlyMultiCompetition"
              type="checkbox"
              defaultChecked={filters.onlyMultiCompetition}
              className="mb-1 size-4 rounded border-input accent-primary"
            />
            <span className="pb-0.5">Only multi-competition students</span>
          </label>

          <div className="flex min-h-16 flex-wrap items-end gap-2">
            <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Filter aria-hidden="true" />
              Apply
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/student-timeline">
                <RotateCcw aria-hidden="true" />
                Reset
              </Link>
            </Button>
            <span className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted px-2.5 text-xs font-medium text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Week grid
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
