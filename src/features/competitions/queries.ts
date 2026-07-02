import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Competition,
  CompetitionStatus,
  ParticipationMode,
} from "@/types/database";

type CompetitionRow = {
  id: string;
  name: string;
  short_name: string | null;
  color: string;
  icon: string | null;
  category: string | null;
  notice_mode: string | null;
  notice_period: string | null;
  participation_mode: ParticipationMode;
  description: string | null;
  status: CompetitionStatus;
  starts_at: string | null;
  ends_at: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  lead_teacher_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function mapCompetition(row: CompetitionRow): Competition {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    color: row.color,
    icon: row.icon,
    category: row.category,
    noticeMode: row.notice_mode,
    noticePeriod: row.notice_period,
    participationMode: row.participation_mode,
    description: row.description,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    registrationOpensAt: row.registration_opens_at,
    registrationClosesAt: row.registration_closes_at,
    leadTeacherId: row.lead_teacher_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCompetitions(): Promise<Competition[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("competitions")
    .select(
      [
        "id",
        "name",
        "short_name",
        "color",
        "icon",
        "category",
        "notice_mode",
        "notice_period",
        "participation_mode",
        "description",
        "status",
        "starts_at",
        "ends_at",
        "registration_opens_at",
        "registration_closes_at",
        "lead_teacher_id",
        "notes",
        "created_at",
        "updated_at",
      ].join(","),
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load competitions: ${error.message}`);
  }

  return ((data ?? []) as unknown as CompetitionRow[]).map(mapCompetition);
}
