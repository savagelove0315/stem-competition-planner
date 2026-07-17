alter table public.students
  add column if not exists mykid_number text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'students_mykid_number_format_check'
      and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_mykid_number_format_check
      check (mykid_number is null or mykid_number ~ '^[0-9]{12}$')
      not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from public.students
    where mykid_number is not null
      and mykid_number !~ '^[0-9]{12}$'
  ) then
    alter table public.students
      validate constraint students_mykid_number_format_check;
  end if;
end
$$;
