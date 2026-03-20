-- ─────────────────────────────────────────────────────────────────────
-- Ceibo Labs — Admin Settings & Audit Logs Schema
-- Run this in the SQL editor at https://app.supabase.com/project/_/sql
-- ─────────────────────────────────────────────────────────────────────

-- ─── TABLE: site_settings ────────────────────────────────────────────
create table if not exists site_settings (
  id                    int primary key default 1,

  -- Maintenance mode
  maintenance_enabled   boolean not null default false,
  maintenance_message   text,

  -- Global banner
  banner_enabled        boolean not null default false,
  banner_text           text,
  banner_link_url       text,

  -- Business state
  taking_clients        boolean not null default true,

  -- Contact links (override lib/constants.ts at runtime)
  contact_email         text,
  whatsapp_url          text,
  instagram_url         text,
  github_url            text,
  linkedin_url          text,

  -- Homepage limits
  home_projects_limit   int not null default 6,
  home_reviews_limit    int not null default 4,

  updated_at            timestamptz not null default now(),

  -- Enforce single row
  constraint site_settings_single_row check (id = 1)
);

-- Auto-update updated_at on change
create or replace function update_site_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_updated_at on site_settings;
create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function update_site_settings_updated_at();

-- Seed default row (safe to run multiple times)
insert into site_settings (id) values (1)
on conflict (id) do nothing;

-- ─── RLS: site_settings ──────────────────────────────────────────────
alter table site_settings enable row level security;

-- Public can read settings (maintenance mode, banner, etc.)
create policy "Public can read site_settings"
  on site_settings for select
  using (true);

-- Only authenticated founders can write
create policy "Authenticated can write site_settings"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ─── TABLE: audit_logs ───────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  action      text not null,
  actor_email text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at on audit_logs (created_at desc);

-- ─── TRIGGER: keep audit_logs ≤ 50 rows ─────────────────────────────
create or replace function trim_audit_logs()
returns trigger language plpgsql as $$
begin
  delete from audit_logs
  where id not in (
    select id from audit_logs
    order by created_at desc
    limit 50
  );
  return new;
end;
$$;

drop trigger if exists trim_audit_logs_trigger on audit_logs;
create trigger trim_audit_logs_trigger
  after insert on audit_logs
  for each row execute function trim_audit_logs();

-- ─── RLS: audit_logs ─────────────────────────────────────────────────
alter table audit_logs enable row level security;

create policy "Authenticated can insert audit_logs"
  on audit_logs for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated can read audit_logs"
  on audit_logs for select
  using (auth.role() = 'authenticated');
