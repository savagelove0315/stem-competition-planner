"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  createCompetitionAction,
  updateCompetitionAction,
  type CompetitionActionState,
} from "@/features/competitions/actions";
import { competitionStatuses } from "@/features/competitions/schemas";
import type { Competition } from "@/types/database";

type CompetitionFormProps = {
  mode: "create" | "edit";
  competition?: Competition;
  onCancel?: () => void;
};

const initialState: CompetitionActionState = {
  status: "idle",
  message: null,
};

function toDateTimeInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

function SubmitButton({ mode }: Pick<CompetitionFormProps, "mode">) {
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
          ? "Add Competition"
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

export function CompetitionForm({
  mode,
  competition,
  onCancel,
}: CompetitionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const action =
    mode === "create" ? createCompetitionAction : updateCompetitionAction;
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
      {competition ? <input type="hidden" name="id" value={competition.id} /> : null}

      <div>
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Add competition" : "Edit competition"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure a competition record that other planner workflows can use later.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-name`}>
            Name
          </label>
          <input
            id={`${mode}-name`}
            name="name"
            defaultValue={competition?.name ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-status`}>
            Status
          </label>
          <select
            id={`${mode}-status`}
            name="status"
            defaultValue={competition?.status ?? "draft"}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            {competitionStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-startsAt`}>
            Start date
          </label>
          <input
            id={`${mode}-startsAt`}
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(competition?.startsAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.startsAt} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-endsAt`}>
            End date
          </label>
          <input
            id={`${mode}-endsAt`}
            name="endsAt"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(competition?.endsAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.endsAt} />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-registrationOpensAt`}
          >
            Registration opens
          </label>
          <input
            id={`${mode}-registrationOpensAt`}
            name="registrationOpensAt"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(competition?.registrationOpensAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.registrationOpensAt} />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-registrationClosesAt`}
          >
            Registration closes
          </label>
          <input
            id={`${mode}-registrationClosesAt`}
            name="registrationClosesAt"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(competition?.registrationClosesAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.registrationClosesAt} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-description`}>
            Description
          </label>
          <textarea
            id={`${mode}-description`}
            name="description"
            rows={3}
            defaultValue={competition?.description ?? ""}
            className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-notes`}>
            Notes
          </label>
          <textarea
            id={`${mode}-notes`}
            name="notes"
            rows={3}
            defaultValue={competition?.notes ?? ""}
            className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </div>
      </div>

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
