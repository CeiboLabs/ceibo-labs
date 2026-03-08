-- ─────────────────────────────────────────────────────────────────────
-- Oriental Labs — Reviews / Testimonials
-- Run this in the SQL editor at https://app.supabase.com/project/_/sql
-- ─────────────────────────────────────────────────────────────────────

-- ─── TABLE: reviews ──────────────────────────────────────────────────
create table if not exists reviews (
  id                uuid        primary key default gen_random_uuid(),
  author_name       text        not null,
  author_title      text,                               -- deprecated: use author_title_i18n
  author_title_i18n jsonb       not null default '{}'::jsonb,
  author_company    text,
  author_avatar_url text,
  rating            int         not null default 5
    check (rating between 1 and 5),
  quote             text        not null,
  project_slug      text,
  source_url        text,
  featured          boolean     not null default false,
  status            text        not null default 'published'
    check (status in ('draft', 'published')),
  sort_order        int         not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Indexes
create index if not exists idx_reviews_status     on reviews (status);
create index if not exists idx_reviews_featured   on reviews (featured);
create index if not exists idx_reviews_sort_order on reviews (sort_order);

-- Auto-update updated_at (reuses the function from schema.sql if it exists)
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_updated_at on reviews;
create trigger reviews_updated_at
  before update on reviews
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────
alter table reviews enable row level security;

-- Public can read published reviews only
create policy "Public can read published reviews"
  on reviews for select
  using (status = 'published');

-- Authenticated users (founders) have full CRUD.
-- Access is further restricted at the app layer via allowlist in middleware.
create policy "Authenticated users have full access to reviews"
  on reviews for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── STORAGE POLICIES (run after creating the "avatars" bucket) ──────
-- Storage → New bucket → Name: avatars → Public: on
create policy "Public read avatars storage"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated upload avatars storage"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated update avatars storage"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated delete avatars storage"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
