-- ─────────────────────────────────────────────────────────────────────
-- Migration: add author_title_i18n to reviews
-- Run this in the SQL editor at https://app.supabase.com/project/_/sql
-- ─────────────────────────────────────────────────────────────────────

-- 1. Add the new localized column
alter table reviews
  add column if not exists author_title_i18n jsonb not null default '{}'::jsonb;

-- 2. Migrate existing author_title values into the Spanish locale
update reviews
set author_title_i18n = jsonb_build_object('es', author_title)
where author_title is not null and author_title <> '';
