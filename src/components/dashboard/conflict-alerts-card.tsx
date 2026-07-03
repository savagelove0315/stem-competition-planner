import Link from "next/link";
import { AlertCircle, AlertTriangle, Info, Radar, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  ConflictDetectionSeverity,
  ConflictReviewStatus,
  DetectedConflict,
} from "@/features/conflicts/types";
import { cn } from "@/lib/utils";

type ConflictAlertsCardProps = {
  conflicts: DetectedConflict[];
  seriousCount: number;
  unresolvedCount: number;
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

export function ConflictAlertsCard({
  conflicts,
  seriousCount,
  unresolvedCount,
}: ConflictAlertsCardProps) {
  const hasConflicts = unresolvedCount > 0;

  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md border border-teal-500/20 bg-teal-500/10 text-teal-700">
              <Radar className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold">Conflict radar</h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Live schedule risks from existing conflict checks.
              </p>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/conflicts">Review conflicts</Link>
        </Button>
      </div>

      <div className="grid gap-3 p-3">
        <div className="grid gap-3 rounded-lg border bg-gradient-to-br from-slate-50 to-white p-3 sm:grid-cols-[auto_1fr]">
          <div className="relative flex size-16 items-center justify-center rounded-full bg-emerald-500/10 sm:size-20">
            <div className="absolute size-14 rounded-full border border-emerald-500/20 sm:size-16" />
            <div className="absolute size-10 rounded-full border border-emerald-500/30 bg-emerald-500/10 sm:size-12" />
            <span
              className={cn(
                "relative flex size-9 items-center justify-center rounded-full text-white shadow-sm sm:size-10",
                seriousCount > 0 ? "bg-rose-600" : "bg-emerald-600",
              )}
            >
              {seriousCount > 0 ? (
                <AlertCircle className="size-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-5" aria-hidden="true" />
              )}
            </span>
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <p
              className={cn(
                "text-lg font-semibold",
                seriousCount > 0 ? "text-rose-700" : "text-emerald-700",
              )}
            >
              {seriousCount > 0
                ? `${seriousCount} serious unresolved`
                : "All clear"}
            </p>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {hasConflicts
                ? `${unresolvedCount} unresolved conflict${
                    unresolvedCount === 1 ? "" : "s"
                  } need review.`
                : "No conflicts detected. Schedules are balanced."}
            </p>
            <Button asChild size="sm" className="mt-3 w-fit">
              <Link href="/conflicts">Open conflict review</Link>
            </Button>
          </div>
        </div>

        {conflicts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No unresolved conflicts are currently listed.
          </p>
        ) : (
          <div className="grid gap-2.5">
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="grid gap-2 rounded-lg border p-2.5">
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
      </div>
    </section>
  );
}
