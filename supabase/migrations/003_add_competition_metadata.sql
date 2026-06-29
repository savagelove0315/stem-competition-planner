-- Phase 4B: competition metadata used by generic planner UI surfaces.
-- These fields describe competitions as data and do not encode any fixed
-- competition names or product-specific categories.

alter table public.competitions
  add column short_name text,
  add column color text not null default '#2563eb',
  add column icon text,
  add column category text,
  add constraint competitions_color_hex_check
    check (color ~ '^#[0-9A-Fa-f]{6}$');

comment on column public.competitions.short_name is
  'Optional compact label for badges, filters, calendar bars, reports, and dense table displays.';

comment on column public.competitions.color is
  'Hex color used for generic visual treatment such as timeline bars, dashboard cards, badges, and reports.';

comment on column public.competitions.icon is
  'Optional icon token or label for generic UI display; values are data, not application logic.';

comment on column public.competitions.category is
  'Optional grouping label for filtering, reporting, and organizing dynamic competition records.';

create index competitions_category_idx on public.competitions(category);
