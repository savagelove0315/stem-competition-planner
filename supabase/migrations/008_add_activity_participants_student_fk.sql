-- Phase 6B follow-up: add a direct student relationship for participant display.
--
-- activity_participants already has a composite foreign key to
-- student_competitions(student_id, competition_id). Keep that relationship:
-- it enforces that a student is registered for the same competition as the
-- activity. This additional direct FK supports Supabase/PostgREST relationship
-- discovery and simple participant display joins to students.

do $$
declare
  has_direct_student_fk boolean;
begin
  select exists (
    select 1
    from pg_constraint constraint_record
    join pg_attribute local_attribute
      on local_attribute.attrelid = constraint_record.conrelid
      and local_attribute.attnum = any(constraint_record.conkey)
    where constraint_record.conrelid = 'public.activity_participants'::regclass
      and constraint_record.confrelid = 'public.students'::regclass
      and constraint_record.contype = 'f'
      and local_attribute.attname = 'student_id'
  )
  into has_direct_student_fk;

  if not has_direct_student_fk then
    alter table public.activity_participants
      add constraint activity_participants_student_id_fk
      foreign key (student_id)
      references public.students(id)
      on delete cascade;
  end if;
end
$$;

create index if not exists activity_participants_student_idx
  on public.activity_participants(student_id);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.activity_participants'::regclass
      and conname = 'activity_participants_student_id_fk'
  ) then
    execute $comment$
      comment on constraint activity_participants_student_id_fk
      on public.activity_participants is
        'Direct student FK for participant display and Supabase relationship discovery. Same-competition registration remains enforced by activity_participants_student_competition_fk.'
    $comment$;
  end if;
end
$$;
