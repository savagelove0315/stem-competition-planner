-- Phase 5B: student profile fields for school filtering, reports, timelines,
-- and conflict-detection context. These are generic student attributes and do
-- not encode competition-specific participation.

alter table public.students
  add column if not exists class_name text,
  add column if not exists parent_contact text;

comment on column public.students.student_code is
  'Optional stable student identifier or school-issued student code. Class placement belongs in class_name.';

comment on column public.students.class_name is
  'Optional class, homeroom, section, or cohort label used for filtering student lists and reports.';

comment on column public.students.grade_level is
  'Optional grade, year, or level used for filtering, timeline grouping, reports, and conflict review.';

comment on column public.students.parent_contact is
  'Optional parent or guardian contact details for coordinator follow-up.';

comment on column public.students.notes is
  'Optional internal notes or remarks about the student record.';

create index if not exists students_class_name_idx
  on public.students(class_name);

create index if not exists students_grade_level_idx
  on public.students(grade_level);
