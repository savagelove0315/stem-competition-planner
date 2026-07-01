"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  TrainingNoticeActivity,
  TrainingNoticeActivityFilters,
} from "@/features/notices/types";
import {
  filterTrainingNoticeActivities,
  formatNoticeField,
  formatTrainingNoticeDate,
  formatTrainingNoticeTime,
  sortTrainingNoticeActivities,
} from "@/features/notices/utils";
import { cn } from "@/lib/utils";

type TrainingActivitySelectorProps = {
  activities: TrainingNoticeActivity[];
  selectedActivityId: string;
  onSelectedActivityIdChange: (activityId: string) => void;
};

const emptyFilters: TrainingNoticeActivityFilters = {
  competitionId: "",
  activityType: "",
  search: "",
};

export function TrainingActivitySelector({
  activities,
  selectedActivityId,
  onSelectedActivityIdChange,
}: TrainingActivitySelectorProps) {
  const [filters, setFilters] =
    useState<TrainingNoticeActivityFilters>(emptyFilters);
  const competitions = useMemo(() => {
    const options = new Map<string, string>();

    activities.forEach((activity) => {
      if (activity.competition) {
        options.set(activity.competition.id, activity.competition.name);
      }
    });

    return [...options.entries()].sort((first, second) =>
      first[1].localeCompare(second[1]),
    );
  }, [activities]);
  const activityTypes = useMemo(
    () =>
      [...new Set(activities.map((activity) => activity.activityType).filter(Boolean))]
        .sort() as string[],
    [activities],
  );
  const filteredActivities = useMemo(
    () =>
      sortTrainingNoticeActivities(
        filterTrainingNoticeActivities(activities, filters),
      ),
    [activities, filters],
  );

  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Select training activity</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Choose an activity, then select assigned students for training notices.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm font-medium" htmlFor="training-search">
          <span>Search activity</span>
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="training-search"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Activity name, competition, or type"
            />
          </span>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label
            className="grid gap-1 text-sm font-medium"
            htmlFor="training-competition-filter"
          >
            <span>Competition</span>
            <select
              id="training-competition-filter"
              value={filters.competitionId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  competitionId: event.target.value,
                }))
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All competitions</option>
              {competitions.map(([competitionId, competitionName]) => (
                <option key={competitionId} value={competitionId}>
                  {competitionName}
                </option>
              ))}
            </select>
          </label>

          <label
            className="grid gap-1 text-sm font-medium"
            htmlFor="training-type-filter"
          >
            <span>Activity type</span>
            <select
              id="training-type-filter"
              value={filters.activityType}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  activityType: event.target.value,
                }))
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All activity types</option>
              {activityTypes.map((activityType) => (
                <option key={activityType} value={activityType}>
                  {activityType}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {filteredActivities.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
            No matching training activities. Upcoming non-cancelled,
            non-archived activities appear here by default.
          </p>
        ) : (
          filteredActivities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => onSelectedActivityIdChange(activity.id)}
              className={cn(
                "rounded-md border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5",
                selectedActivityId === activity.id &&
                  "border-primary bg-primary/10",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium">{activity.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatNoticeField(activity.competition?.name ?? null)}
                    {activity.activityType ? ` / ${activity.activityType}` : ""}
                  </p>
                </div>
                <span className="rounded-md border bg-card px-2 py-1 text-xs font-medium">
                  {activity.participants.length} participant
                  {activity.participants.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {formatTrainingNoticeDate(activity.startsAt)} /{" "}
                {formatTrainingNoticeTime(activity)} /{" "}
                {formatNoticeField(activity.location)}
              </p>
            </button>
          ))
        )}
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFilters(emptyFilters)}
        >
          Clear filters
        </Button>
      </div>
    </section>
  );
}
