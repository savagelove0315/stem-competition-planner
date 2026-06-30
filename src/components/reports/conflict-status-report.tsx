import {
  EmptyValue,
  ReportEmptyState,
  StatusBadge,
} from "@/components/reports/report-badges";
import type { ConflictStatusReport as ConflictStatusReportType } from "@/features/reports/types";
import { cn } from "@/lib/utils";

export function ConflictStatusReport({
  report,
}: {
  report: ConflictStatusReportType;
}) {
  if (report.totalDetectedConflicts === 0) {
    return <ReportEmptyState />;
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Metric label="Mild conflicts" value={report.mildConflicts} />
        <Metric label="Warning conflicts" value={report.warningConflicts} />
        <Metric label="Reviewed" value={report.reviewedConflicts} />
        <Metric label="Resolved" value={report.resolvedConflicts} />
        <Metric label="Affected students" value={report.affectedStudents} />
      </div>

      <div className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Conflict status</h2>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Activity 1</th>
                <th className="px-4 py-3 font-medium">Activity 2</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Review status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {report.conflicts.map((conflict) => (
                <tr key={conflict.id}>
                  <td className="px-4 py-4 font-medium">
                    {conflict.studentName}
                  </td>
                  <td className="px-4 py-4">
                    {conflict.className ?? <EmptyValue />}
                  </td>
                  <td className="px-4 py-4">
                    {conflict.gradeLevel ?? <EmptyValue />}
                  </td>
                  <td className="px-4 py-4">{conflict.conflictDateLabel}</td>
                  <td className="px-4 py-4">{conflict.activityOneName}</td>
                  <td className="px-4 py-4">{conflict.activityTwoName}</td>
                  <td className="px-4 py-4">
                    <SeverityBadge severity={conflict.severity} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      value={
                        conflict.reviewStatus === "unreviewed"
                          ? "new / unreviewed"
                          : conflict.reviewStatus
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-normal">{value}</div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
        severity === "serious" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        severity === "mild" && "border-amber-500/40 bg-amber-500/10 text-amber-700",
        severity === "warning" && "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {severity}
    </span>
  );
}
