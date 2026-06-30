"use client";

import { Fragment, useActionState, useEffect, useMemo, useState } from "react";
import { Archive, Pencil, Users, X } from "lucide-react";
import { useFormStatus } from "react-dom";

import { CompetitionForm } from "@/components/competitions/competition-form";
import { CompetitionStudentManager } from "@/components/competitions/competition-student-manager";
import { Button } from "@/components/ui/button";
import type {
  CompetitionEnrollment,
  CompetitionEnrollmentStudent,
} from "@/features/competition-enrollments/queries";
import {
  archiveCompetitionAction,
  type CompetitionActionState,
} from "@/features/competitions/actions";
import { cn } from "@/lib/utils";
import type { Competition, CompetitionStatus } from "@/types/database";

type CompetitionListProps = {
  competitions: Competition[];
  enrollments: CompetitionEnrollment[];
  studentOptions: CompetitionEnrollmentStudent[];
};

type CompetitionRosterModalProps = {
  competition: Competition;
  enrollments: CompetitionEnrollment[];
  studentOptions: CompetitionEnrollmentStudent[];
  onClose: () => void;
};

const initialArchiveState: CompetitionActionState = {
  status: "idle",
  message: null,
};

const statusStyles: Record<CompetitionStatus, string> = {
  draft: "border-muted bg-muted text-muted-foreground",
  planned: "border-accent/30 bg-accent/10 text-accent",
  active: "border-primary/30 bg-primary/10 text-primary",
  completed: "border-secondary/40 bg-secondary/15 text-secondary-foreground",
  archived: "border-border bg-background text-muted-foreground",
};

function EmptyMetadata() {
  return <span className="text-muted-foreground">Not set</span>;
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

function ArchiveCompetitionForm({ competition }: { competition: Competition }) {
  const [state, formAction] = useActionState(
    archiveCompetitionAction,
    initialArchiveState,
  );
  const isArchived = competition.status === "archived";

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={competition.id} />
      <ArchiveSubmitButton disabled={isArchived} />
      {state.status === "error" && state.message ? (
        <p className="max-w-48 text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}

function CompetitionRosterModal({
  competition,
  enrollments,
  studentOptions,
  onClose,
}: CompetitionRosterModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="competition-roster-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl min-w-0 rounded-lg bg-background shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Competition roster
            </p>
            <h2 id="competition-roster-title" className="mt-1 text-lg font-semibold">
              Manage Students
            </h2>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              Register students directly under {competition.name} before activity
              planning.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <X aria-hidden="true" />
            Close
          </Button>
        </div>
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto p-5">
          <CompetitionStudentManager
            competition={competition}
            enrollments={enrollments}
            studentOptions={studentOptions}
          />
        </div>
      </div>
    </div>
  );
}

export function CompetitionList({
  competitions,
  enrollments,
  studentOptions,
}: CompetitionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingRosterId, setManagingRosterId] = useState<string | null>(null);
  const enrollmentsByCompetition = useMemo(() => {
    const groupedEnrollments = new Map<string, CompetitionEnrollment[]>();

    enrollments.forEach((enrollment) => {
      const competitionEnrollments =
        groupedEnrollments.get(enrollment.competitionId) ?? [];
      competitionEnrollments.push(enrollment);
      groupedEnrollments.set(enrollment.competitionId, competitionEnrollments);
    });

    return groupedEnrollments;
  }, [enrollments]);
  const managingRosterCompetition = useMemo(
    () =>
      competitions.find((competition) => competition.id === managingRosterId) ??
      null,
    [competitions, managingRosterId],
  );

  if (competitions.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No competitions yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No competitions yet. Add your first competition to start planning.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Competition records</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Names and statuses are loaded from Supabase for the signed-in session.
        </p>
      </div>

      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Short name</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Icon</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Students</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {competitions.map((competition) => {
              const competitionEnrollments =
                enrollmentsByCompetition.get(competition.id) ?? [];

              return (
                <Fragment key={competition.id}>
                  <tr className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium">{competition.name}</div>
                      {competition.description ? (
                        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                          {competition.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      {competition.shortName ? (
                        competition.shortName
                      ) : (
                        <EmptyMetadata />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-4 rounded border"
                          style={{ backgroundColor: competition.color }}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs">
                          {competition.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {competition.icon ? competition.icon : <EmptyMetadata />}
                    </td>
                    <td className="px-4 py-4">
                      {competition.category ? (
                        competition.category
                      ) : (
                        <EmptyMetadata />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-medium">
                        <Users aria-hidden="true" />
                        {competitionEnrollments.length}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                          statusStyles[competition.status],
                        )}
                      >
                        {competition.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setManagingRosterId(competition.id)}
                        >
                          <Users aria-hidden="true" />
                          Manage Students
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingId((current) =>
                              current === competition.id ? null : competition.id,
                            )
                          }
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <ArchiveCompetitionForm competition={competition} />
                      </div>
                    </td>
                  </tr>

                  {editingId === competition.id ? (
                    <tr>
                      <td className="bg-muted/30 px-4 py-4" colSpan={8}>
                        <CompetitionForm
                          mode="edit"
                          competition={competition}
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

      {managingRosterCompetition ? (
        <CompetitionRosterModal
          competition={managingRosterCompetition}
          enrollments={
            enrollmentsByCompetition.get(managingRosterCompetition.id) ?? []
          }
          studentOptions={studentOptions}
          onClose={() => setManagingRosterId(null)}
        />
      ) : null}
    </section>
  );
}
