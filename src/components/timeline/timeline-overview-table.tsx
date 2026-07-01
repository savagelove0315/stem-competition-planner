import Link from "next/link";

import { Button } from "@/components/ui/button";
import type {
  TimelineCellActivity,
  TimelineDensity,
  TimelineViewModel,
} from "@/features/timeline/types";
import { cn } from "@/lib/utils";

type TimelineOverviewTableProps = {
  viewModel: TimelineViewModel;
};

const densityStyles: Record<
  TimelineDensity,
  {
    headerCell: string;
    headerDay: string;
    headerMeta: string;
    bodyCell: string;
    emptyCell: string;
    activityBlock: string;
    activityMeta: string;
    activityTitle: string;
    rowHeader: string;
  }
> = {
  comfortable: {
    headerCell: "w-60 min-w-60 px-3 py-3",
    headerDay: "text-base",
    headerMeta: "mt-1",
    bodyCell: "h-32 w-60 min-w-60 p-2",
    emptyCell: "min-h-24",
    activityBlock: "gap-1 px-2 py-1.5 text-xs",
    activityMeta: "flex-wrap gap-x-2 gap-y-1",
    activityTitle: "font-semibold",
    rowHeader: "w-64 min-w-64 px-4 py-4",
  },
  compact: {
    headerCell: "w-40 min-w-40 px-2 py-2",
    headerDay: "text-sm",
    headerMeta: "mt-0.5",
    bodyCell: "h-24 w-40 min-w-40 p-1.5",
    emptyCell: "min-h-16",
    activityBlock: "gap-1 px-2 py-1 text-[11px]",
    activityMeta: "gap-x-2 gap-y-0.5",
    activityTitle: "font-semibold",
    rowHeader: "w-56 min-w-56 px-3 py-3",
  },
  mini: {
    headerCell: "w-28 min-w-28 px-1.5 py-2",
    headerDay: "text-sm",
    headerMeta: "mt-0",
    bodyCell: "h-16 w-28 min-w-28 p-1",
    emptyCell: "min-h-10",
    activityBlock: "gap-0.5 px-1.5 py-1 text-[10px]",
    activityMeta: "gap-x-1",
    activityTitle: "font-medium",
    rowHeader: "w-44 min-w-44 px-3 py-3",
  },
};

function ActivityBlock({
  activity,
  density,
}: {
  activity: TimelineCellActivity;
  density: TimelineDensity;
}) {
  const styles = densityStyles[density];

  return (
    <div
      className={cn(
        "grid min-w-0 rounded-md border shadow-sm",
        styles.activityBlock,
      )}
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
        <span className={cn("truncate", styles.activityTitle)}>
          {activity.name}
        </span>
      </div>
      {density === "comfortable" ? (
        <>
          <div
            className={cn(
              "flex min-w-0 text-muted-foreground",
              styles.activityMeta,
            )}
          >
            <span className="truncate">{activity.competitionLabel}</span>
            {activity.activityType ? (
              <span className="truncate">{activity.activityType}</span>
            ) : null}
            <span className="capitalize">{activity.status}</span>
          </div>
          <div className="truncate font-medium">{activity.dateTimeLabel}</div>
          <div className="text-muted-foreground">
            {activity.participantCount} participant
            {activity.participantCount === 1 ? "" : "s"}
          </div>
        </>
      ) : null}
      {density === "compact" ? (
        <>
          <div className="truncate text-muted-foreground">
            {activity.competitionLabel}
          </div>
          <div className="truncate font-medium">{activity.dateTimeLabel}</div>
          <div className="text-muted-foreground">
            {activity.participantCount} participant
            {activity.participantCount === 1 ? "" : "s"}
          </div>
        </>
      ) : null}
      {density === "mini" ? (
        <div className="truncate text-muted-foreground">
          {activity.dateTimeLabel || `${activity.participantCount}p`}
        </div>
      ) : null}
    </div>
  );
}

export function TimelineOverviewTable({
  viewModel,
}: TimelineOverviewTableProps) {
  const styles = densityStyles[viewModel.density];

  if (!viewModel.hasActivities) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No activities found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create activities after setting up competitions, then return here to
          review the timeline.
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
          No activities found for the selected timeline filters.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th
                className={cn(
                  "sticky left-0 z-20 border-b bg-muted font-medium",
                  styles.rowHeader,
                )}
              >
                {viewModel.view === "competition" ? "Competition" : "Activity"}
              </th>
              {viewModel.dateColumns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "border-b border-l text-center font-medium",
                    styles.headerCell,
                  )}
                >
                  <div
                    className={cn(
                      "font-semibold text-foreground",
                      styles.headerDay,
                    )}
                  >
                    {column.dayNumber}
                  </div>
                  <div className="truncate">{column.weekday}</div>
                  <div className={cn("truncate normal-case", styles.headerMeta)}>
                    {column.dateLabel}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viewModel.rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td
                  className={cn(
                    "sticky left-0 z-10 border-b bg-card",
                    styles.rowHeader,
                  )}
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <span
                      className="mt-1 size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{row.label}</div>
                      {viewModel.density !== "mini" ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {row.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                {viewModel.dateColumns.map((column) => {
                  const cellActivities = row.cells[column.key] ?? [];

                  return (
                    <td
                      key={column.key}
                      className={cn(
                        "border-b border-l bg-background/60",
                        styles.bodyCell,
                      )}
                    >
                      {cellActivities.length > 0 ? (
                        <div
                          className={cn(
                            "grid",
                            viewModel.density === "mini" ? "gap-1" : "gap-2",
                          )}
                        >
                          {cellActivities.map((activity) => (
                            <ActivityBlock
                              key={`${activity.id}-${column.key}`}
                              activity={activity}
                              density={viewModel.density}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex h-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground",
                            styles.emptyCell,
                          )}
                        >
                          {viewModel.density === "mini" ? null : "Empty"}
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
