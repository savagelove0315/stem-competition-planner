import {
  CompetitionBadge,
  EmptyValue,
  ReportEmptyState,
  StatusBadge,
} from "@/components/reports/report-badges";
import type { ActivityScheduleReportRow } from "@/features/reports/types";

export function ActivityScheduleReport({
  rows,
}: {
  rows: ActivityScheduleReportRow[];
}) {
  if (rows.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Activity schedule</h2>
      </div>
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Competition</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date / time</th>
              <th className="px-4 py-3 text-right font-medium">Participants</th>
              <th className="px-4 py-3 font-medium">Upcoming / past</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.activityId}>
                <td className="px-4 py-4 font-medium">{row.activityName}</td>
                <td className="px-4 py-4">
                  <CompetitionBadge
                    label={row.competitionLabel}
                    color={row.competitionColor}
                  />
                </td>
                <td className="px-4 py-4">
                  {row.activityType ?? <EmptyValue />}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={row.status} />
                </td>
                <td className="px-4 py-4">{row.dateTimeLabel}</td>
                <td className="px-4 py-4 text-right">{row.participantCount}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={row.timingStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
