import "server-only";

import { listActivityParticipants } from "@/features/activity-participants/queries";
import { listActivities } from "@/features/activities/queries";
import { getConflictDetectionData } from "@/features/conflicts/queries";
import { listCompetitions } from "@/features/competitions/queries";
import { listStudents } from "@/features/students/queries";

export async function getReportsData() {
  const [
    competitions,
    students,
    activities,
    activityParticipants,
    conflictData,
  ] = await Promise.all([
    listCompetitions(),
    listStudents(),
    listActivities(),
    listActivityParticipants(),
    getConflictDetectionData(),
  ]);

  return {
    competitions,
    students,
    activities,
    activityParticipants,
    conflictData,
  };
}
