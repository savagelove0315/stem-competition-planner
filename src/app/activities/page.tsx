import { ActivityForm } from "@/components/activities/activity-form";
import { ActivityList } from "@/components/activities/activity-list";
import {
  listActivityParticipants,
  listActivityParticipantStudentOptions,
} from "@/features/activity-participants/queries";
import {
  listActivities,
} from "@/features/activities/queries";
import { listCompetitionEnrollments } from "@/features/competition-enrollments/queries";
import { listCompetitions } from "@/features/competitions/queries";
import { listCompetitionTeams } from "@/features/teams/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function ActivitiesPage() {
  await requireUser("/activities");

  const [
    activities,
    competitions,
    participantAssignments,
    participantStudentOptions,
    competitionEnrollments,
    competitionTeams,
  ] = await Promise.all([
    listActivities(),
    listCompetitions(),
    listActivityParticipants(),
    listActivityParticipantStudentOptions(),
    listCompetitionEnrollments(),
    listCompetitionTeams(),
  ]);
  const competitionOptions = competitions.map((competition) => ({
    id: competition.id,
    name: competition.name,
    shortName: competition.shortName,
    color: competition.color,
    status: competition.status,
    participationMode: competition.participationMode,
  }));

  return (
    <section className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Planning</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
            Activity Master
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
            Create and manage activities for any dynamic competition. Each
            activity belongs to one competition record from the database.
          </p>
        </div>
      </div>

      <ActivityForm
        mode="create"
        competitionOptions={competitionOptions}
        competitionEnrollments={competitionEnrollments}
        competitionTeams={competitionTeams}
      />
      <ActivityList
        activities={activities}
        competitionOptions={competitionOptions}
        participantAssignments={participantAssignments}
        participantStudentOptions={participantStudentOptions}
      />
    </section>
  );
}
