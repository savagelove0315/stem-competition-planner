"use client";

import { useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CompetitionOverview } from "@/features/dashboard/types";

const participationModeLabels = {
  individual: "Individual",
  team: "Team",
  mixed: "Mixed",
} as const;

type CompetitionOverviewCardProps = {
  competitions: CompetitionOverview[];
  hasCompetitions: boolean;
};

export function CompetitionOverviewCard({
  competitions,
  hasCompetitions,
}: CompetitionOverviewCardProps) {
  const [expandedCompetitionIds, setExpandedCompetitionIds] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleCompetition(competitionId: string) {
    setExpandedCompetitionIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(competitionId)) {
        nextIds.delete(competitionId);
      } else {
        nextIds.add(competitionId);
      }

      return nextIds;
    });
  }

  return (
    <section className="min-w-0 rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md border border-sky-500/20 bg-sky-500/10 text-sky-700">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Competition overview</h2>
            <p className="text-sm text-muted-foreground">
              Enrollment, activities, assignments, and team readiness.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/competitions">View all competitions</Link>
        </Button>
      </div>

      {competitions.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            {hasCompetitions
              ? "No active or planned competitions. Check completed or archived records on the competitions page."
              : "No competitions yet. Create a competition first so students, activities, and notices have a shared planning record."}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/competitions">Manage Competitions</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 p-4">
          {competitions.map((competition) => {
            const isExpanded = expandedCompetitionIds.has(competition.id);
            const supportsTeams = competition.participationMode !== "individual";
            const unassignedHeading =
              competition.participationMode === "mixed"
                ? "Individual / No team assigned"
                : "No team assigned";

            return (
              <div
                key={competition.id}
                className="grid gap-3 rounded-lg border bg-gradient-to-r from-white to-slate-50 p-3 shadow-sm"
              >
                <button
                  type="button"
                  className="flex min-w-0 items-start gap-3 text-left"
                  aria-expanded={isExpanded}
                  onClick={() => toggleCompetition(competition.id)}
                >
                  <span
                    className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground"
                    aria-hidden="true"
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </span>
                  <span className="grid min-w-0 flex-1 gap-2">
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full ring-4 ring-background"
                        style={{ backgroundColor: competition.color }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate font-semibold">
                        {competition.name}
                      </span>
                      <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium capitalize text-emerald-700">
                        {competition.status}
                      </span>
                      <span className="rounded-md border bg-background px-2 py-1 text-xs font-medium">
                        {participationModeLabels[competition.participationMode]}
                      </span>
                    </span>
                    <span className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-5">
                      <span className="rounded-md bg-background px-2 py-1">
                        {competition.enrolledStudentCount} enrolled
                      </span>
                      <span className="rounded-md bg-background px-2 py-1">
                        {competition.activityCount} activities
                      </span>
                      <span className="rounded-md bg-background px-2 py-1">
                        {competition.upcomingActivityCount} upcoming
                      </span>
                      <span className="rounded-md bg-background px-2 py-1">
                        {competition.participantAssignmentCount} assignments
                      </span>
                      {supportsTeams ? (
                        <span className="rounded-md bg-background px-2 py-1">
                          {competition.teamCount} teams
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>

                {isExpanded ? (
                  <div className="grid gap-3 rounded-md border bg-background p-4 sm:ml-11">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 font-medium">
                        <Activity className="size-3.5" aria-hidden="true" />
                        {competition.upcomingActivityCount} upcoming activities
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 font-medium">
                        <UsersRound className="size-3.5" aria-hidden="true" />
                        {competition.enrolledStudentCount} enrolled students
                      </span>
                    </div>
                    {supportsTeams ? (
                      competition.teams.length > 0 ? (
                        <div className="grid gap-3">
                          {competition.teams.map((team) => (
                            <section key={team.id} className="grid gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <UsersRound
                                  className="size-4 text-muted-foreground"
                                  aria-hidden="true"
                                />
                                <h4 className="font-medium">{team.name}</h4>
                                <span className="rounded-md border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {team.members.length} student
                                  {team.members.length === 1 ? "" : "s"}
                                </span>
                              </div>
                              {team.members.length > 0 ? (
                                <ul className="grid gap-1 pl-6 text-sm text-muted-foreground">
                                  {team.members.map((member) => (
                                    <li key={member.id}>
                                      {member.studentName}
                                      {member.role ? ` / ${member.role}` : ""}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="pl-6 text-sm text-muted-foreground">
                                  No students assigned.
                                </p>
                              )}
                            </section>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No teams have been created for this competition.
                        </p>
                      )
                    ) : null}

                    <section
                      className={
                        supportsTeams ? "grid gap-2 border-t pt-3" : "grid gap-2"
                      }
                    >
                      <h4 className="font-medium">
                        {supportsTeams ? unassignedHeading : "Registered students"}
                      </h4>
                      {competition.unassignedStudents.length > 0 ? (
                        <ul className="grid gap-1 text-sm text-muted-foreground">
                          {competition.unassignedStudents.map((student) => (
                            <li key={student.id}>{student.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {supportsTeams
                            ? "No active registered students are waiting for a team."
                            : "No active registered students yet."}
                        </p>
                      )}
                    </section>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
