import "server-only";

import { listActivityParticipants } from "@/features/activity-participants/queries";
import { listActivities } from "@/features/activities/queries";
import { getConflictDetectionData } from "@/features/conflicts/queries";
import { buildConflictViewModel } from "@/features/conflicts/utils";
import { listCompetitions } from "@/features/competitions/queries";
import { listStudents } from "@/features/students/queries";
import { listCompetitionTeams } from "@/features/teams/queries";
import type { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(): Promise<DashboardData> {
  const [
    competitions,
    students,
    activities,
    activityParticipants,
    teams,
    conflictData,
  ] = await Promise.all([
    listCompetitions(),
    listStudents(),
    listActivities(),
    listActivityParticipants(),
    listCompetitionTeams(),
    getConflictDetectionData(),
  ]);
  const conflictViewModel = buildConflictViewModel({
    ...conflictData,
    filters: {
      month: null,
      startDate: null,
      endDate: null,
      competitionId: null,
      severity: null,
      reviewStatus: null,
      gradeLevel: null,
      className: null,
      onlyMultiCompetition: false,
    },
  });

  return {
    competitions: competitions.map((competition) => ({
      id: competition.id,
      name: competition.name,
      shortName: competition.shortName,
      color: competition.color,
      status: competition.status,
      participationMode: competition.participationMode,
    })),
    students: students.map((student) => ({
      id: student.id,
      name:
        student.displayName ??
        [student.firstName, student.lastName].filter(Boolean).join(" "),
      className: student.className,
      gradeLevel: student.gradeLevel,
      status: student.status,
      registeredCompetitionIds: student.competitionAssignments.map(
        (assignment) => assignment.competitionId,
      ),
    })),
    activities: activities.map((activity) => ({
      id: activity.id,
      competitionId: activity.competitionId,
      name: activity.name,
      status: activity.status,
      startsAt: activity.startsAt,
      endsAt: activity.endsAt,
      competition: activity.competition,
    })),
    activityParticipants: activityParticipants.map((participant) => ({
      id: participant.id,
      activityId: participant.activityId,
      competitionId: participant.competitionId,
      studentId: participant.studentId,
    })),
    teams: teams.map((team) => ({
      id: team.id,
      competitionId: team.competitionId,
      name: team.name,
      status: team.status,
      members: team.members.map((member) => ({
        id: member.id,
        teamId: member.teamId,
        competitionId: member.competitionId,
        studentId: member.studentId,
        role: member.role,
        studentName: member.student?.name ?? "Unknown student",
      })),
    })),
    conflicts: conflictViewModel.conflicts,
  };
}
