"use client";

import type React from "react";
import { useActionState, useMemo } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { CompetitionEnrollment } from "@/features/competition-enrollments/queries";
import {
  assignTeamMemberAction,
  createTeamAction,
  deleteTeamAction,
  removeTeamMemberAction,
  type TeamActionState,
  updateTeamAction,
} from "@/features/teams/actions";
import type { CompetitionTeam } from "@/features/teams/queries";
import { cn } from "@/lib/utils";
import type { Competition } from "@/types/database";

type CompetitionTeamManagerProps = {
  competition: Competition;
  enrollments: CompetitionEnrollment[];
  teams: CompetitionTeam[];
};

const initialState: TeamActionState = {
  status: "idle",
  message: null,
};

function SubmitButton({
  children,
  icon,
  variant = "default",
  disabled = false,
}: {
  children: string;
  icon: React.ReactNode;
  variant?: "default" | "outline";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant={variant} disabled={disabled || pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : icon}
      {pending ? "Saving" : children}
    </Button>
  );
}

function ActionMessage({ state }: { state: TeamActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-xs",
        state.status === "success"
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {state.message}
    </p>
  );
}

function CreateTeamForm({ competition }: { competition: Competition }) {
  const [state, formAction] = useActionState(createTeamAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-md border p-4">
      <input type="hidden" name="competitionId" value={competition.id} />
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="grid gap-1 text-sm font-medium">
          <span>Team name</span>
          <input
            name="name"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Team name"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          <span>Description</span>
          <input
            name="description"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Optional"
          />
        </label>
        <div className="flex items-end">
          <SubmitButton icon={<Plus aria-hidden="true" />}>Create Team</SubmitButton>
        </div>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function UpdateTeamForm({
  competition,
  team,
}: {
  competition: Competition;
  team: CompetitionTeam;
}) {
  const [state, formAction] = useActionState(updateTeamAction, initialState);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={team.id} />
      <input type="hidden" name="competitionId" value={competition.id} />
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input
          name="name"
          defaultValue={team.name}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Team name for ${team.name}`}
        />
        <input
          name="description"
          defaultValue={team.notes ?? ""}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Description for ${team.name}`}
          placeholder="Description"
        />
        <SubmitButton icon={<Pencil aria-hidden="true" />} variant="outline">
          Update
        </SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function DeleteTeamForm({ team }: { team: CompetitionTeam }) {
  const [state, formAction] = useActionState(deleteTeamAction, initialState);
  const hasActiveMembers = team.members.length > 0;

  return (
    <form
      action={formAction}
      className="grid gap-2"
      onSubmit={(event) => {
        if (
          !window.confirm("Delete this team? Students will not be deleted.")
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={team.id} />
      <SubmitButton
        icon={<Trash2 aria-hidden="true" />}
        variant="outline"
        disabled={hasActiveMembers}
      >
        Delete
      </SubmitButton>
      {hasActiveMembers ? (
        <p className="text-xs text-muted-foreground">
          Remove members before deleting.
        </p>
      ) : null}
      <ActionMessage state={state} />
    </form>
  );
}

function AssignStudentForm({
  competition,
  team,
  unassignedEnrollments,
}: {
  competition: Competition;
  team: CompetitionTeam;
  unassignedEnrollments: CompetitionEnrollment[];
}) {
  const [state, formAction] = useActionState(assignTeamMemberAction, initialState);

  return (
    <form action={formAction} className="grid gap-2 rounded-md border bg-muted/30 p-3">
      <input type="hidden" name="competitionId" value={competition.id} />
      <input type="hidden" name="teamId" value={team.id} />
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_auto]">
        <select
          name="studentId"
          className="h-8 min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue=""
          disabled={unassignedEnrollments.length === 0}
          aria-label={`Assign a registered student to ${team.name}`}
        >
          <option value="">
            {unassignedEnrollments.length === 0
              ? "No registered students available"
              : "Choose registered student"}
          </option>
          {unassignedEnrollments.map((enrollment) => (
            <option key={enrollment.studentId} value={enrollment.studentId}>
              {enrollment.student?.name ?? "Unknown student"}
              {enrollment.student?.className
                ? `, ${enrollment.student.className}`
                : ""}
              {enrollment.student?.gradeLevel
                ? `, ${enrollment.student.gradeLevel}`
                : ""}
            </option>
          ))}
        </select>
        <input
          name="role"
          className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Role"
          aria-label={`Optional role in ${team.name}`}
        />
        <SubmitButton
          icon={<UserPlus aria-hidden="true" />}
          disabled={unassignedEnrollments.length === 0}
        >
          Assign
        </SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

function RemoveMemberForm({
  memberId,
  studentName,
}: {
  memberId: string;
  studentName: string;
}) {
  const [state, formAction] = useActionState(removeTeamMemberAction, initialState);

  return (
    <form action={formAction} className="grid gap-1">
      <input type="hidden" name="id" value={memberId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        aria-label={`Remove ${studentName} from team`}
      >
        <UserMinus aria-hidden="true" />
        Remove
      </Button>
      <ActionMessage state={state} />
    </form>
  );
}

export function CompetitionTeamManager({
  competition,
  enrollments,
  teams,
}: CompetitionTeamManagerProps) {
  const assignedStudentIds = useMemo(
    () =>
      new Set(
        teams.flatMap((team) =>
          team.members.map((member) => member.studentId),
        ),
      ),
    [teams],
  );
  const activeEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          enrollment.status !== "withdrawn" && enrollment.student?.status === "active",
      ),
    [enrollments],
  );
  const unassignedEnrollments = useMemo(
    () =>
      activeEnrollments.filter(
        (enrollment) => !assignedStudentIds.has(enrollment.studentId),
      ),
    [activeEnrollments, assignedStudentIds],
  );

  return (
    <div className="grid min-w-0 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <UsersRound
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">Competition teams</h3>
            <p className="text-xs text-muted-foreground">
              {teams.length} team{teams.length === 1 ? "" : "s"} and{" "}
              {unassignedEnrollments.length} registered student
              {unassignedEnrollments.length === 1 ? "" : "s"} without a team
            </p>
          </div>
        </div>
      </div>

      <CreateTeamForm competition={competition} />

      {teams.length > 0 ? (
        <div className="grid gap-4">
          {teams.map((team) => (
            <section key={team.id} className="grid gap-4 rounded-md border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="break-words font-semibold">{team.name}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {team.members.length} student
                    {team.members.length === 1 ? "" : "s"}
                    {team.notes ? ` / ${team.notes}` : ""}
                  </p>
                </div>
                <DeleteTeamForm team={team} />
              </div>

              <UpdateTeamForm competition={competition} team={team} />

              {team.members.length > 0 ? (
                <div className="grid gap-2">
                  {team.members.map((member) => {
                    const studentName = member.student?.name ?? "Unknown student";

                    return (
                      <div
                        key={member.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-background px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="font-medium">{studentName}</div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[member.role, member.student?.className, member.student?.gradeLevel]
                              .filter(Boolean)
                              .join(" / ") || "No student details"}
                          </p>
                        </div>
                        <RemoveMemberForm
                          memberId={member.id}
                          studentName={studentName}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
                  No students assigned to this team yet.
                </p>
              )}

              <AssignStudentForm
                competition={competition}
                team={team}
                unassignedEnrollments={unassignedEnrollments}
              />
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
          No teams yet. Teams are optional, so registered students can remain
          without a team.
        </p>
      )}

      <section className="grid gap-2 rounded-md border bg-muted/30 p-4">
        <h4 className="font-semibold">No team assigned</h4>
        {unassignedEnrollments.length > 0 ? (
          <div className="grid gap-2">
            {unassignedEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-md bg-background px-3 py-2 text-sm"
              >
                <div className="font-medium">
                  {enrollment.student?.name ?? "Unknown student"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[enrollment.student?.className, enrollment.student?.gradeLevel]
                    .filter(Boolean)
                    .join(" / ") || "Registered student"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Every active registered student is assigned to a team.
          </p>
        )}
      </section>
    </div>
  );
}
