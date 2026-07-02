"use client";

import { useActionState, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Archive,
  Eye,
  ListChecks,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { StudentForm } from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
import {
  archiveStudentAction,
  deleteStudentAction,
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

const initialDeleteState: StudentActionState = {
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

function getStudentFullName(student: StudentWithCompetitions) {
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
}

function getStudentSecondaryDetails(student: StudentWithCompetitions) {
  const details = [
    student.className ? `Class ${student.className}` : null,
    student.gradeLevel ? `Grade ${student.gradeLevel}` : null,
    student.studentCode ? `Code ${student.studentCode}` : null,
  ].filter(Boolean);

  return details.length > 0 ? details.join(" / ") : "Profile details not set";
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

function DeleteStudentForm({ student }: { student: StudentWithCompetitions }) {
  const [state, formAction] = useActionState(
    deleteStudentAction,
    initialDeleteState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-2"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Delete this student permanently? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={student.id} />
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

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  const isEmptyString = typeof value === "string" && value.trim().length === 0;

  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm">
        {value && !isEmptyString ? value : <EmptyMetadata />}
      </dd>
    </div>
  );
}

function StudentProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <dl className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  );
}

function CompetitionBadges({
  student,
}: {
  student: StudentWithCompetitions;
}) {
  if (student.competitionAssignments.length === 0) {
    return <span className="text-sm text-muted-foreground">None assigned</span>;
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {student.competitionAssignments.map((assignment) => (
        <span
          key={assignment.id}
          className="inline-flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-xs font-medium"
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
          <span className="min-w-0 break-words">
            {assignment.competition.shortName ?? assignment.competition.name}
          </span>
        </span>
      ))}
    </div>
  );
}

function StudentProfileModal({
  student,
  onClose,
}: {
  student: StudentWithCompetitions;
  onClose: () => void;
}) {
  const competitionCount = student.competitionAssignments.length;
  const isMultiCompetition = competitionCount >= 2;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-background/80"
        aria-label="Close student profile dialog"
        onClick={onClose}
      />
      <div
        aria-labelledby="student-profile-title"
        aria-modal="true"
        className="absolute left-1/2 top-1/2 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-background shadow-lg"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Student profile
            </p>
            <h2
              id="student-profile-title"
              className="mt-1 break-words text-lg font-semibold"
            >
              {getStudentName(student) || <EmptyMetadata />}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close student profile dialog"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="grid gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          <StudentProfileSection title="Student Information">
            <ProfileField
              label="Display name / student name"
              value={getStudentName(student)}
            />
            <ProfileField
              label="Full name"
              value={getStudentFullName(student)}
            />
            <ProfileField label="Student code" value={student.studentCode} />
            <ProfileField label="Class" value={student.className} />
            <ProfileField label="Grade / Year" value={student.gradeLevel} />
            <ProfileField
              label="Status"
              value={
                <span
                  className={cn(
                    "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                    statusStyles[student.status],
                  )}
                >
                  {student.status}
                </span>
              }
            />
          </StudentProfileSection>

          <StudentProfileSection title="Contact Information">
            <ProfileField label="Email" value={student.email} />
            <ProfileField label="Phone number" value={student.phone} />
          </StudentProfileSection>

          <StudentProfileSection title="Guardian / Parent Information">
            <ProfileField label="Guardian name" value={student.guardianName} />
            <ProfileField
              label="Guardian contact"
              value={student.guardianContact}
            />
            <ProfileField label="Parent contact" value={student.parentContact} />
          </StudentProfileSection>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold">Competition Participation</h3>
            <div className="grid gap-4 rounded-lg border bg-card p-4">
              <dl className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Competition count"
                  value={`${competitionCount} competition${competitionCount === 1 ? "" : "s"}`}
                />
                <ProfileField
                  label="Multi-competition status"
                  value={
                    isMultiCompetition
                      ? "Multi-competition"
                      : "Single competition"
                  }
                />
              </dl>
              <div className="grid gap-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Competitions joined
                </p>
                <CompetitionBadges student={student} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function StudentList({
  students,
  competitionOptions,
}: StudentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const editingStudent =
    students.find((student) => student.id === editingId) ?? null;
  const profileStudent =
    students.find((student) => student.id === profileId) ?? null;

  useEffect(() => {
    if (!editingStudent && !profileStudent) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEditingId(null);
        setProfileId(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingStudent, profileStudent]);

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

        <div className="grid min-w-0 gap-4 p-4 sm:p-5">
          {students.map((student) => {
            const competitionCount = student.competitionAssignments.length;
            const isMultiCompetition = competitionCount >= 2;

            return (
              <article
                key={student.id}
                className="grid min-w-0 gap-4 rounded-lg border bg-background p-4 shadow-sm"
              >
                <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                  <div className="min-w-0 space-y-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="min-w-0 break-words text-base font-semibold">
                          {getStudentName(student)}
                        </h3>
                        <span
                          className={cn(
                            "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                            statusStyles[student.status],
                          )}
                        >
                          {student.status}
                        </span>
                        <span
                          className={cn(
                            "inline-flex rounded-md border px-2 py-1 text-xs font-medium",
                            isMultiCompetition
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {isMultiCompetition
                            ? "Multi-competition"
                            : "Single competition"}
                        </span>
                      </div>
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        {getStudentSecondaryDetails(student)}
                      </p>
                      {student.displayName ? (
                        <p className="mt-1 break-words text-xs text-muted-foreground">
                          Full name: {[student.firstName, student.lastName]
                            .filter(Boolean)
                            .join(" ") || <EmptyMetadata />}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">
                          {competitionCount} competition
                          {competitionCount === 1 ? "" : "s"}
                        </span>
                        <span className="text-muted-foreground">joined</span>
                      </div>
                      {competitionCount > 0 ? (
                        <CompetitionBadges student={student} />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          None assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-2 xl:max-w-md xl:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProfileId(student.id)}
                    >
                      <Eye aria-hidden="true" />
                      View Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(student.id)}
                    >
                      <Pencil aria-hidden="true" />
                      Edit
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/competitions">
                        <Users aria-hidden="true" />
                        Register to Competition
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/student-timeline">
                        <ListChecks aria-hidden="true" />
                        View Timeline
                      </Link>
                    </Button>
                    <ArchiveStudentForm student={student} />
                    <DeleteStudentForm student={student} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {profileStudent ? (
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileId(null)}
        />
      ) : null}

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
