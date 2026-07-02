"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Archive,
  Eye,
  Pencil,
  Trash2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { CompetitionForm } from "@/components/competitions/competition-form";
import { CompetitionStudentManager } from "@/components/competitions/competition-student-manager";
import { CompetitionTeamManager } from "@/components/competitions/competition-team-manager";
import { Button } from "@/components/ui/button";
import type {
  CompetitionEnrollment,
  CompetitionEnrollmentStudent,
} from "@/features/competition-enrollments/queries";
import type { CompetitionTeam } from "@/features/teams/queries";
import {
  archiveCompetitionAction,
  deleteCompetitionAction,
  type CompetitionActionState,
} from "@/features/competitions/actions";
import { cn } from "@/lib/utils";
import type {
  Competition,
  CompetitionStatus,
  ParticipationMode,
  TeamStatus,
} from "@/types/database";

type CompetitionListProps = {
  competitions: Competition[];
  enrollments: CompetitionEnrollment[];
  studentOptions: CompetitionEnrollmentStudent[];
  teams: CompetitionTeam[];
};

type CompetitionRosterModalProps = {
  competition: Competition;
  enrollments: CompetitionEnrollment[];
  studentOptions: CompetitionEnrollmentStudent[];
  onClose: () => void;
};

type CompetitionTeamsModalProps = {
  competition: Competition;
  enrollments: CompetitionEnrollment[];
  teams: CompetitionTeam[];
  onClose: () => void;
};

type CompetitionEditModalProps = {
  competition: Competition;
  onClose: () => void;
};

type CompetitionDetailsModalProps = {
  competition: Competition;
  enrollments: CompetitionEnrollment[];
  teams: CompetitionTeam[];
  onClose: () => void;
};

const initialArchiveState: CompetitionActionState = {
  status: "idle",
  message: null,
};

