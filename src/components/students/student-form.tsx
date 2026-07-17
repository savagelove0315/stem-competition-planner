"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  createStudentAction,
  updateStudentAction,
  type StudentActionState,
} from "@/features/students/actions";
import {
  getMyKidFormValue,
  isValidStoredMyKidNumber,
  studentStatuses,
} from "@/features/students/schemas";
import type {
  StudentCompetitionOption,
  StudentWithCompetitions,
} from "@/features/students/queries";
import { cn } from "@/lib/utils";

type StudentFormProps = {
  mode: "create" | "edit";
  student?: StudentWithCompetitions;
  competitionOptions: StudentCompetitionOption[];
  onCancel?: () => void;
  showHeader?: boolean;
  surface?: "card" | "plain";
};

const initialState: StudentActionState = {
  status: "idle",
  message: null,
};

function SubmitButton({ mode }: Pick<StudentFormProps, "mode">) {
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
          ? "Add Student"
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

export function StudentForm({
  mode,
  student,
  competitionOptions,
  onCancel,
  showHeader = true,
  surface = "card",
}: StudentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submissionInFlightRef = useRef(false);
  const action = mode === "create" ? createStudentAction : updateStudentAction;
  const [state, formAction] = useActionState(action, initialState);
  const selectedCompetitionIds = new Set(
    student?.competitionAssignments.map(
      (assignment) => assignment.competitionId,
    ) ?? [],
  );

  useEffect(() => {
    submissionInFlightRef.current = false;

    if (mode === "create" && state.status === "success") {
      formRef.current?.reset();
    }
  }, [mode, state]);

  const hasInvalidStoredMyKid =
    Boolean(student?.myKidNumber) &&
    !isValidStoredMyKidNumber(student?.myKidNumber);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(event) => {
        if (submissionInFlightRef.current) {
          event.preventDefault();
          return;
        }

        submissionInFlightRef.current = true;
      }}
      className={cn(
        "grid w-full gap-5",
        surface === "card" && "rounded-lg border bg-card p-5 shadow-sm",
      )}
    >
      {student ? <input type="hidden" name="id" value={student.id} /> : null}

      {showHeader ? (
        <div>
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Add student" : "Edit student"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign students to one or more competitions configured in settings.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-firstName`}>
            First name
          </label>
          <input
            id={`${mode}-firstName`}
            name="firstName"
            defaultValue={student?.firstName ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.firstName} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-lastName`}>
            Last name
          </label>
          <input
            id={`${mode}-lastName`}
            name="lastName"
            defaultValue={student?.lastName ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.lastName} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-displayName`}>
            Display name
          </label>
          <input
            id={`${mode}-displayName`}
            name="displayName"
            defaultValue={student?.displayName ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.displayName} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-studentCode`}>
            Student code
          </label>
          <input
            id={`${mode}-studentCode`}
            name="studentCode"
            defaultValue={student?.studentCode ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.studentCode} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-myKidNumber`}>
            MyKid number
          </label>
          <input
            id={`${mode}-myKidNumber`}
            name="myKidNumber"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            defaultValue={getMyKidFormValue(student?.myKidNumber)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.myKidNumber} />
          {hasInvalidStoredMyKid ? (
            <p className="text-xs text-destructive">
              The saved MyKid value is invalid. Enter a valid 12-digit number
              to replace it.
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-className`}>
            Class name
          </label>
          <input
            id={`${mode}-className`}
            name="className"
            defaultValue={student?.className ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.className} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-gradeLevel`}>
            Grade / year
          </label>
          <input
            id={`${mode}-gradeLevel`}
            name="gradeLevel"
            defaultValue={student?.gradeLevel ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.gradeLevel} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-status`}>
            Status
          </label>
          <select
            id={`${mode}-status`}
            name="status"
            defaultValue={student?.status ?? "active"}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            {studentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-email`}>
            Email
          </label>
          <input
            id={`${mode}-email`}
            name="email"
            type="email"
            defaultValue={student?.email ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-phone`}>
            Phone
          </label>
          <input
            id={`${mode}-phone`}
            name="phone"
            defaultValue={student?.phone ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-guardianName`}
          >
            Guardian name
          </label>
          <input
            id={`${mode}-guardianName`}
            name="guardianName"
            defaultValue={student?.guardianName ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.guardianName} />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-guardianContact`}
          >
            Guardian contact
          </label>
          <input
            id={`${mode}-guardianContact`}
            name="guardianContact"
            defaultValue={student?.guardianContact ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.guardianContact} />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-parentContact`}
          >
            Parent contact
          </label>
          <input
            id={`${mode}-parentContact`}
            name="parentContact"
            defaultValue={student?.parentContact ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.parentContact} />
        </div>

        <fieldset className="grid gap-3 md:col-span-2">
          <legend className="text-sm font-medium">Competitions</legend>
          {competitionOptions.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {competitionOptions.map((competition) => (
                <label
                  key={competition.id}
                  className="flex min-h-11 items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="competitionIds"
                    value={competition.id}
                    defaultChecked={selectedCompetitionIds.has(competition.id)}
                    className="size-4 rounded border-input"
                  />
                  <span
                    className="size-3 shrink-0 rounded-full border"
                    style={{ backgroundColor: competition.color }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {competition.shortName ?? competition.name}
                    </span>
                    {competition.shortName ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {competition.name}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Add active competitions in Competition Settings before assigning
              students.
            </p>
          )}
          <FieldError errors={state.fieldErrors?.competitionIds} />
        </fieldset>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-notes`}>
            Notes
          </label>
          <textarea
            id={`${mode}-notes`}
            name="notes"
            rows={3}
            defaultValue={student?.notes ?? ""}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
