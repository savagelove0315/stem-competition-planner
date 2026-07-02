import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Activity, ActivityStatus, Competition } from "@/types/database";

type CompetitionRow = {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  status: Competition["status"];
  participation_mode: Competition["participationMode"];
};

type ActivityRow = {
  id: string;
  competition_id: string;
  name: string;
  activity_type: string | null;
  description: string | null;
  status: ActivityStatus;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  capacity: number | null;
  requires_team: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  competitions: CompetitionRow | null;
};

export type ActivityCompetitionOption = Pick<
  Competition,
  "id" | "name" | "shortName" | "color" | "status" | "participationMode"
>;

export type ActivityWithCompetition = Activity & {
  competition: ActivityCompetitionOption | null;
};

function mapCompetitionOption(row: CompetitionRow): ActivityCompetitionOption {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    color: row.color,
    status: row.status,
    participationMode: row.participation_mode,
  };
}

function mapActivity(row: ActivityRow): ActivityWithCompetition {
  return {
    id: row.id,
    competitionId: row.competition_id,
    name: row.name,
    activityType: row.activity_type,
    description: row.description,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    capacity: row.capacity,
    requiresTeam: row.requires_team,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    competition: row.competitions ? mapCompetitionOption(row.competitions) : null,
  };
}

export async function listActivities(): Promise<ActivityWithCompetition[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activities")
    .select(
      `
        id,
        competition_id,
        name,
        activity_type,
        description,
        status,
        starts_at,
        ends_at,
        location,
        capacity,
        requires_team,
        notes,
        created_at,
        updated_at,
        competitions (
          id,
          name,
          short_name,
          color,
          status,
          participation_mode
        )
      `,
    )
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load activities: ${error.message}`);
  }

  return ((data ?? []) as unknown as ActivityRow[]).map(mapActivity);
}

export async function listActivityCompetitionOptions(): Promise<
  ActivityCompetitionOption[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("id,name,short_name,color,status,participation_mode")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load competition options: ${error.message}`);
  }

  return ((data ?? []) as unknown as CompetitionRow[]).map(mapCompetitionOption);
}
