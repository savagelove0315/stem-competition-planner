"use client";

import { Fragment, useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Ban,
  ChevronDown,
  ListChecks,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { ActivityForm } from "@/components/activities/activity-form";
import { ActivityParticipantsManager } from "@/components/activities/activity-participants-manager";
import { Button } from "@/components/ui/button";
import type {
  ActivityParticipantAssignment,
  ActivityParticipantStudentOption,
} from "@/features/activity-participants/queries";
import {
  archiveActivityAction,
  cancelActivityAction,
  deleteActivityAction,
  type ActivityActionState,
} from "@/features/activities/actions";
import type {
  ActivityCompetitionOption,
  ActivityWithCompetition,
} from "@/features/activities/queries";
import { cn } from "@/lib/utils";
import type { ActivityStatus } from "@/types/database";

type ActivityListProps = {
  activities: ActivityWithCompetition[];
  competitionOptions: ActivityCompetitionOption[];
  participantAssignments: ActivityParticipantAssignment[];
  participantStudentOptions: ActivityParticipantStudentOption[];
};

type StatusActionFormProps = {
  activity: ActivityWithCompetition;
  actionType: "cancel" | "archive";
};

type EditActivityModalProps = {
  activity: ActivityWithCompetition;
  competitionOptions: ActivityCompetitionOption[];
  onClose: () => void;
};

const initialStatusState: ActivityActionState = {
  status: "idle",
  message: null,
};

const initialDeleteState: ActivityActionState = {
  status: "idle",
  message: null,
};

const statusStyles: Record<ActivityStatus, string> = {
  draft: "border-muted bg-muted text-muted-foreground",
  planned: "border-accent/30 bg-accent/10 text-accent",
  active: "border-primary/30 bg-primary/10 text-primary",
  completed: "border-secondary/40 bg-secondary/15 text-secondary-foreground",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  archived: "border-border bg-background text-muted-foreground",
};

function EmptyMetadata() {
  return <span className="text-muted-foreground">Not set</span>;
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "Asia/Kuching",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kuching",
  }).format(new Date(value));
}

function formatTimeRange(activity: ActivityWithCompetition) {
  const startTime = formatTime(activity.startsAt);
  const endTime = formatTime(activity.endsAt);

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime ?? endTime;
}

