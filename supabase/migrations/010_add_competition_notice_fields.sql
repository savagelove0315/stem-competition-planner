-- Phase 11A: parent notice display metadata for dynamic competitions.
-- These fields support read-only notice generation without storing notices.

alter table public.competitions
  add column if not exists notice_mode text,
  add column if not exists notice_period text;

comment on column public.competitions.notice_mode is
  'Optional competition format label used on parent notices, such as online, onsite, or hybrid.';

comment on column public.competitions.notice_period is
  'Optional flexible period label used on parent notices when exact start/end timestamps are not the clearest parent-facing wording.';
