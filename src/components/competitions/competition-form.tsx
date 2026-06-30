"use client";

import { useActionState, useEffect, useId, useRef } from "react";
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
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const action =
    mode === "create" ? createCompetitionAction : updateCompetitionAction;
  const [state, formAction] = useActionState(action, initialState);
  const fieldIds = {
    name: `${formId}-name`,
    shortName: `${formId}-shortName`,
    status: `${formId}-status`,
    color: `${formId}-color`,
    icon: `${formId}-icon`,
    category: `${formId}-category`,
    noticeMode: `${formId}-noticeMode`,
    noticePeriod: `${formId}-noticePeriod`,
    startsAt: `${formId}-startsAt`,
    endsAt: `${formId}-endsAt`,
    registrationOpensAt: `${formId}-registrationOpensAt`,
    registrationClosesAt: `${formId}-registrationClosesAt`,
    description: `${formId}-description`,
    notes: `${formId}-notes`,
  };

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
          <label className="text-sm font-medium" htmlFor={fieldIds.name}>
            Name
          </label>
          <input
            id={fieldIds.name}
            name="name"
            defaultValue={competition?.name ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.shortName}>
            Short name
          </label>
          <input
            id={fieldIds.shortName}
            name="shortName"
            defaultValue={competition?.shortName ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.shortName} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.status}>
            Status
          </label>
          <select
            id={fieldIds.status}
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
          <label className="text-sm font-medium" htmlFor={fieldIds.color}>
            Color
          </label>
          <div className="flex gap-2">
            <input
              aria-label="Competition color picker"
              type="color"
              defaultValue={competition?.color ?? "#2563eb"}
              className="h-10 w-12 rounded-md border border-input bg-background p-1"
              onChange={(event) => {
                const textInput = event.currentTarget.nextElementSibling;
                if (textInput instanceof HTMLInputElement) {
                  textInput.value = event.currentTarget.value;
                }
              }}
            />
            <input
              id={fieldIds.color}
              name="color"
              defaultValue={competition?.color ?? "#2563eb"}
              className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <FieldError errors={state.fieldErrors?.color} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.icon}>
            Icon
          </label>
          <input
            id={fieldIds.icon}
            name="icon"
            defaultValue={competition?.icon ?? ""}
            placeholder="Optional icon token"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.icon} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.category}>
            Notice Category
          </label>
          <input
            id={fieldIds.category}
            name="category"
            defaultValue={competition?.category ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.category} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.noticeMode}>
            Mode for Notice
          </label>
          <input
            id={fieldIds.noticeMode}
            name="noticeMode"
            defaultValue={competition?.noticeMode ?? ""}
            placeholder="Optional parent-facing mode"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.noticeMode} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.noticePeriod}>
            Estimated Period for Notice
          </label>
          <input
            id={fieldIds.noticePeriod}
            name="noticePeriod"
            defaultValue={competition?.noticePeriod ?? ""}
            placeholder="Optional flexible display such as Date to be announced"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.noticePeriod} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.startsAt}>
            Start date
          </label>
          <input
            id={fieldIds.startsAt}
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(competition?.startsAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.startsAt} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.endsAt}>
            End date
          </label>
          <input
            id={fieldIds.endsAt}
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
            htmlFor={fieldIds.registrationOpensAt}
          >
            Registration opens
          </label>
          <input
            id={fieldIds.registrationOpensAt}
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
            htmlFor={fieldIds.registrationClosesAt}
          >
            Registration closes
          </label>
          <input
            id={fieldIds.registrationClosesAt}
            name="registrationClosesAt"
            type="datetime-local"
            defaultValue={toDateTimeInputValue(competition?.registrationClosesAt)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.registrationClosesAt} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.description}>
            Description
          </label>
          <textarea
            id={fieldIds.description}
            name="description"
            rows={3}
            defaultValue={competition?.description ?? ""}
            className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={fieldIds.notes}>
            Notes
          </label>
          <textarea
            id={fieldIds.notes}
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
