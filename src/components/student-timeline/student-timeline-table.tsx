import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  Info,
  Layers3,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  StudentTimelineCellActivity,
  StudentTimelineViewModel,
} from "@/features/student-timeline/types";
import { cn } from "@/lib/utils";

type StudentTimelineTableProps = {
  viewModel: StudentTimelineViewModel;
};

function EmptyMetadata() {
  return <span className="text-muted-foreground">Not set</span>;
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "ST";
}

function StudentBadge({
  isMultiCompetition,
}: {
  isMultiCompetition: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium",
        isMultiCompetition
          ? "border-teal-500/20 bg-teal-500/10 text-teal-700"
          : "border-sky-500/20 bg-sky-500/10 text-sky-700",
      )}
    >
      {isMultiCompetition ? "Multi" : "Single"}
    </span>
  );
}

function ActivityBadge({
  activity,
}: {
  activity: StudentTimelineCellActivity;
}) {
  return (
    <div
      className="grid min-w-0 gap-1 rounded-md border-l-4 border-y border-r bg-white px-2 py-1.5 text-xs shadow-sm"
      style={{
        borderColor: activity.competitionColor,
        backgroundColor: `${activity.competitionColor}14`,
      }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: activity.competitionColor }}
          aria-hidden="true"
        />
        <span className="truncate font-semibold">{activity.name}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 text-muted-foreground">
        {activity.activityType ? <span>{activity.activityType}</span> : null}
        {activity.status ? (
          <span className="capitalize">{activity.status}</span>
        ) : null}
      </div>
      {activity.timeLabel ? (
        <div className="font-medium">{activity.timeLabel}</div>
      ) : null}
      <div
        className="w-fit max-w-full truncate rounded-md border bg-white/80 px-1.5 py-0.5 font-medium"
        style={{ borderColor: `${activity.competitionColor}66` }}
      >
        {activity.competitionLabel}
      </div>
    </div>
  );
}

function StudentIdentity({
  row,
}: {
  row: StudentTimelineViewModel["rows"][number];
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-700">
        {getInitials(row.student.name)}
      </span>
      <div className="min-w-0">
        <div className="truncate font-semibold">{row.student.name}</div>
        {row.student.studentCode ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {row.student.studentCode}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>{row.student.className ? row.student.className : <EmptyMetadata />}</span>
          <span aria-hidden="true">/</span>
          <span>
            {row.student.gradeLevel ? row.student.gradeLevel : <EmptyMetadata />}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StudentBadge isMultiCompetition={row.student.isMultiCompetition} />
          <span className="rounded-md border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {row.activityCount} this range
          </span>
        </div>
      </div>
    </div>
  );
}

export function StudentTimelineTable({ viewModel }: StudentTimelineTableProps) {
  if (!viewModel.hasParticipantData) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No activity participants yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Assign students to activities before using the student timeline.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/activities">Go to Activity Master</Link>
        </Button>
      </section>
    );
  }

  if (viewModel.rows.length === 0 || viewModel.dateColumns.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No timeline entries match</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Adjust the filters to view scheduled student activity assignments.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-700">
            <CalendarDays className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Weekly student schedule</h2>
            <p className="text-sm text-muted-foreground">
              Activities are grouped by student and date from participant assignments.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/conflicts">
            View conflicts
            <ExternalLink aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="hidden min-w-0 lg:block">
        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth">
          <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-slate-50 text-xs text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-20 w-64 min-w-64 border-b bg-slate-50 px-4 py-3 font-medium shadow-[8px_0_16px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-2">
                  <UsersRound className="size-4" aria-hidden="true" />
                  <span>Student</span>
                </div>
                <div className="mt-1 text-[11px] font-normal">Class / grade / load</div>
              </th>
              {viewModel.dateColumns.map((column) => (
                <th
                  key={column.key}
                  className="w-40 min-w-40 border-b border-l px-3 py-3 text-center font-medium"
                >
                  <div className="text-sm font-semibold text-foreground">
                    {column.weekday}
                  </div>
                  <div className="mt-1 text-xs normal-case">{column.dateLabel}</div>
                </th>
              ))}
            </tr>
            </thead>
            <tbody>
            {viewModel.rows.map((row) => (
              <tr key={row.student.id} className="align-top">
                <td className="sticky left-0 z-10 border-b bg-card px-4 py-4 shadow-[8px_0_16px_rgba(15,23,42,0.04)]">
                  <StudentIdentity row={row} />
                </td>
                {viewModel.dateColumns.map((column) => {
                  const cellActivities = row.cells[column.key] ?? [];

                  return (
                    <td
                      key={column.key}
                      className="h-28 w-40 min-w-40 border-b border-l bg-background/60 p-2"
                    >
                      {cellActivities.length > 0 ? (
                        <div className="grid gap-2">
                          {cellActivities.map((activity) => (
                            <ActivityBadge
                              key={`${activity.assignmentId}-${column.key}`}
                              activity={activity}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full min-h-20 items-center justify-center">
                          <span className="size-1.5 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-1.5">
            <Info className="size-3.5" aria-hidden="true" />
            Numbers show total activities for the selected date range.
          </span>
          <span>Scroll horizontally inside the timeline to view more dates.</span>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {viewModel.rows.map((row) => (
          <section key={row.student.id} className="rounded-lg border bg-background p-3">
            <StudentIdentity row={row} />
            <div className="mt-4 grid gap-3">
              {viewModel.dateColumns.map((column) => {
                const cellActivities = row.cells[column.key] ?? [];

                return (
                  <div key={column.key} className="rounded-md border bg-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{column.weekday}</div>
                        <div className="text-xs text-muted-foreground">
                          {column.dateLabel}
                        </div>
                      </div>
                      <span className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {cellActivities.length}
                      </span>
                    </div>
                    {cellActivities.length > 0 ? (
                      <div className="mt-3 grid gap-2">
                        {cellActivities.map((activity) => (
                          <ActivityBadge
                            key={`${activity.assignmentId}-${column.key}`}
                            activity={activity}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-slate-300" />
                        No activity
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <div className="rounded-md border bg-muted p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Layers3 className="size-3.5" aria-hidden="true" />
            <span>Compact mobile schedule view</span>
          </div>
        </div>
      </div>
    </section>
  );
}
