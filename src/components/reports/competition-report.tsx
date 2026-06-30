import {
  CompetitionBadge,
  ReportEmptyState,
  StatusBadge,
} from "@/components/reports/report-badges";
import type { CompetitionParticipationReportRow } from "@/features/reports/types";

export function CompetitionReport({
  rows,
}: {
  rows: CompetitionParticipationReportRow[];
}) {
  if (rows.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Competition participation</h2>
      </div>
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Competition</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Enrolled students</th>
              <th className="px-4 py-3 text-right font-medium">Activities</th>
              <th className="px-4 py-3 text-right font-medium">Assignments</th>
              <th className="px-4 py-3 text-right font-medium">Multi-competition</th>
              <th className="px-4 py-3 text-right font-medium">Upcoming activities</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.competitionId}>
                <td className="px-4 py-4">
                  <CompetitionBadge
                    label={row.competitionLabel}
                    color={row.competitionColor}
                  />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={row.status} />
                </td>
                <td className="px-4 py-4 text-right font-medium">
                  {row.enrolledStudentCount}
                </td>
                <td className="px-4 py-4 text-right">{row.activityCount}</td>
                <td className="px-4 py-4 text-right">
                  {row.participantAssignmentCount}
                </td>
                <td className="px-4 py-4 text-right">
                  {row.multiCompetitionStudentCount}
                </td>
                <td className="px-4 py-4 text-right">
                  {row.upcomingActivityCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
