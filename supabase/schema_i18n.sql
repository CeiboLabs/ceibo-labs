-- ─────────────────────────────────────────────────────────────────────────────
-- i18n migration — adds JSONB bilingual fields to posts, projects, reviews,
-- and site_settings. Existing data is backfilled into Spanish ('es').
--
-- Run this AFTER schema.sql and schema_settings.sql.
-- Safe to run multiple times (uses IF NOT EXISTS / DO NOTHING patterns).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── POSTS ─────────────────────────────────────────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS title_i18n          jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS excerpt_i18n        jsonb          DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS content_i18n        jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cover_image_url_i18n jsonb         DEFAULT '{}'::jsonb;

-- Backfill existing single-language data into 'es'
UPDATE posts
SET
  title_i18n   = jsonb_build_object('es', title),
  excerpt_i18n = CASE
                   WHEN excerpt IS NOT NULL AND excerpt != ''
                   THEN jsonb_build_object('es', excerpt)
                   ELSE '{}'::jsonb
                 END,
  content_i18n = jsonb_build_object('es', content)
WHERE title_i18n = '{}'::jsonb;   -- only rows not yet migrated

-- Backfill cover_image_url → cover_image_url_i18n
-- Migrates existing cover into 'es'; also copies to 'en' so nothing breaks.
UPDATE posts
SET cover_image_url_i18n = CASE
  WHEN cover_image_url IS NOT NULL AND cover_image_url != ''
  THEN jsonb_build_object('es', cover_image_url, 'en', cover_image_url)
  ELSE '{}'::jsonb
END
WHERE cover_image_url_i18n = '{}'::jsonb;

-- ── PROJECTS ──────────────────────────────────────────────────────────────────

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS title_i18n             jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS short_description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS long_description_i18n  jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS highlights_i18n        jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE projects
SET
  title_i18n             = jsonb_build_object('es', title),
  short_description_i18n = jsonb_build_object('es', short_description),
  long_description_i18n  = jsonb_build_object('es', long_description),
  highlights_i18n        = jsonb_build_object('es', to_jsonb(highlights))
WHERE title_i18n = '{}'::jsonb;

-- ── REVIEWS ───────────────────────────────────────────────────────────────────

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS quote_i18n jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE reviews
SET quote_i18n = jsonb_build_object('es', quote)
WHERE quote_i18n = '{}'::jsonb;

-- ── SITE_SETTINGS ─────────────────────────────────────────────────────────────

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS maintenance_message_i18n jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS banner_text_i18n         jsonb DEFAULT '{}'::jsonb;

UPDATE site_settings
SET
  maintenance_message_i18n = CASE
    WHEN maintenance_message IS NOT NULL AND maintenance_message != ''
    THEN jsonb_build_object('es', maintenance_message)
    ELSE '{}'::jsonb
  END,
  banner_text_i18n = CASE
    WHEN banner_text IS NOT NULL AND banner_text != ''
    THEN jsonb_build_object('es', banner_text)
    ELSE '{}'::jsonb
  END
WHERE id = 1 AND maintenance_message_i18n = '{}'::jsonb;

-- RLS: existing policies cover all columns in the row — no changes needed.
-- Run schema_i18n_cleanup.sql separately once you have added English translations.
