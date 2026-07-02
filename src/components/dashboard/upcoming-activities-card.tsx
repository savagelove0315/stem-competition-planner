"use client";

import { useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Clock,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { UpcomingActivityOverview } from "@/features/dashboard/types";
import { formatPlainTimeRange } from "@/lib/plain-date-time";

type UpcomingActivitiesCardProps = {
  activities: UpcomingActivityOverview[];
  hasActivities: boolean;
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatPlainDateParts(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return {
      month: "Date",
      day: "--",
      label: "Date not set",
    };
  }

  const monthIndex = Number(match[2]) - 1;
  const day = String(Number(match[3]));
  const month = monthNames[monthIndex] ?? "Date";

  return {
    month,
    day,
    label: `${month} ${day}`,
  };
}

function CompetitionBadge({ activity }: { activity: UpcomingActivityOverview }) {
  const competition = activity.competition;
  const color = competition?.color ?? "#64748b";
  const label = competition?.shortName ?? competition?.name ?? "Competition";

  return (
    <span
      className="inline-flex max-w-44 items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
      style={{ borderColor: color, backgroundColor: `${color}1A` }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function UpcomingActivitiesCard({
  activities,
  hasActivities,
}: UpcomingActivitiesCardProps) {
  const [expandedActivityIds, setExpandedActivityIds] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleActivity(activityId: string) {
    setExpandedActivityIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(activityId)) {
        nextIds.delete(activityId);
      } else {
        nextIds.add(activityId);
      }

      return nextIds;
    });
  }

  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-700">
              <CalendarClock className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Upcoming activities</h2>
              <p className="text-sm text-muted-foreground">
                Next scheduled activities with participants.
              </p>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/activities">View all</Link>
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            {hasActivities
              ? "No upcoming activities with a future start date. Check Activity Master for unscheduled or completed records."
              : "No activities yet. Create activities after setting up competitions."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/activities">Manage Activities</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 p-4">
          {activities.map((activity) => {
            const isExpanded = expandedActivityIds.has(activity.id);
            const dateParts = formatPlainDateParts(activity.startsAt);
            const timeLabel = formatPlainTimeRange(activity.startsAt, activity.endsAt);
            const unassignedLabel =
              activity.competition?.participationMode === "individual"
                ? "Registered / Assigned Students"
                : activity.competition?.participationMode === "mixed"
                  ? "Individual / No team assigned"
                  : "No team assigned";

            return (
              <div
                key={activity.id}
                className="grid gap-3 rounded-lg border bg-gradient-to-r from-slate-50 to-white p-3 shadow-sm"
              >
                <button
                  type="button"
                  className="grid min-w-0 gap-3 text-left sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto]"
                  aria-expanded={isExpanded}
                  onClick={() => toggleActivity(activity.id)}
                >
                  <span className="flex w-16 shrink-0 flex-col items-center justify-center rounded-md border bg-card px-2 py-2 shadow-sm">
                    <span className="text-[10px] font-semibold uppercase text-primary">
                      {dateParts.month}
                    </span>
                    <span className="text-2xl font-semibold leading-none">
                      {dateParts.day}
                    </span>
                  </span>

                  <span className="flex min-w-0 items-start gap-3">
                    <span className="mt-1 text-muted-foreground" aria-hidden="true">
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </span>
                    <span className="grid min-w-0 gap-2">
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="min-w-0 truncate font-semibold">
                          {activity.name}
                        </span>
                        <CompetitionBadge activity={activity} />
                      </span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        {activity.activityType ? <span>{activity.activityType}</span> : null}
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {timeLabel}
                        </span>
                        <span>{dateParts.label}</span>
                      </span>
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2 text-xs sm:pl-[4.75rem] lg:pl-0">
                    <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-medium capitalize text-emerald-700">
                      {activity.status}
                    </span>
                    <span className="rounded-md border bg-card px-2 py-1 font-medium">
                      {activity.participantCount} participants
                    </span>
                  </span>
                </button>

                {isExpanded ? (
                  <div className="grid gap-3 rounded-md border bg-background p-4 sm:ml-20">
                    {activity.teamGroups.length > 0 ? (
                      <div className="grid gap-3">
                        {activity.teamGroups.map((team) => (
                          <section key={team.teamId} className="grid gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <UsersRound
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <h4 className="font-medium">{team.teamName}</h4>
                              <span className="rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {team.students.length} student
                                {team.students.length === 1 ? "" : "s"}
                              </span>
                            </div>
                            <ul className="grid gap-1 pl-6 text-sm text-muted-foreground">
                              {team.students.map((student) => (
                                <li key={student.id}>{student.name}</li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    ) : null}

                    <section className="grid gap-2 border-t pt-3">
                      <h4 className="font-medium">{unassignedLabel}</h4>
                      {activity.unassignedStudents.length > 0 ? (
                        <ul className="grid gap-1 text-sm text-muted-foreground">
                          {activity.unassignedStudents.map((student) => (
                            <li key={student.id}>{student.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No assigned students in this group.
                        </p>
                      )}
                    </section>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
