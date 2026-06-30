import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  TimelineActivity,
  TimelineActivityRowData,
  TimelineCompetition,
  TimelineCompetitionRowData,
  TimelineData,
  TimelineParticipantRowData,
} from "@/features/timeline/types";

function mapCompetition(row: TimelineCompetitionRowData): TimelineCompetition {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    color: row.color,
    status: row.status,
  };
}

function mapActivity(
  row: TimelineActivityRowData,
  participantCounts: Map<string, number>,
): TimelineActivity {
  return {
    id: row.id,
    competitionId: row.competition_id,
    name: row.name,
    activityType: row.activity_type,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    participantCount: participantCounts.get(row.id) ?? 0,
    competition: row.competitions ? mapCompetition(row.competitions) : null,
  };
}

export async function getTimelineData(): Promise<TimelineData> {
  const supabase = await createSupabaseServerClient();
  const [competitionsResult, activitiesResult, participantsResult] =
    await Promise.all([
      supabase
        .from("competitions")
        .select("id,name,short_name,color,status")
        .order("name", { ascending: true }),
      supabase
        .from("activities")
        .select(
          `
            id,
            competition_id,
            name,
            activity_type,
            status,
            starts_at,
            ends_at,
            competitions (
              id,
              name,
              short_name,
              color,
              status
            )
          `,
        )
        .order("starts_at", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true }),
      supabase
        .from("activity_participants")
        .select("activity_id,status")
        .neq("status", "cancelled"),
    ]);

  if (competitionsResult.error) {
    throw new Error(
      `Unable to load timeline competitions: ${competitionsResult.error.message}`,
    );
  }

  if (activitiesResult.error) {
    throw new Error(
      `Unable to load timeline activities: ${activitiesResult.error.message}`,
    );
  }

  if (participantsResult.error) {
    throw new Error(
      `Unable to load timeline participant counts: ${participantsResult.error.message}`,
    );
  }

  const participantCounts = new Map<string, number>();
  ((participantsResult.data ?? []) as unknown as TimelineParticipantRowData[])
    .forEach((row) => {
      participantCounts.set(
        row.activity_id,
        (participantCounts.get(row.activity_id) ?? 0) + 1,
      );
    });

  return {
    competitions: (
      (competitionsResult.data ?? []) as unknown as TimelineCompetitionRowData[]
    ).map(mapCompetition),
    activities: (
      (activitiesResult.data ?? []) as unknown as TimelineActivityRowData[]
    ).map((activity) => mapActivity(activity, participantCounts)),
  };
}
