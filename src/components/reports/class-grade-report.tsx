import {
  EmptyValue,
  ReportEmptyState,
} from "@/components/reports/report-badges";
import type { ClassGradeParticipationReportRow } from "@/features/reports/types";

export function ClassGradeReport({
  rows,
}: {
  rows: ClassGradeParticipationReportRow[];
}) {
  if (rows.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Class / grade participation</h2>
      </div>
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 text-right font-medium">Students involved</th>
              <th className="px-4 py-3 text-right font-medium">Registrations</th>
              <th className="px-4 py-3 text-right font-medium">Assignments</th>
              <th className="px-4 py-3 text-right font-medium">Unresolved conflicts</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-4 font-medium">
                  {row.className ?? <EmptyValue />}
                </td>
                <td className="px-4 py-4">{row.gradeLevel ?? <EmptyValue />}</td>
                <td className="px-4 py-4 text-right">{row.studentsInvolved}</td>
                <td className="px-4 py-4 text-right">
                  {row.competitionRegistrations}
                </td>
                <td className="px-4 py-4 text-right">{row.activityAssignments}</td>
                <td className="px-4 py-4 text-right">
                  {row.unresolvedConflicts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
