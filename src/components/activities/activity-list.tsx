"use client";

import { Fragment, useActionState, useState } from "react";
import { Archive, Ban, Pencil } from "lucide-react";
import { useFormStatus } from "react-dom";

import { ActivityForm } from "@/components/activities/activity-form";
import { Button } from "@/components/ui/button";
import {
  archiveActivityAction,
  cancelActivityAction,
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
};

type StatusActionFormProps = {
  activity: ActivityWithCompetition;
  actionType: "cancel" | "archive";
};

const initialStatusState: ActivityActionState = {
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

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
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

export function ActivityList({
  activities,
  competitionOptions,
}: ActivityListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (activities.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No activities yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No activities yet. Add your first activity to start building the planner.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Activity records</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Activities are loaded from Supabase and linked to dynamic competition
          records.
        </p>
      </div>

      <div className="overflow-x-auto">
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

              return (
                <Fragment key={activity.id}>
                  <tr className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium">{activity.name}</div>
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
                          onClick={() =>
                            setEditingId((current) =>
                              current === activity.id ? null : activity.id,
                            )
                          }
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <StatusActionForm activity={activity} actionType="cancel" />
                        <StatusActionForm activity={activity} actionType="archive" />
                      </div>
                    </td>
                  </tr>

                  {editingId === activity.id ? (
                    <tr>
                      <td className="bg-muted/30 px-4 py-4" colSpan={9}>
                        <ActivityForm
                          mode="edit"
                          activity={activity}
                          competitionOptions={competitionOptions}
                          onCancel={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
