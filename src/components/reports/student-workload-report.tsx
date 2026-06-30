import {
  EmptyValue,
  ReportEmptyState,
  WorkloadBadge,
} from "@/components/reports/report-badges";
import type { StudentWorkloadReportRow } from "@/features/reports/types";

export function StudentWorkloadReport({
  rows,
}: {
  rows: StudentWorkloadReportRow[];
}) {
  if (rows.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Student workload</h2>
      </div>
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Student code</th>
              <th className="px-4 py-3 text-right font-medium">Competitions</th>
              <th className="px-4 py-3 text-right font-medium">Activities</th>
              <th className="px-4 py-3 text-right font-medium">Upcoming</th>
              <th className="px-4 py-3 text-right font-medium">Unresolved conflicts</th>
              <th className="px-4 py-3 font-medium">Workload</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.studentId}>
                <td className="px-4 py-4 font-medium">{row.studentName}</td>
                <td className="px-4 py-4">{row.className ?? <EmptyValue />}</td>
                <td className="px-4 py-4">{row.gradeLevel ?? <EmptyValue />}</td>
                <td className="px-4 py-4">{row.studentCode ?? <EmptyValue />}</td>
                <td className="px-4 py-4 text-right">{row.competitionCount}</td>
                <td className="px-4 py-4 text-right">
                  {row.activitiesAssignedCount}
                </td>
                <td className="px-4 py-4 text-right">
                  {row.upcomingActivitiesCount}
                </td>
                <td className="px-4 py-4 text-right">
                  {row.unresolvedConflictsCount}
                </td>
                <td className="px-4 py-4">
                  <WorkloadBadge level={row.workloadLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
