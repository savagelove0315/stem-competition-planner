"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2, Search, UserMinus, UserPlus, Users } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  addCompetitionEnrollmentAction,
  type CompetitionEnrollmentActionState,
  withdrawCompetitionEnrollmentAction,
} from "@/features/competition-enrollments/actions";
import type {
  CompetitionEnrollment,
  CompetitionEnrollmentStudent,
} from "@/features/competition-enrollments/queries";
import { cn } from "@/lib/utils";
import type { Competition } from "@/types/database";

type CompetitionStudentManagerProps = {
  competition: Competition;
  enrollments: CompetitionEnrollment[];
  studentOptions: CompetitionEnrollmentStudent[];
};

const initialState: CompetitionEnrollmentActionState = {
  status: "idle",
  message: null,
};

function AddStudentButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <UserPlus aria-hidden="true" />
      )}
      {pending ? "Adding" : "Register Student"}
    </Button>
  );
}

function WithdrawStudentButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <UserMinus aria-hidden="true" />
      )}
      {pending ? "Withdrawing" : "Withdraw"}
    </Button>
  );
}

function StudentMeta({ student }: { student: CompetitionEnrollmentStudent }) {
  const details = [
    student.studentCode ? `Code ${student.studentCode}` : null,
    student.className ? `Class ${student.className}` : null,
    student.gradeLevel ? `Grade ${student.gradeLevel}` : null,
    student.isMultiCompetition ? "Multi-competition" : null,
  ].filter(Boolean);

  if (details.length === 0) {
    return <span className="text-muted-foreground">No profile details</span>;
  }

  return <>{details.join(" / ")}</>;
}

function WithdrawEnrollmentForm({
  enrollment,
}: {
  enrollment: CompetitionEnrollment;
}) {
  const [state, formAction] = useActionState(
    withdrawCompetitionEnrollmentAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-1">
      <input type="hidden" name="id" value={enrollment.id} />
      <WithdrawStudentButton />
      {state.status === "error" && state.message ? (
        <p className="max-w-44 text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}

export function CompetitionStudentManager({
  competition,
  enrollments,
  studentOptions,
}: CompetitionStudentManagerProps) {
  const [query, setQuery] = useState("");
  const [state, formAction] = useActionState(
    addCompetitionEnrollmentAction,
    initialState,
  );
  const enrolledStudentIds = useMemo(
    () => new Set(enrollments.map((enrollment) => enrollment.studentId)),
    [enrollments],
  );
  const eligibleStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return studentOptions.filter((student) => {
      if (enrolledStudentIds.has(student.id)) {
        return false;
      }

      if (student.status !== "active") {
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
  }, [enrolledStudentIds, query, studentOptions]);

  return (
    <div className="grid min-w-0 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">
              Registered students
            </h3>
            <p className="text-xs text-muted-foreground">
              {enrollments.length} enrolled student
              {enrollments.length === 1 ? "" : "s"} for {competition.name}
            </p>
          </div>
        </div>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid gap-2">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {enrollment.student?.name ?? "Unknown student"}
                  </span>
                  {enrollment.student?.isMultiCompetition ? (
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Multi-competition
                    </span>
                  ) : null}
                  <span className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                    {enrollment.status}
                  </span>
                </div>
                {enrollment.student ? (
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    <StudentMeta student={enrollment.student} />
                  </p>
                ) : null}
              </div>
              <WithdrawEnrollmentForm enrollment={enrollment} />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
          No students registered for this competition yet. Register students
          here before assigning them to activities or generating notices.
        </p>
      )}

      <form action={formAction} className="grid min-w-0 gap-3 rounded-md border p-4">
        <input type="hidden" name="competitionId" value={competition.id} />

        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="grid min-w-0 gap-1 text-sm font-medium">
            <span>Search active students</span>
            <span className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-9 w-full min-w-0 rounded-md border border-input bg-background pl-9 pr-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Name, code, class, or grade"
              />
            </span>
          </label>

          <label className="grid min-w-0 gap-1 text-sm font-medium">
            <span>Student</span>
            <select
              name="studentId"
              className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              disabled={eligibleStudents.length === 0}
            >
              <option value="">
                {eligibleStudents.length === 0
                  ? "No available active students"
                  : "Choose a student"}
              </option>
              {eligibleStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                  {student.studentCode ? `, ${student.studentCode}` : ""}
                  {student.className ? `, ${student.className}` : ""}
                  {student.gradeLevel ? `, ${student.gradeLevel}` : ""}
                  {student.isMultiCompetition ? ", multi-competition" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <AddStudentButton disabled={eligibleStudents.length === 0} />
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
