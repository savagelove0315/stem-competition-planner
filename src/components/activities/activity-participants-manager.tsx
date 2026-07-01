"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2, Search, UserMinus, UserPlus, Users } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  addActivityParticipantAction,
  cancelActivityParticipantAction,
  type ActivityParticipantActionState,
} from "@/features/activity-participants/actions";
import type {
  ActivityParticipantAssignment,
  ActivityParticipantStudentOption,
} from "@/features/activity-participants/queries";
import { cn } from "@/lib/utils";

type ActivityParticipantsManagerProps = {
  activityId: string;
  competitionId: string;
  participants: ActivityParticipantAssignment[];
  studentOptions: ActivityParticipantStudentOption[];
};

const initialState: ActivityParticipantActionState = {
  status: "idle",
  message: null,
};

function AddParticipantButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <UserPlus aria-hidden="true" />
      )}
      {pending ? "Adding" : "Assign Student"}
    </Button>
  );
}

function RemoveParticipantButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <UserMinus aria-hidden="true" />
      )}
      {pending ? "Removing" : "Remove Student"}
    </Button>
  );
}

function ParticipantRemoveForm({
  participant,
}: {
  participant: ActivityParticipantAssignment;
}) {
  const [state, formAction] = useActionState(
    cancelActivityParticipantAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-1">
      <input type="hidden" name="id" value={participant.id} />
      <RemoveParticipantButton />
      {state.status === "error" && state.message ? (
        <p className="max-w-44 text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}

function StudentMeta({ student }: { student: ActivityParticipantStudentOption }) {
  const details = [
    student.className ? `Class ${student.className}` : null,
    student.gradeLevel ? `Grade ${student.gradeLevel}` : null,
    student.isMultiCompetition ? "Multi-competition" : null,
  ].filter(Boolean);

  if (details.length === 0) {
    return <span className="text-muted-foreground">No profile details</span>;
  }

  return <>{details.join(" / ")}</>;
}

export function ActivityParticipantsManager({
  activityId,
  competitionId,
  participants,
  studentOptions,
}: ActivityParticipantsManagerProps) {
  const [query, setQuery] = useState("");
  const [state, formAction] = useActionState(
    addActivityParticipantAction,
    initialState,
  );
  const assignedStudentIds = useMemo(
    () => new Set(participants.map((participant) => participant.studentId)),
    [participants],
  );
  const eligibleStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return studentOptions.filter((student) => {
      if (assignedStudentIds.has(student.id)) {
        return false;
      }

      if (!student.registeredCompetitionIds.includes(competitionId)) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      return [
        student.name,
        student.studentCode,
        student.className,
        student.gradeLevel,
      ]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [assignedStudentIds, competitionId, query, studentOptions]);

  return (
    <div className="grid gap-4 rounded-md border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold">Assign participants</h3>
            <p className="text-xs text-muted-foreground">
              {participants.length} assigned student
              {participants.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      {participants.length > 0 ? (
        <div className="grid gap-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {participant.student?.name ?? "Unknown student"}
                  </span>
                  {participant.student?.isMultiCompetition ? (
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Multi-competition
                    </span>
                  ) : null}
                </div>
                {participant.student ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <StudentMeta student={participant.student} />
                  </p>
                ) : null}
              </div>
              <ParticipantRemoveForm participant={participant} />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
          No students assigned yet. Register students under this activity&apos;s
          competition first, then assign them here.
        </p>
      )}

      <form action={formAction} className="grid gap-3">
        <input type="hidden" name="activityId" value={activityId} />
        <input type="hidden" name="competitionId" value={competitionId} />

        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="grid gap-1 text-sm font-medium">
            <span>Search students</span>
            <span className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Name, code, class, or grade"
              />
            </span>
          </label>

          <label className="grid gap-1 text-sm font-medium">
            <span>Student</span>
            <select
              name="studentId"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              disabled={eligibleStudents.length === 0}
            >
              <option value="">
                {eligibleStudents.length === 0
                  ? "No eligible active students"
                  : "Choose a student"}
              </option>
              {eligibleStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                  {student.className ? `, ${student.className}` : ""}
                  {student.gradeLevel ? `, ${student.gradeLevel}` : ""}
                  {student.isMultiCompetition ? ", multi-competition" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <AddParticipantButton disabled={eligibleStudents.length === 0} />
          </div>
        </div>

        {state.message ? (
          <p
            className={cn(
              "rounded-md border px-3 py-2 text-sm",
              state.status === "success"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {state.message}
          </p>
        ) : null}
        {state.fieldErrors?.studentId?.length ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.studentId[0]}
          </p>
        ) : null}
      </form>
    </div>
  );
}
