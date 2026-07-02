-- Phase 12A: enforce optional competition team management safety.
-- Team tables already exist from the initial schema; this migration adds the
-- MVP product rules for active team membership and safe team deletion.

create unique index if not exists team_members_one_active_team_per_competition_student_idx
on public.team_members(competition_id, student_id)
where status = 'active';

create or replace function public.ensure_active_team_member_is_registered()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and not exists (
    select 1
    from public.student_competitions sc
    where sc.student_id = new.student_id
      and sc.competition_id = new.competition_id
      and sc.status <> 'withdrawn'
  ) then
    raise exception 'Student must be registered to the competition before joining a team.';
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_active_team_member_is_registered on public.team_members;
create trigger ensure_active_team_member_is_registered
before insert or update on public.team_members
for each row execute function public.ensure_active_team_member_is_registered();

create or replace function public.block_team_delete_with_active_members()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.team_members tm
    where tm.team_id = old.id
      and tm.status = 'active'
  ) then
    raise exception 'Remove active team members before deleting this team.';
  end if;

  return old;
end;
$$;

drop trigger if exists block_team_delete_with_active_members on public.teams;
create trigger block_team_delete_with_active_members
before delete on public.teams
for each row execute function public.block_team_delete_with_active_members();
