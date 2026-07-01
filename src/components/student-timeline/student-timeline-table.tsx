import Link from "next/link";

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

function ActivityBadge({
  activity,
}: {
  activity: StudentTimelineCellActivity;
}) {
  return (
    <div
      className="grid min-w-0 gap-1 rounded-md border px-2 py-1.5 text-xs shadow-sm"
      style={{
        borderColor: activity.competitionColor,
        backgroundColor: `${activity.competitionColor}1A`,
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
      <div className="flex flex-wrap gap-1 text-muted-foreground">
        <span>{activity.competitionLabel}</span>
        {activity.activityType ? <span>{activity.activityType}</span> : null}
      </div>
      {activity.timeLabel ? (
        <div className="font-medium">{activity.timeLabel}</div>
      ) : null}
    </div>
  );
}

function StudentMeta({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{value ? value : <EmptyMetadata />}</div>
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
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Activities are read from participant assignments and grouped by date.
        </p>
      </div>

      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-20 w-56 min-w-56 border-b bg-muted px-4 py-3 font-medium">
                Student
              </th>
              <th className="sticky left-56 z-20 w-32 min-w-32 border-b bg-muted px-4 py-3 font-medium">
                Class
              </th>
              <th className="sticky left-[22rem] z-20 w-32 min-w-32 border-b bg-muted px-4 py-3 font-medium">
                Grade
              </th>
              <th className="sticky left-[30rem] z-20 w-40 min-w-40 border-b bg-muted px-4 py-3 font-medium">
                Status
              </th>
              {viewModel.dateColumns.map((column) => (
                <th
                  key={column.key}
                  className="w-44 min-w-44 border-b border-l px-3 py-3 text-center font-medium"
                >
                  <div className="text-base font-semibold text-foreground">
                    {column.dayNumber}
                  </div>
                  <div>{column.weekday}</div>
                  <div className="mt-1 normal-case">{column.dateLabel}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viewModel.rows.map((row) => (
              <tr key={row.student.id} className="align-top">
                <td className="sticky left-0 z-10 border-b bg-card px-4 py-4">
                  <div className="font-medium">{row.student.name}</div>
                  {row.student.studentCode ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.student.studentCode}
                    </p>
                  ) : null}
                </td>
                <td className="sticky left-56 z-10 border-b bg-card px-4 py-4">
                  <StudentMeta label="Class" value={row.student.className} />
                </td>
                <td className="sticky left-[22rem] z-10 border-b bg-card px-4 py-4">
                  <StudentMeta label="Grade" value={row.student.gradeLevel} />
                </td>
                <td className="sticky left-[30rem] z-10 border-b bg-card px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-1 text-xs font-medium",
                      row.student.isMultiCompetition
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {row.student.isMultiCompetition
                      ? "Multi-competition"
                      : "Single competition"}
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {row.student.activeCompetitionCount} competition
                    {row.student.activeCompetitionCount === 1 ? "" : "s"}
                  </p>
                </td>
                {viewModel.dateColumns.map((column) => {
                  const cellActivities = row.cells[column.key] ?? [];

                  return (
                    <td
                      key={column.key}
                      className="h-28 w-44 min-w-44 border-b border-l bg-background/60 p-2"
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
                        <div className="flex h-full min-h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                          Empty
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
    </section>
  );
}