function StatusSubmitButton({
  actionType,
  disabled,
}: {
  actionType: "cancel" | "archive";
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  const Icon = actionType === "cancel" ? Ban : Archive;
  const label = actionType === "cancel" ? "Cancel" : "Archive";
  const pendingLabel = actionType === "cancel" ? "Cancelling" : "Archiving";

  return (
    <Button type="submit" variant="outline" size="sm" disabled={disabled || pending}>
      <Icon aria-hidden="true" />
      {pending ? pendingLabel : label}
    </Button>
  );
}

function StatusActionForm({ activity, actionType }: StatusActionFormProps) {
  const action =
    actionType === "cancel" ? cancelActivityAction : archiveActivityAction;
  const [state, formAction] = useActionState(action, initialStatusState);
  const disabled =
    activity.status === "archived" ||
    (actionType === "cancel" && activity.status === "cancelled");

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={activity.id} />
      <StatusSubmitButton actionType={actionType} disabled={disabled} />
      {state.status === "error" && state.message ? (
        <p className="max-w-48 text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
      disabled={pending}
    >
      <Trash2 aria-hidden="true" />
      {pending ? "Deleting" : "Delete"}
    </Button>
  );
}

function DeleteActivityForm({ activity }: { activity: ActivityWithCompetition }) {
  const [state, formAction] = useActionState(
    deleteActivityAction,
    initialDeleteState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-2"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Delete this activity permanently? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={activity.id} />
      <DeleteSubmitButton />
      {state.message ? (
        <p
          className={cn(
            "max-w-64 text-xs",
            state.status === "success" ? "text-primary" : "text-destructive",
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function EditActivityModal({
  activity,
  competitionOptions,
  onClose,
}: EditActivityModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-activity-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl min-w-0 rounded-lg bg-background shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id="edit-activity-title" className="text-lg font-semibold">
              Edit Activity
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the selected activity without expanding the activity table.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <X aria-hidden="true" />
            Close
          </Button>
        </div>
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto p-5">
          <ActivityForm
            mode="edit"
            activity={activity}
            competitionOptions={competitionOptions}
            onCancel={onClose}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export function ActivityList({
  activities,
  competitionOptions,
  participantAssignments,
  participantStudentOptions,
}: ActivityListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedParticipantIds, setExpandedParticipantIds] = useState(
    () => new Set<string>(),
  );
  const editingActivity = useMemo(
    () => activities.find((activity) => activity.id === editingId) ?? null,
    [activities, editingId],
  );
  const participantsByActivity = useMemo(() => {
    const groupedParticipants = new Map<string, ActivityParticipantAssignment[]>();

    participantAssignments.forEach((participant) => {
      const participants = groupedParticipants.get(participant.activityId) ?? [];
      participants.push(participant);
      groupedParticipants.set(participant.activityId, participants);
    });

    return groupedParticipants;
  }, [participantAssignments]);
  function toggleParticipantManager(activityId: string) {
    setExpandedParticipantIds((current) => {
      const next = new Set(current);

      if (next.has(activityId)) {
        next.delete(activityId);
      } else {
        next.add(activityId);
      }

      return next;
    });
  }

  if (activities.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No activities yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create activities after setting up competitions. Once activities
          exist, assign participants so timelines and conflict checks can run.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">Activity records</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Activities are loaded from Supabase and linked to dynamic competition
            records.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/student-timeline">
            <ListChecks aria-hidden="true" />
            View Student Timeline
          </Link>
        </Button>
      </div>

      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Activity name</th>
              <th className="px-4 py-3 font-medium">Competition</th>
              <th className="px-4 py-3 font-medium">Activity type</th>
              <th className="px-4 py-3 font-medium">Start date</th>
              <th className="px-4 py-3 font-medium">End date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activities.map((activity) => {
              const competition = activity.competition;
              const timeRange = formatTimeRange(activity);
              const participants = participantsByActivity.get(activity.id) ?? [];
              const isParticipantsExpanded = expandedParticipantIds.has(activity.id);
              const participantsPanelId = `activity-${activity.id}-participants`;

              return (
                <Fragment key={activity.id}>
                  <tr className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium">{activity.name}</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {participants.length} assigned student
                        {participants.length === 1 ? "" : "s"}
                      </p>
                      {activity.description ? (
                        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                          {activity.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      {competition ? (
                        <span
                          className="inline-flex max-w-56 items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
                          style={{
                            borderColor: competition.color,
                            backgroundColor: `${competition.color}1A`,
                          }}
                        >
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: competition.color }}
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {competition.shortName ?? competition.name}
                          </span>
                        </span>
                      ) : (
                        <EmptyMetadata />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {activity.activityType ? (
                        activity.activityType
                      ) : (
                        <EmptyMetadata />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {formatDate(activity.startsAt) ?? <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      {formatDate(activity.endsAt) ?? <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      {timeRange ?? <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      {activity.location ? activity.location : <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                          statusStyles[activity.status],
                        )}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(activity.id)}
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <StatusActionForm activity={activity} actionType="cancel" />
                        <StatusActionForm activity={activity} actionType="archive" />
                        <div className="border-l pl-2">
                          <DeleteActivityForm activity={activity} />
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="bg-muted/20 px-4 py-4" colSpan={9}>
                      <div className="grid gap-3 rounded-md border bg-background p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <Users
                              className="size-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold">
                                Assign participants
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {participants.length} assigned student
                                {participants.length === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-controls={participantsPanelId}
                            aria-expanded={isParticipantsExpanded}
                            onClick={() => toggleParticipantManager(activity.id)}
                          >
                            <ChevronDown
                              className={cn(
                                "transition-transform",
                                isParticipantsExpanded ? "rotate-180" : "",
                              )}
                              aria-hidden="true"
                            />
                            {isParticipantsExpanded
                              ? "Hide Participants"
                              : "Manage Participants"}
                          </Button>
                        </div>

                        {isParticipantsExpanded ? (
                          <div id={participantsPanelId}>
                            <ActivityParticipantsManager
                              activityId={activity.id}
                              competitionId={activity.competitionId}
                              participants={participants}
                              studentOptions={participantStudentOptions}
                            />
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingActivity ? (
        <EditActivityModal
          activity={editingActivity}
          competitionOptions={competitionOptions}
          onClose={() => setEditingId(null)}
        />
      ) : null}
    </section>
  );
}