const initialDeleteState: CompetitionActionState = {
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

const teamStatusStyles: Record<TeamStatus, string> = {
  active: "border-primary/30 bg-primary/10 text-primary",
  inactive: "border-secondary/40 bg-secondary/15 text-secondary-foreground",
  disqualified: "border-destructive/30 bg-destructive/10 text-destructive",
  archived: "border-border bg-background text-muted-foreground",
};

const participationModeLabels: Record<ParticipationMode, string> = {
  individual: "Individual",
  team: "Team",
  mixed: "Mixed",
};

function EmptyMetadata() {
  return <span className="text-muted-foreground">Not set</span>;
}

function CompetitionMetadata({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border bg-background px-3 py-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0 break-words text-sm">{children}</dd>
    </div>
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

function DetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function StudentSummary({
  student,
}: {
  student: CompetitionEnrollmentStudent | null;
}) {
  if (!student) {
    return (
      <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
        Student record unavailable
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <div className="font-medium">{student.name || <EmptyMetadata />}</div>
      <p className="mt-1 break-words text-xs text-muted-foreground">
        {[student.className, student.gradeLevel, student.studentCode]
          .filter(Boolean)
          .join(" / ") || "Student details not set"}
      </p>
    </div>
  );
}

function CompetitionDetailsModal({
  competition,
  enrollments,
  teams,
  onClose,
}: CompetitionDetailsModalProps) {
  const activeRegisteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.status !== "withdrawn" && enrollment.student?.status === "active",
  );
  const activeTeams = teams.filter((team) => team.status === "active");
  const activeTeamStudentIds = new Set(
    activeTeams.flatMap((team) => team.members.map((member) => member.studentId)),
  );
  const unassignedEnrollments = activeRegisteredEnrollments.filter(
    (enrollment) => !activeTeamStudentIds.has(enrollment.studentId),
  );
  const usesTeams = competition.participationMode !== "individual";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-background/80"
        aria-label="Close competition details dialog"
        onClick={onClose}
      />
      <div
        aria-labelledby="competition-details-title"
        aria-modal="true"
        className="absolute left-1/2 top-1/2 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-background shadow-lg"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Competition details
            </p>
            <h2
              id="competition-details-title"
              className="mt-1 break-words text-lg font-semibold"
            >
              {competition.name || <EmptyMetadata />}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close competition details dialog"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="grid gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          <DetailsSection title="Competition Information">
            <dl className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProfileField label="Competition name" value={competition.name} />
              <ProfileField label="Short name" value={competition.shortName} />
              <ProfileField label="Category" value={competition.category} />
              <ProfileField label="Icon" value={competition.icon} />
              <ProfileField
                label="Color"
                value={
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span
                      className="size-4 shrink-0 rounded border"
                      style={{ backgroundColor: competition.color }}
                      aria-hidden="true"
                    />
                    <span className="break-all font-mono text-xs">
                      {competition.color}
                    </span>
                  </span>
                }
              />
              <ProfileField
                label="Participation mode"
                value={participationModeLabels[competition.participationMode]}
              />
              <ProfileField label="Notice mode" value={competition.noticeMode} />
              <ProfileField
                label="Notice period"
                value={competition.noticePeriod}
              />
              <ProfileField
                label="Status"
                value={
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                      statusStyles[competition.status],
                    )}
                  >
                    {competition.status}
                  </span>
                }
              />
              <ProfileField
                label="Student count"
                value={`${activeRegisteredEnrollments.length} student${
                  activeRegisteredEnrollments.length === 1 ? "" : "s"
                }`}
              />
              <ProfileField
                label="Team count"
                value={`${teams.length} team${teams.length === 1 ? "" : "s"}`}
              />
            </dl>
          </DetailsSection>

          <DetailsSection title="Registered Students">
            {activeRegisteredEnrollments.length > 0 ? (
              <div className="grid gap-2 rounded-lg border bg-card p-4">
                {activeRegisteredEnrollments.map((enrollment) => (
                  <StudentSummary
                    key={enrollment.id}
                    student={enrollment.student}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed bg-card px-4 py-4 text-sm text-muted-foreground">
                No students registered.
              </p>
            )}
          </DetailsSection>

          <DetailsSection title="Teams">
            {!usesTeams ? (
              <p className="rounded-lg border border-dashed bg-card px-4 py-4 text-sm text-muted-foreground">
                This is an individual competition. Team management is not enabled.
              </p>
            ) : teams.length > 0 ? (
              <div className="grid gap-4 rounded-lg border bg-card p-4">
                {teams.map((team) => (
                  <section
                    key={team.id}
                    className="grid gap-3 rounded-md border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="break-words font-semibold">{team.name}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {team.members.length} member
                          {team.members.length === 1 ? "" : "s"}
                          {team.teamCode ? ` / Code ${team.teamCode}` : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                          teamStatusStyles[team.status],
                        )}
                      >
                        {team.status}
                      </span>
                    </div>

                    {team.members.length > 0 ? (
                      <div className="grid gap-2">
                        {team.members.map((member) => (
                          <div
                            key={member.id}
                            className="rounded-md bg-muted/40 px-3 py-2 text-sm"
                          >
                            <div className="font-medium">
                              {member.student?.name ??
                                "Student record unavailable"}
                            </div>
                            <p className="mt-1 break-words text-xs text-muted-foreground">
                              {[
                                member.role,
                                member.student?.className,
                                member.student?.gradeLevel,
                                member.student?.studentCode,
                              ]
                                .filter(Boolean)
                                .join(" / ") || "Member details not set"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
                        No members assigned.
                      </p>
                    )}
                  </section>
                ))}

                <section className="grid gap-3 rounded-md border bg-muted/30 p-4">
                  <h4 className="font-semibold">No team assigned</h4>
                  {unassignedEnrollments.length > 0 ? (
                    <div className="grid gap-2">
                      {unassignedEnrollments.map((enrollment) => (
                        <StudentSummary
                          key={enrollment.id}
                          student={enrollment.student}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Every active registered student is assigned to an active team.
                    </p>
                  )}
                </section>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed bg-card px-4 py-4 text-sm text-muted-foreground">
                No teams created yet.
              </p>
            )}
          </DetailsSection>
        </div>
      </div>
    </div>
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

function DeleteCompetitionForm({ competition }: { competition: Competition }) {
  const [state, formAction] = useActionState(
    deleteCompetitionAction,
    initialDeleteState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-2"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Delete this competition permanently? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={competition.id} />
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

function CompetitionEditModal({
  competition,
  onClose,
}: CompetitionEditModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-background/80"
        aria-label="Close edit competition dialog"
        onClick={onClose}
      />
      <div
        aria-labelledby="edit-competition-title"
        aria-modal="true"
        className="absolute left-1/2 top-1/2 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-background shadow-lg"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="edit-competition-title" className="text-lg font-semibold">
              Edit competition
            </h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {competition.name}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close edit competition dialog"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="overflow-y-auto px-4 py-5 sm:px-6">
          <CompetitionForm
            mode="edit"
            competition={competition}
            onCancel={onClose}
            showHeader={false}
            surface="plain"
          />
        </div>
      </div>
    </div>
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

function CompetitionTeamsModal({
  competition,
  enrollments,
  teams,
  onClose,
}: CompetitionTeamsModalProps) {
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
      aria-labelledby="competition-teams-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-5xl min-w-0 rounded-lg bg-background shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Optional team management
            </p>
            <h2 id="competition-teams-title" className="mt-1 text-lg font-semibold">
              Manage Teams
            </h2>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              Create teams for {competition.name} and assign registered students.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <X aria-hidden="true" />
            Close
          </Button>
        </div>
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto p-5">
          <CompetitionTeamManager
            competition={competition}
            enrollments={enrollments}
            teams={teams}
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
  teams,
}: CompetitionListProps) {
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [managingRosterId, setManagingRosterId] = useState<string | null>(null);
  const [managingTeamsId, setManagingTeamsId] = useState<string | null>(null);
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
  const managingTeamsCompetition = useMemo(
    () =>
      competitions.find(
        (competition) =>
          competition.id === managingTeamsId &&
          competition.participationMode !== "individual",
      ) ?? null,
    [competitions, managingTeamsId],
  );
  const detailsCompetition = useMemo(
    () =>
      competitions.find((competition) => competition.id === detailsId) ?? null,
    [competitions, detailsId],
  );
  const editingCompetition = useMemo(
    () => competitions.find((competition) => competition.id === editingId) ?? null,
    [competitions, editingId],
  );

  if (competitions.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No competitions yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a competition first. Students, activities, timelines,
          conflicts, and notices all connect back to competition records.
        </p>
      </section>
    );
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">Competition records</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Names and statuses are loaded from Supabase for the signed-in session.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/students">
            <Users aria-hidden="true" />
            Manage Students
          </Link>
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 p-4 sm:p-5">
        {competitions.map((competition) => {
          const competitionEnrollments =
            enrollmentsByCompetition.get(competition.id) ?? [];
          const canManageTeams = competition.participationMode !== "individual";

          return (
            <article
              key={competition.id}
              className="grid min-w-0 gap-4 rounded-lg border bg-background p-4 shadow-sm"
            >
              <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                <div className="min-w-0 space-y-3">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="size-3 shrink-0 rounded-full border"
                          style={{ backgroundColor: competition.color }}
                          aria-label={`Competition color ${competition.color}`}
                        />
                        {competition.icon ? (
                          <span className="text-base" aria-label="Competition icon">
                            {competition.icon}
                          </span>
                        ) : null}
                        <h3 className="min-w-0 break-words text-base font-semibold">
                          {competition.name}
                        </h3>
                      </div>
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        {[
                          competition.shortName
                            ? `Short name ${competition.shortName}`
                            : null,
                          competition.category,
                          participationModeLabels[competition.participationMode],
                        ]
                          .filter(Boolean)
                          .join(" / ") || "Competition metadata not set"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                        statusStyles[competition.status],
                      )}
                    >
                      {competition.status}
                    </span>
                  </div>

                  {competition.description ? (
                    <p className="max-w-4xl break-words text-sm leading-6 text-muted-foreground">
                      {competition.description}
                    </p>
                  ) : null}

                  <dl className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <CompetitionMetadata label="Category">
                      {competition.category ? competition.category : <EmptyMetadata />}
                    </CompetitionMetadata>
                    <CompetitionMetadata label="Participation">
                      <span className="inline-flex rounded-md border bg-muted px-2 py-1 text-xs font-medium">
                        {participationModeLabels[competition.participationMode]}
                      </span>
                    </CompetitionMetadata>
                    <CompetitionMetadata label="Notice">
                      {competition.noticeMode ? competition.noticeMode : <EmptyMetadata />}
                    </CompetitionMetadata>
                    <CompetitionMetadata label="Notice period">
                      {competition.noticePeriod ? (
                        competition.noticePeriod
                      ) : (
                        <EmptyMetadata />
                      )}
                    </CompetitionMetadata>
                    <CompetitionMetadata label="Students">
                      <span className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium">
                        <Users aria-hidden="true" />
                        {competitionEnrollments.length}
                      </span>
                    </CompetitionMetadata>
                    <CompetitionMetadata label="Color">
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <span
                          className="size-4 shrink-0 rounded border"
                          style={{ backgroundColor: competition.color }}
                          aria-hidden="true"
                        />
                        <span className="break-all font-mono text-xs">
                          {competition.color}
                        </span>
                      </span>
                    </CompetitionMetadata>
                    <CompetitionMetadata label="Icon">
                      {competition.icon ? competition.icon : <EmptyMetadata />}
                    </CompetitionMetadata>
                    <CompetitionMetadata label="Status">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize",
                          statusStyles[competition.status],
                        )}
                      >
                        {competition.status}
                      </span>
                    </CompetitionMetadata>
                  </dl>
                </div>

                <div className="flex min-w-0 flex-wrap gap-2 xl:max-w-md xl:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailsId(competition.id)}
                  >
                    <Eye aria-hidden="true" />
                    View Details
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setManagingRosterId(competition.id)}
                  >
                    <Users aria-hidden="true" />
                    Manage Students
                  </Button>
                  {canManageTeams ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setManagingTeamsId(competition.id)}
                    >
                      <UsersRound aria-hidden="true" />
                      Manage Teams
                    </Button>
                  ) : (
                    <p className="max-w-48 rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                      Change to Team or Mixed to manage teams.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(competition.id)}
                  >
                    <Pencil aria-hidden="true" />
                    Edit
                  </Button>
                  <ArchiveCompetitionForm competition={competition} />
                  <DeleteCompetitionForm competition={competition} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {detailsCompetition ? (
        <CompetitionDetailsModal
          competition={detailsCompetition}
          enrollments={enrollmentsByCompetition.get(detailsCompetition.id) ?? []}
          teams={teams.filter(
            (team) => team.competitionId === detailsCompetition.id,
          )}
          onClose={() => setDetailsId(null)}
        />
      ) : null}

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

      {managingTeamsCompetition ? (
        <CompetitionTeamsModal
          competition={managingTeamsCompetition}
          enrollments={
            enrollmentsByCompetition.get(managingTeamsCompetition.id) ?? []
          }
          teams={teams.filter(
            (team) => team.competitionId === managingTeamsCompetition.id,
          )}
          onClose={() => setManagingTeamsId(null)}
        />
      ) : null}

      {editingCompetition ? (
        <CompetitionEditModal
          competition={editingCompetition}
          onClose={() => setEditingId(null)}
        />
      ) : null}
    </section>
  );
}
