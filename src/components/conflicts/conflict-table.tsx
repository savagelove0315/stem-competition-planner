import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import type {
  ActivityConflictSide,
  ConflictDetectionSeverity,
  ConflictViewModel,
} from "@/features/conflicts/types";
import { cn } from "@/lib/utils";

type ConflictTableProps = {
  viewModel: ConflictViewModel;
};

const severityStyles: Record<ConflictDetectionSeverity, string> = {
  serious: "border-destructive/30 bg-destructive/10 text-destructive",
  mild: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  warning: "border-primary/30 bg-primary/10 text-primary",
};

const severityIcons = {
  serious: AlertCircle,
  mild: AlertTriangle,
  warning: Info,
} satisfies Record<ConflictDetectionSeverity, typeof AlertCircle>;

function EmptyMetadata() {
  return <span className="text-muted-foreground">Not set</span>;
}

function CompetitionBadge({ activity }: { activity: ActivityConflictSide }) {
  return (
    <span
      className="inline-flex max-w-48 items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
      style={{
        borderColor: activity.competitionColor,
        backgroundColor: `${activity.competitionColor}1A`,
      }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: activity.competitionColor }}
        aria-hidden="true"
      />
      <span className="truncate">{activity.competitionLabel}</span>
    </span>
  );
}

function SeverityBadge({ severity }: { severity: ConflictDetectionSeverity }) {
  const Icon = severityIcons[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium capitalize",
        severityStyles[severity],
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {severity}
    </span>
  );
}

export function ConflictTable({ viewModel }: ConflictTableProps) {
  if (!viewModel.hasParticipantData) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No activity participants yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Assign students to activities before using conflict detection.
        </p>
      </section>
    );
  }

  if (viewModel.conflicts.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No conflicts detected</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No conflicts detected for the selected filters.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Detected conflicts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Conflicts are computed live from current student activity assignments.
        </p>
      </div>

      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1500px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Conflict date</th>
              <th className="px-4 py-3 font-medium">Activity 1</th>
              <th className="px-4 py-3 font-medium">Competition 1</th>
              <th className="px-4 py-3 font-medium">Activity 1 time</th>
              <th className="px-4 py-3 font-medium">Activity 2</th>
              <th className="px-4 py-3 font-medium">Competition 2</th>
              <th className="px-4 py-3 font-medium">Activity 2 time</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Suggested action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {viewModel.conflicts.map((conflict) => (
              <tr key={conflict.id} className="align-top">
                <td className="px-4 py-4">
                  <div className="font-medium">{conflict.student.name}</div>
                  {conflict.student.studentCode ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {conflict.student.studentCode}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  {conflict.student.className ?? <EmptyMetadata />}
                </td>
                <td className="px-4 py-4">
                  {conflict.student.gradeLevel ?? <EmptyMetadata />}
                </td>
                <td className="px-4 py-4 font-medium">
                  {conflict.conflictDateLabel}
                </td>
                <td className="px-4 py-4 font-medium">
                  {conflict.activityOne.activityName}
                </td>
                <td className="px-4 py-4">
                  <CompetitionBadge activity={conflict.activityOne} />
                </td>
                <td className="px-4 py-4">{conflict.activityOne.timeLabel}</td>
                <td className="px-4 py-4 font-medium">
                  {conflict.activityTwo.activityName}
                </td>
                <td className="px-4 py-4">
                  <CompetitionBadge activity={conflict.activityTwo} />
                </td>
                <td className="px-4 py-4">{conflict.activityTwo.timeLabel}</td>
                <td className="px-4 py-4">
                  <SeverityBadge severity={conflict.severity} />
                </td>
                <td className="max-w-72 px-4 py-4 text-muted-foreground">
                  {conflict.reason}
                </td>
                <td className="max-w-72 px-4 py-4">
                  {conflict.suggestedAction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
