-- Add a competition-level participation mode so team workflows remain optional.
-- Competitions are still generic data; this field describes how participants
-- are organized for a given competition record.

alter table public.competitions
  add column if not exists participation_mode text not null default 'individual';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'competitions_participation_mode_check'
      and conrelid = 'public.competitions'::regclass
  ) then
    alter table public.competitions
      add constraint competitions_participation_mode_check
      check (participation_mode in ('individual', 'team', 'mixed'));
  end if;
end
$$;

comment on column public.competitions.participation_mode is
  'Controls whether a competition uses individual participants, teams, or both for planner UI and reporting.';

do $$
begin
  if to_regclass('public.teams') is not null then
    update public.competitions as competition
    set participation_mode = 'team'
    where competition.participation_mode = 'individual'
      and exists (
        select 1
        from public.teams as team
        where team.competition_id = competition.id
          and team.status = 'active'
      );
  end if;
end
$$;

create index if not exists competitions_participation_mode_idx
  on public.competitions (participation_mode);
