"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Archive, ListChecks, Pencil, Users, X } from "lucide-react";
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
  const editingStudent =
    students.find((student) => student.id === editingId) ?? null;

  useEffect(() => {
    if (!editingStudent) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEditingId(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingStudent]);

  if (students.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No students yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add students here, then register them under competitions so timelines,
          conflicts, and notices have usable data.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Student records</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Competition assignments are loaded from the student competition join
              table.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/student-timeline">
                <ListChecks aria-hidden="true" />
                View Timeline
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/competitions">
                <Users aria-hidden="true" />
                Register to Competition
              </Link>
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
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
                  <tr key={student.id} className="align-top">
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
                          onClick={() => setEditingId(student.id)}
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <ArchiveStudentForm student={student} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {editingStudent ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-background/80"
            aria-label="Close edit student dialog"
            onClick={() => setEditingId(null)}
          />
          <div
            aria-labelledby="edit-student-title"
            aria-modal="true"
            className="absolute left-1/2 top-1/2 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-background shadow-lg"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 id="edit-student-title" className="text-lg font-semibold">
                  Edit student
                </h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {getStudentName(editingStudent)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close edit student dialog"
                onClick={() => setEditingId(null)}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
            <div className="overflow-y-auto px-4 py-5 sm:px-6">
              <StudentForm
                mode="edit"
                student={editingStudent}
                competitionOptions={competitionOptions}
                onCancel={() => setEditingId(null)}
                showHeader={false}
                surface="plain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
