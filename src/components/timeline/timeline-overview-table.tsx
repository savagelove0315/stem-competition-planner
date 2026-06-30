import type {
  TimelineCellActivity,
  TimelineViewModel,
} from "@/features/timeline/types";

type TimelineOverviewTableProps = {
  viewModel: TimelineViewModel;
};

function ActivityBlock({ activity }: { activity: TimelineCellActivity }) {
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
      <div className="flex flex-wrap gap-x-2 gap-y-1 text-muted-foreground">
        <span>{activity.competitionLabel}</span>
        {activity.activityType ? <span>{activity.activityType}</span> : null}
        <span className="capitalize">{activity.status}</span>
      </div>
      <div className="font-medium">{activity.dateTimeLabel}</div>
      <div className="text-muted-foreground">
        {activity.participantCount} participant
        {activity.participantCount === 1 ? "" : "s"}
      </div>
    </div>
  );
}

export function TimelineOverviewTable({
  viewModel,
}: TimelineOverviewTableProps) {
  if (!viewModel.hasActivities) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No activities found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No activities found for the selected timeline filters.
        </p>
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
              <th className="sticky left-0 z-20 w-64 min-w-64 border-b bg-muted px-4 py-3 font-medium">
                {viewModel.view === "competition" ? "Competition" : "Activity"}
              </th>
              {viewModel.dateColumns.map((column) => (
                <th
                  key={column.key}
                  className="w-52 min-w-52 border-b border-l px-3 py-3 text-center font-medium"
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
              <tr key={row.id} className="align-top">
                <td className="sticky left-0 z-10 border-b bg-card px-4 py-4">
                  <div className="flex min-w-0 items-start gap-2">
                    <span
                      className="mt-1 size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{row.label}</div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {row.description}
                      </p>
                    </div>
                  </div>
                </td>
                {viewModel.dateColumns.map((column) => {
                  const cellActivities = row.cells[column.key] ?? [];

                  return (
                    <td
                      key={column.key}
                      className="h-32 w-52 min-w-52 border-b border-l bg-background/60 p-2"
                    >
                      {cellActivities.length > 0 ? (
                        <div className="grid gap-2">
                          {cellActivities.map((activity) => (
                            <ActivityBlock
                              key={`${activity.id}-${column.key}`}
                              activity={activity}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-full min-h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
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
