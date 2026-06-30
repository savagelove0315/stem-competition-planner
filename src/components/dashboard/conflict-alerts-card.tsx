import Link from "next/link";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  ConflictDetectionSeverity,
  ConflictReviewStatus,
  DetectedConflict,
} from "@/features/conflicts/types";
import { cn } from "@/lib/utils";

type ConflictAlertsCardProps = {
  conflicts: DetectedConflict[];
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

const reviewStatusStyles: Record<ConflictReviewStatus, string> = {
  unreviewed: "border-muted bg-muted text-muted-foreground",
  reviewed: "border-primary/30 bg-primary/10 text-primary",
  resolved: "border-emerald-600/40 bg-emerald-600/10 text-emerald-700",
};

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

function ReviewStatusBadge({ status }: { status: ConflictReviewStatus }) {
  const label = status === "unreviewed" ? "New / unreviewed" : status;

  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
        reviewStatusStyles[status],
      )}
    >
      {label}
    </span>
  );
}

export function ConflictAlertsCard({ conflicts }: ConflictAlertsCardProps) {
  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Conflict alerts</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Unresolved live conflicts, with serious risks first.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/conflicts">Review Conflicts</Link>
        </Button>
      </div>

      {conflicts.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">
          No conflicts detected.
        </div>
      ) : (
        <div className="divide-y">
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="grid gap-3 px-5 py-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="font-medium">{conflict.student.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {conflict.student.className ?? "Class not set"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {conflict.student.gradeLevel ?? "Grade not set"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {conflict.activityOne.activityName}
                </span>{" "}
                and{" "}
                <span className="font-medium text-foreground">
                  {conflict.activityTwo.activityName}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={conflict.severity} />
                <ReviewStatusBadge status={conflict.reviewStatus} />
                <span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium">
                  {conflict.conflictDateLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
