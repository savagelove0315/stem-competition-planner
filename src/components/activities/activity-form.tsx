"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { CheckCircle2, Loader2, Save, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { CompetitionEnrollment } from "@/features/competition-enrollments/queries";
import {
  createActivityAction,
  updateActivityAction,
  type ActivityActionState,
} from "@/features/activities/actions";
import type {
  ActivityCompetitionOption,
  ActivityWithCompetition,
} from "@/features/activities/queries";
import {
  activityStatuses,
  activityTypes,
} from "@/features/activities/schemas";
import type { CompetitionTeam } from "@/features/teams/queries";
import type { ParticipationMode } from "@/types/database";

type ActivityFormProps = {
  mode: "create" | "edit";
  activity?: ActivityWithCompetition;
  competitionOptions: ActivityCompetitionOption[];
  competitionEnrollments?: CompetitionEnrollment[];
  competitionTeams?: CompetitionTeam[];
  onCancel?: () => void;
  onSuccess?: () => void;
};

const initialState: ActivityActionState = {
  status: "idle",
  message: null,
};

function dateInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

function timeInputValue(value: string | null | undefined): string {
  return value ? value.slice(11, 16) : "";
}

function SubmitButton({ mode }: Pick<ActivityFormProps, "mode">) {
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
          ? "Add Activity"
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

const participationModeLabels: Record<ParticipationMode, string> = {
  individual: "Individual",
  team: "Team",
  mixed: "Mixed",
};

export function ActivityForm({
  mode,
  activity,
  competitionOptions,
  competitionEnrollments = [],
  competitionTeams = [],
  onCancel,
  onSuccess,
}: ActivityFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const action = mode === "create" ? createActivityAction : updateActivityAction;
  const [state, formAction] = useActionState(action, initialState);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(
    activity?.competitionId ?? "",
  );
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    () => new Set(),
  );
  const selectedCompetition = useMemo(
    () =>
      competitionOptions.find(
        (competition) => competition.id === selectedCompetitionId,
      ) ?? null,
    [competitionOptions, selectedCompetitionId],
  );
  const activeEnrollments = useMemo(
    () =>
      competitionEnrollments
        .filter(
          (enrollment) =>
            enrollment.competitionId === selectedCompetitionId &&
            enrollment.status !== "withdrawn" &&
            enrollment.student?.status === "active",
        )
        .sort((left, right) =>
          (left.student?.name ?? "").localeCompare(right.student?.name ?? ""),
        ),
    [competitionEnrollments, selectedCompetitionId],
  );
  const activeTeams = useMemo(
    () =>
      competitionTeams
        .filter(
          (team) =>
            team.competitionId === selectedCompetitionId &&
            team.status === "active",
        )
        .map((team) => ({
          ...team,
          members: team.members.filter(
            (member) => member.student?.status === "active",
          ),
        })),
    [competitionTeams, selectedCompetitionId],
  );
  const teamMemberStudentIds = useMemo(
    () =>
      new Set(
        activeTeams.flatMap((team) =>
          team.members.map((member) => member.studentId),
        ),
      ),
    [activeTeams],
  );
  const unassignedEnrollments = useMemo(
    () =>
      activeEnrollments.filter(
        (enrollment) => !teamMemberStudentIds.has(enrollment.studentId),
      ),
    [activeEnrollments, teamMemberStudentIds],
  );
  const selectableIndividualEnrollments =
    selectedCompetition?.participationMode === "individual"
      ? activeEnrollments
      : unassignedEnrollments;
  const selectedParticipantCount = useMemo(() => {
    const participantIds = new Set(selectedStudentIds);

    activeTeams.forEach((team) => {
      if (!selectedTeamIds.has(team.id)) {
        return;
      }

      team.members.forEach((member) => {
        participantIds.add(member.studentId);
      });
    });

    return participantIds.size;
  }, [activeTeams, selectedStudentIds, selectedTeamIds]);
  const showTeams =
    mode === "create" &&
    selectedCompetition !== null &&
    selectedCompetition.participationMode !== "individual";
  const showIndividualStudents =
    mode === "create" &&
    selectedCompetition !== null &&
    (selectedCompetition.participationMode === "individual" ||
      selectedCompetition.participationMode === "team" ||
      selectedCompetition.participationMode === "mixed");

  function toggleSetValue(
    value: string,
    checked: boolean,
    setValues: React.Dispatch<React.SetStateAction<Set<string>>>,
  ) {
    setValues((currentValues) => {
      const nextValues = new Set(currentValues);

      if (checked) {
        nextValues.add(value);
      } else {
        nextValues.delete(value);
      }

      return nextValues;
    });
  }

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    router.refresh();

    if (mode === "create") {
      formRef.current?.reset();
      window.setTimeout(() => {
        setSelectedCompetitionId("");
        setSelectedTeamIds(new Set());
        setSelectedStudentIds(new Set());
      }, 0);
      return;
    }

    onSuccess?.();
  }, [mode, onSuccess, router, state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid w-full min-w-0 gap-5 rounded-lg border bg-card p-5 shadow-sm"
    >
      {activity ? <input type="hidden" name="id" value={activity.id} /> : null}

      <div>
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Add activity" : "Edit activity"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Activities belong to one configured competition and become schedulable
          planner units.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid min-w-0 gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-name`}>
            Activity name
          </label>
          <input
            id={`${mode}-name`}
            name="name"
            defaultValue={activity?.name ?? ""}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-competitionId`}
          >
            Competition
          </label>
          <select
            id={`${mode}-competitionId`}
            name="competitionId"
            defaultValue={activity?.competitionId ?? ""}
            onChange={(event) => {
              setSelectedCompetitionId(event.target.value);
              setSelectedTeamIds(new Set());
              setSelectedStudentIds(new Set());
            }}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Choose a competition</option>
            {competitionOptions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.shortName
                  ? `${competition.shortName} - ${competition.name}`
                  : competition.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.competitionId} />
        </div>

        {mode === "create" ? (
          selectedCompetition ? (
            <section className="grid gap-4 rounded-md border bg-background p-4 md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <UsersRound
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <h3 className="font-semibold">Assign participants</h3>
                    <span className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {
                        participationModeLabels[
                          selectedCompetition.participationMode
                        ]
                      }
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Optional during creation. You can still adjust participants
                    after the activity is saved.
                  </p>
                </div>
                <span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium">
                  {selectedParticipantCount} selected
                </span>
              </div>

              {showTeams ? (
                <div className="grid gap-3">
                  <h4 className="text-sm font-medium">Teams</h4>
                  {activeTeams.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {activeTeams.map((team) => (
                        <label
                          key={team.id}
                          className="grid cursor-pointer gap-2 rounded-md border p-3"
                        >
                          <span className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              name="teamIds"
                              value={team.id}
                              checked={selectedTeamIds.has(team.id)}
                              onChange={(event) =>
                                toggleSetValue(
                                  team.id,
                                  event.target.checked,
                                  setSelectedTeamIds,
                                )
                              }
                              className="mt-0.5 size-4 rounded border-input"
                            />
                            <span className="min-w-0">
                              <span className="block break-words font-medium">
                                {team.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {team.members.length} active member
                                {team.members.length === 1 ? "" : "s"}
                              </span>
                            </span>
                          </span>
                          <details className="pl-7 text-xs text-muted-foreground">
                            <summary className="cursor-pointer">Members</summary>
                            {team.members.length > 0 ? (
                              <ul className="mt-2 grid gap-1">
                                {team.members.map((member) => (
                                  <li key={member.id}>
                                    {member.student?.name ?? "Unknown student"}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2">No active members.</p>
                            )}
                          </details>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
                      No active teams are available for this competition.
                    </p>
                  )}
                </div>
              ) : null}

              {showIndividualStudents ? (
                <div className="grid gap-3">
                  <h4 className="text-sm font-medium">
                    {selectedCompetition.participationMode === "individual"
                      ? "Registered students"
                      : "Individual / No team assigned"}
                  </h4>
                  {selectableIndividualEnrollments.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      {selectableIndividualEnrollments.map((enrollment) => (
                        <label
                          key={enrollment.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2"
                        >
                          <input
                            type="checkbox"
                            name="studentIds"
                            value={enrollment.studentId}
                            checked={selectedStudentIds.has(
                              enrollment.studentId,
                            )}
                            onChange={(event) =>
                              toggleSetValue(
                                enrollment.studentId,
                                event.target.checked,
                                setSelectedStudentIds,
                              )
                            }
                            className="mt-0.5 size-4 rounded border-input"
                          />
                          <span className="min-w-0">
                            <span className="block break-words font-medium">
                              {enrollment.student?.name ?? "Unknown student"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {[
                                enrollment.student?.className,
                                enrollment.student?.gradeLevel,
                              ]
                                .filter(Boolean)
                                .join(" / ") || "Registered student"}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground">
                      No active registered students are available for this
                      selection.
                    </p>
                  )}
                </div>
              ) : null}
            </section>
          ) : (
            <p className="rounded-md border border-dashed bg-background px-3 py-3 text-sm text-muted-foreground md:col-span-2">
              Select a competition to assign students or teams.
            </p>
          )
        ) : null}

        <div className="grid min-w-0 gap-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-activityType`}
          >
            Activity type
          </label>
          <select
            id={`${mode}-activityType`}
            name="activityType"
            defaultValue={activity?.activityType ?? "Training"}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            {activityTypes.map((activityType) => (
              <option key={activityType} value={activityType}>
                {activityType}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.activityType} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-startDate`}>
            Start date
          </label>
          <input
            id={`${mode}-startDate`}
            name="startDate"
            type="date"
            defaultValue={dateInputValue(activity?.startsAt)}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.startDate} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-endDate`}>
            End date
          </label>
          <input
            id={`${mode}-endDate`}
            name="endDate"
            type="date"
            defaultValue={dateInputValue(activity?.endsAt)}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.endDate} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-startTime`}>
            Start time
          </label>
          <input
            id={`${mode}-startTime`}
            name="startTime"
            type="time"
            defaultValue={timeInputValue(activity?.startsAt)}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.startTime} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-endTime`}>
            End time
          </label>
          <input
            id={`${mode}-endTime`}
            name="endTime"
            type="time"
            defaultValue={timeInputValue(activity?.endsAt)}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.endTime} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-location`}>
            Location
          </label>
          <input
            id={`${mode}-location`}
            name="location"
            defaultValue={activity?.location ?? ""}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.location} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-capacity`}>
            Capacity
          </label>
          <input
            id={`${mode}-capacity`}
            name="capacity"
            type="number"
            min={1}
            defaultValue={activity?.capacity ?? ""}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.capacity} />
        </div>

        <div className="grid min-w-0 gap-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-status`}>
            Status
          </label>
          <select
            id={`${mode}-status`}
            name="status"
            defaultValue={activity?.status ?? "planned"}
            className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            {activityStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </div>

        <label className="flex min-h-10 min-w-0 items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm">
          <input
            type="checkbox"
            name="requiresTeam"
            defaultChecked={activity?.requiresTeam ?? false}
            className="size-4 rounded border-input"
          />
          <span>Requires a team</span>
        </label>

        <div className="grid min-w-0 gap-2 md:col-span-2">
          <label
            className="text-sm font-medium"
            htmlFor={`${mode}-description`}
          >
            Description
          </label>
          <textarea
            id={`${mode}-description`}
            name="description"
            rows={3}
            defaultValue={activity?.description ?? ""}
            className="min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="grid min-w-0 gap-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor={`${mode}-notes`}>
            Notes / remarks
          </label>
          <textarea
            id={`${mode}-notes`}
            name="notes"
            rows={3}
            defaultValue={activity?.notes ?? ""}
            className="min-h-24 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </div>
      </div>

      {competitionOptions.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          Add a competition in Competition Settings before creating activities.
        </p>
      ) : null}

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
