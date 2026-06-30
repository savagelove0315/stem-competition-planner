"use client";

import { useActionState } from "react";
import { CheckCircle2, Eye, Loader2, RotateCcw, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { updateConflictReviewAction } from "@/features/conflicts/actions";
import type { ConflictReviewActionState } from "@/features/conflicts/schemas";
import type {
  ConflictReviewStatus,
  DetectedConflict,
} from "@/features/conflicts/types";
import { cn } from "@/lib/utils";

type ConflictReviewActionsProps = {
  conflict: DetectedConflict;
};

type IntentButtonProps = {
  intent: "review" | "resolve" | "reopen" | "save-note";
  disabled?: boolean;
};

const initialState: ConflictReviewActionState = {
  status: "idle",
  message: null,
};

const reviewStatusStyles: Record<ConflictReviewStatus, string> = {
  unreviewed: "border-muted bg-muted text-muted-foreground",
  reviewed: "border-primary/30 bg-primary/10 text-primary",
  resolved: "border-emerald-600/40 bg-emerald-600/10 text-emerald-700",
};

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

function HiddenConflictFields({ conflict }: { conflict: DetectedConflict }) {
  return (
    <>
      <input type="hidden" name="conflictKey" value={conflict.conflictKey} />
      <input type="hidden" name="studentId" value={conflict.student.id} />
      <input type="hidden" name="studentName" value={conflict.student.name} />
      <input
        type="hidden"
        name="activityOneId"
        value={conflict.activityOne.activityId}
      />
      <input
        type="hidden"
        name="activityOneCompetitionId"
        value={conflict.activityOne.competitionId}
      />
      <input
        type="hidden"
        name="activityOneName"
        value={conflict.activityOne.activityName}
      />
      <input
        type="hidden"
        name="activityTwoId"
        value={conflict.activityTwo.activityId}
      />
      <input
        type="hidden"
        name="activityTwoCompetitionId"
        value={conflict.activityTwo.competitionId}
      />
      <input
        type="hidden"
        name="activityTwoName"
        value={conflict.activityTwo.activityName}
      />
      <input
        type="hidden"
        name="conflictStartDate"
        value={conflict.conflictStartDate}
      />
      <input
        type="hidden"
        name="conflictEndDate"
        value={conflict.conflictEndDate}
      />
      <input
        type="hidden"
        name="conflictDateLabel"
        value={conflict.conflictDateLabel}
      />
      <input type="hidden" name="severity" value={conflict.severity} />
      <input type="hidden" name="reason" value={conflict.reason} />
      <input
        type="hidden"
        name="suggestedAction"
        value={conflict.suggestedAction}
      />
    </>
  );
}

function IntentButton({ intent, disabled = false }: IntentButtonProps) {
  const { pending } = useFormStatus();
  const Icon =
    intent === "review"
      ? Eye
      : intent === "resolve"
        ? CheckCircle2
        : intent === "reopen"
          ? RotateCcw
          : Save;
  const label =
    intent === "review"
      ? "Review"
      : intent === "resolve"
        ? "Resolve"
        : intent === "reopen"
          ? "Reopen"
          : "Save note";

  return (
    <Button type="submit" variant="outline" size="sm" disabled={disabled || pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Icon aria-hidden="true" />
      )}
      {pending ? "Saving" : label}
    </Button>
  );
}

function QuickActionForm({
  conflict,
  intent,
  disabled,
}: {
  conflict: DetectedConflict;
  intent: IntentButtonProps["intent"];
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(
    updateConflictReviewAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-1">
      <HiddenConflictFields conflict={conflict} />
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="teacherNote" value={conflict.teacherNote ?? ""} />
      <input
        type="hidden"
        name="resolutionNote"
        value={conflict.resolutionNote ?? ""}
      />
      <IntentButton intent={intent} disabled={disabled} />
      {state.status === "error" && state.message ? (
        <p className="max-w-52 text-xs text-destructive">{state.message}</p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="max-w-52 text-xs text-primary">{state.message}</p>
      ) : null}
    </form>
  );
}

function NoteForm({ conflict }: { conflict: DetectedConflict }) {
  const [state, formAction] = useActionState(
    updateConflictReviewAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-2">
      <HiddenConflictFields conflict={conflict} />
      <input type="hidden" name="intent" value="save-note" />
      <label className="grid gap-1 text-xs font-medium">
        <span>Teacher note</span>
        <textarea
          name="teacherNote"
          defaultValue={conflict.teacherNote ?? ""}
          className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Add review context"
        />
      </label>
      <label className="grid gap-1 text-xs font-medium">
        <span>Resolution note</span>
        <textarea
          name="resolutionNote"
          defaultValue={conflict.resolutionNote ?? ""}
          className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Add resolution details"
        />
      </label>
      <div>
        <IntentButton intent="save-note" />
      </div>
      {state.message ? (
        <p
          className={cn(
            "text-xs",
            state.status === "success" ? "text-primary" : "text-destructive",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function ConflictReviewActions({ conflict }: ConflictReviewActionsProps) {
  return (
    <div className="grid min-w-64 gap-3">
      <ReviewStatusBadge status={conflict.reviewStatus} />
      <div className="flex flex-wrap gap-2">
        <QuickActionForm
          conflict={conflict}
          intent="review"
          disabled={conflict.reviewStatus !== "unreviewed"}
        />
        <QuickActionForm
          conflict={conflict}
          intent="resolve"
          disabled={conflict.reviewStatus === "resolved"}
        />
        <QuickActionForm
          conflict={conflict}
          intent="reopen"
          disabled={conflict.reviewStatus !== "resolved"}
        />
      </div>
      <NoteForm conflict={conflict} />
    </div>
  );
}
