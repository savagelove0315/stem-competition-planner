"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CompetitionOverview } from "@/features/dashboard/types";

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
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Competition overview</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Active and planned competitions with current enrollment and activity counts.
        </p>
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
        <div className="divide-y">
          {competitions.map((competition) => {
            const isExpanded = expandedCompetitionIds.has(competition.id);

            return (
              <div key={competition.id} className="grid gap-3 px-5 py-4">
                <button
                  type="button"
                  className="flex min-w-0 items-start gap-3 text-left"
                  aria-expanded={isExpanded}
                  onClick={() => toggleCompetition(competition.id)}
                >
                  <span className="mt-0.5 text-muted-foreground" aria-hidden="true">
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </span>
                  <span className="grid min-w-0 flex-1 gap-2">
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: competition.color }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate font-medium">
                        {competition.name}
                      </span>
                      <span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium capitalize">
                        {competition.status}
                      </span>
                    </span>
                    <span className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-5">
                      <span>
                        {competition.enrolledStudentCount} enrolled students
                      </span>
                      <span>{competition.activityCount} activities</span>
                      <span>{competition.upcomingActivityCount} upcoming</span>
                      <span>
                        {competition.participantAssignmentCount} participant
                        assignments
                      </span>
                      <span>{competition.teamCount} teams</span>
                    </span>
                  </span>
                </button>

                {isExpanded ? (
                  <div className="ml-8 grid gap-3 rounded-md border bg-background p-4">
                    {competition.teams.length > 0 ? (
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
                    )}

                    <section className="grid gap-2 border-t pt-3">
                      <h4 className="font-medium">No team assigned</h4>
                      {competition.unassignedStudents.length > 0 ? (
                        <ul className="grid gap-1 text-sm text-muted-foreground">
                          {competition.unassignedStudents.map((student) => (
                            <li key={student.id}>{student.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No active registered students are waiting for a team.
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
