"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  createActivityAction,
  updateActivityAction,
  type ActivityActionState,
} from "@/features/activities/actions";
import type {
  ActivityCompetitionOption,
  ActivityWithCompetition,
} from "@/features/activities/queries";
import {
  activityStatuses,
  activityTypes,
} from "@/features/activities/schemas";

type ActivityFormProps = {
  mode: "create" | "edit";
  activity?: ActivityWithCompetition;
  competitionOptions: ActivityCompetitionOption[];
  onCancel?: () => void;
};

const initialState: ActivityActionState = {
  status: "idle",
  message: null,
};

function dateInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

function timeInputValue(value: string | null | undefined): string {
  return value ? value.slice(11, 16) : "";
}

function SubmitButton({ mode }: Pick<ActivityFormProps, "mode">) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Save aria-hidden="true" />
      )}
      {pending
        ? mode === "create"
          ? "Adding"
          : "Saving"
        : mode === "create"
          ? "Add Activity"
          : "Save Changes"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function ActivityForm({
  mode,
  activity,
  competitionOptions,
  onCancel,
}: ActivityFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = mode === "create" ? createActivityAction : updateActivityAction;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (mode === "create" && state.status === "success") {
      formRef.current?.reset();
    }
  }, [mode, state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm"
    >
      {activity ? <input type="hidden" name="id" value={activity.id} /> : null}

      <div>
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Add activity" : "Edit activity"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Activities belong to one configured competition and become schedulable
          planner units.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-name`}>
            Activity name
          </label>
          <input
            id={`${mode}-name`}
            name="name"
            defaultValue={activity?.name ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-competitionId`}
          >
            Competition
          </label>
          <select
            id={`${mode}-competitionId`}
            name="competitionId"
            defaultValue={activity?.competitionId ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Choose a competition</option>
            {competitionOptions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.shortName
                  ? `${competition.shortName} - ${competition.name}`
                  : competition.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.competitionId} />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-activityType`}
          >
            Activity type
          </label>
          <select
            id={`${mode}-activityType`}
            name="activityType"
            defaultValue={activity?.activityType ?? "Training"}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            {activityTypes.map((activityType) => (
              <option key={activityType} value={activityType}>
                {activityType}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.activityType} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-startDate`}>
            Start date
          </label>
          <input
            id={`${mode}-startDate`}
            name="startDate"
            type="date"
            defaultValue={dateInputValue(activity?.startsAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.startDate} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-endDate`}>
            End date
          </label>
          <input
            id={`${mode}-endDate`}
            name="endDate"
            type="date"
            defaultValue={dateInputValue(activity?.endsAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.endDate} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-startTime`}>
            Start time
          </label>
          <input
            id={`${mode}-startTime`}
            name="startTime"
            type="time"
            defaultValue={timeInputValue(activity?.startsAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.startTime} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-endTime`}>
            End time
          </label>
          <input
            id={`${mode}-endTime`}
            name="endTime"
            type="time"
            defaultValue={timeInputValue(activity?.endsAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.endTime} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-location`}>
            Location
          </label>
          <input
            id={`${mode}-location`}
            name="location"
            defaultValue={activity?.location ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.location} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-capacity`}>
            Capacity
          </label>
          <input
            id={`${mode}-capacity`}
            name="capacity"
            type="number"
            min={1}
            defaultValue={activity?.capacity ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.capacity} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-status`}>
            Status
          </label>
          <select
            id={`${mode}-status`}
            name="status"
            defaultValue={activity?.status ?? "planned"}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            {activityStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </div>

        <label className="flex min-h-10 items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm">
          <input
            type="checkbox"
            name="requiresTeam"
            defaultChecked={activity?.requiresTeam ?? false}
            className="size-4 rounded border-input"
          />
          <span>Requires a team</span>
        </label>

        <div className="grid gap-2 md:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-description`}
          >
            Description
          </label>
          <textarea
            id={`${mode}-description`}
            name="description"
            rows={3}
            defaultValue={activity?.description ?? ""}
            className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-notes`}>
            Notes / remarks
          </label>
          <textarea
            id={`${mode}-notes`}
            name="notes"
            rows={3}
            defaultValue={activity?.notes ?? ""}
            className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </div>
      </div>

      {competitionOptions.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          Add a competition in Competition Settings before creating activities.
        </p>
      ) : null}

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "flex items-start gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {state.status === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : null}
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton mode={mode} />
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
