"use client";

import { Fragment, useActionState, useState } from "react";
import { Archive, Pencil } from "lucide-react";
import { useFormStatus } from "react-dom";

import { StudentForm } from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
import {
  archiveStudentAction,
  type StudentActionState,
} from "@/features/students/actions";
import type {
  StudentCompetitionOption,
  StudentWithCompetitions,
} from "@/features/students/queries";
import { cn } from "@/lib/utils";
import type { StudentStatus } from "@/types/database";

type StudentListProps = {
  students: StudentWithCompetitions[];
  competitionOptions: StudentCompetitionOption[];
};

const initialArchiveState: StudentActionState = {
  status: "idle",
  message: null,
};

const statusStyles: Record<StudentStatus, string> = {
  active: "border-primary/30 bg-primary/10 text-primary",
  inactive: "border-secondary/40 bg-secondary/15 text-secondary-foreground",
  archived: "border-border bg-background text-muted-foreground",
};

function EmptyMetadata() {
  return <span className="text-muted-foreground">Not set</span>;
}

function getStudentName(student: StudentWithCompetitions) {
  return (
    student.displayName ??
    [student.firstName, student.lastName].filter(Boolean).join(" ")
  );
}

function ArchiveSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={disabled || pending}>
      <Archive aria-hidden="true" />
      {pending ? "Archiving" : "Archive"}
    </Button>
  );
}

function ArchiveStudentForm({ student }: { student: StudentWithCompetitions }) {
  const [state, formAction] = useActionState(
    archiveStudentAction,
    initialArchiveState,
  );
  const isArchived = student.status === "archived";

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={student.id} />
      <ArchiveSubmitButton disabled={isArchived} />
      {state.status === "error" && state.message ? (
        <p className="max-w-48 text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}

export function StudentList({
  students,
  competitionOptions,
}: StudentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (students.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No students yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No students yet. Add your first student to start planning.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Student records</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Competition assignments are loaded from the student competition join
          table.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1220px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student name</th>
              <th className="px-4 py-3 font-medium">Student code</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Grade / year</th>
              <th className="px-4 py-3 font-medium">Competitions joined</th>
              <th className="px-4 py-3 font-medium">Count</th>
              <th className="px-4 py-3 font-medium">Multi-competition</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((student) => {
              const competitionCount = student.competitionAssignments.length;
              const isMultiCompetition = competitionCount >= 2;

              return (
                <Fragment key={student.id}>
                  <tr className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium">{getStudentName(student)}</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {student.firstName} {student.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {student.studentCode ? student.studentCode : <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      {student.className ? student.className : <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      {student.gradeLevel ? student.gradeLevel : <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      {competitionCount > 0 ? (
                        <div className="flex max-w-md flex-wrap gap-2">
                          {student.competitionAssignments.map((assignment) => (
                            <span
                              key={assignment.id}
                              className="inline-flex max-w-48 items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
                              style={{
                                borderColor: assignment.competition.color,
                                backgroundColor: `${assignment.competition.color}1A`,
                              }}
                            >
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: assignment.competition.color,
                                }}
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {assignment.competition.shortName ??
                                  assignment.competition.name}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium">{competitionCount}</td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-1 text-xs font-medium",
                          isMultiCompetition
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        {isMultiCompetition ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                          statusStyles[student.status],
                        )}
                      >
                        {student.status}
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
                              current === student.id ? null : student.id,
                            )
                          }
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <ArchiveStudentForm student={student} />
                      </div>
                    </td>
                  </tr>

                  {editingId === student.id ? (
                    <tr>
                      <td className="bg-muted/30 px-4 py-4" colSpan={9}>
                        <StudentForm
                          mode="edit"
                          student={student}
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
