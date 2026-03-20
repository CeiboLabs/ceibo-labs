-- ─────────────────────────────────────────────────────────────────────
-- Ceibo Labs — Projects
-- Run this in the SQL editor at https://app.supabase.com/project/_/sql
-- ─────────────────────────────────────────────────────────────────────

-- ─── TABLE: projects ─────────────────────────────────────────────────
create table if not exists projects (
  id                uuid        primary key default gen_random_uuid(),
  title             text        not null,
  slug              text        unique not null,
  short_description text        not null,
  long_description  text        not null,
  role              text,
  year              text,
  tags              text[]      not null default '{}',
  highlights        text[]      not null default '{}',
  live_url          text,
  github_url        text,
  status            text        not null default 'published'
    check (status in ('draft', 'published')),
  featured          boolean     not null default false,
  sort_order        int         not null default 0,
  gallery           jsonb       not null default '[]'::jsonb,
  cover_image_url   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Indexes
create index if not exists idx_projects_slug       on projects (slug);
create index if not exists idx_projects_status     on projects (status);
create index if not exists idx_projects_featured   on projects (featured);
create index if not exists idx_projects_sort_order on projects (sort_order);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────
alter table projects enable row level security;

-- Public can read published projects only
create policy "Public can read published projects"
  on projects for select
  using (status = 'published');

-- Authenticated users (founders) have full CRUD.
-- Access is further restricted at the app layer via allowlist.
create policy "Authenticated users have full access to projects"
  on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── STORAGE POLICIES (run after creating the "projects" bucket) ─────
-- Storage → New bucket → Name: projects → Public: on
create policy "Public read projects storage"
  on storage.objects for select
  using (bucket_id = 'projects');

create policy "Authenticated upload projects storage"
  on storage.objects for insert
  with check (bucket_id = 'projects' and auth.role() = 'authenticated');

create policy "Authenticated update projects storage"
  on storage.objects for update
  using (bucket_id = 'projects' and auth.role() = 'authenticated');

create policy "Authenticated delete projects storage"
  on storage.objects for delete
  using (bucket_id = 'projects' and auth.role() = 'authenticated');

-- ─── SEED DATA ───────────────────────────────────────────────────────
-- Migrated from the static lib/data/projects.ts file.
insert into projects (title, slug, short_description, long_description, role, year, tags, highlights, live_url, github_url, status, featured, sort_order) values
(
  'AI Content Assistant',
  'ai-content-assistant',
  'GPT-powered tool that helps marketing teams generate, edit, and optimize content at scale.',
  'AI Content Assistant is a full-stack SaaS platform built to accelerate content production. Teams can generate blog posts, social captions, and ad copy from simple prompts, then refine with built-in editing tools.' || E'\n\n' || 'Integrated with OpenAI''s GPT-4 and a custom tone-training layer, the tool learns your brand voice over time. Features include multi-language support, a content calendar, and one-click publishing to popular CMS platforms.',
  'Full-stack build',
  '2024',
  ARRAY['AI', 'Next.js', 'OpenAI API', 'TypeScript', 'PostgreSQL'],
  ARRAY['GPT-4 powered content generation', 'Custom brand voice training', 'Multi-language support', 'One-click CMS publishing'],
  null,
  null,
  'published',
  true,
  0
),
(
  'E-commerce Landing Kit',
  'ecommerce-landing-kit',
  'A high-converting, component-based landing page system for DTC brands and online stores.',
  'E-commerce Landing Kit is a Figma-to-code component library and deployment system for direct-to-consumer brands. It ships with 40+ pre-built sections optimized for conversion: hero banners, product showcases, trust badges, testimonial walls, and checkout CTAs.' || E'\n\n' || 'The kit integrates with Shopify and Stripe, and comes with A/B testing hooks baked in. Teams can go from design to live landing page in under a day.',
  'Front-end build',
  '2024',
  ARRAY['Web', 'Next.js', 'TailwindCSS', 'Stripe', 'Shopify API'],
  ARRAY['40+ pre-built conversion sections', 'Shopify & Stripe integration', 'A/B testing hooks', 'Design to production in < 1 day'],
  null,
  null,
  'published',
  true,
  1
),
(
  'Analytics Dashboard',
  'analytics-dashboard',
  'Real-time business intelligence dashboard with interactive charts and data drill-downs.',
  'Analytics Dashboard is a custom BI tool built for a retail client managing 12 storefronts. It aggregates sales, inventory, and customer data from multiple sources into a single, real-time view.' || E'\n\n' || 'Built with React and D3.js for the visualization layer, and a PostgreSQL + Redis backend for fast queries. Features include custom date ranges, exportable reports, role-based access, and automated email digests.',
  'Full-stack build',
  '2023',
  ARRAY['Web', 'React', 'D3.js', 'PostgreSQL', 'Redis'],
  ARRAY['Real-time multi-source data aggregation', 'Custom date range reports', 'Role-based access control', 'Automated email digests'],
  null,
  null,
  'published',
  false,
  2
),
(
  'Automation Bot',
  'automation-bot',
  'Multi-channel automation bot connecting CRMs, e-commerce platforms, and communication tools.',
  'Automation Bot is a no-code-friendly workflow engine that connects 30+ popular SaaS tools. Built for a logistics company, it automates order confirmations, inventory alerts, customer follow-ups, and internal Slack notifications.' || E'\n\n' || 'The bot uses a visual flow builder and runs on a serverless architecture. Reduced manual operations by 60% in the first month of deployment.',
  'Back-end build',
  '2024',
  ARRAY['AI', 'Python', 'OpenAI API', 'FastAPI', 'Docker'],
  ARRAY['30+ SaaS tool integrations', 'Visual flow builder', 'Serverless architecture', '60% reduction in manual operations'],
  null,
  null,
  'published',
  true,
  3
),
(
  'Portfolio Builder',
  'portfolio-builder',
  'A drag-and-drop portfolio builder for designers and developers with instant deployment.',
  'Portfolio Builder is a self-serve platform that lets creatives spin up a polished personal site in minutes. Users choose from 8 premium templates, customize via a live preview editor, and deploy to a custom domain with one click.' || E'\n\n' || 'Built on Next.js with a headless CMS backend, it handles SEO, analytics, and contact forms out of the box. Currently used by 200+ creatives in Latin America.',
  'Full-stack build',
  '2023',
  ARRAY['Web', 'Next.js', 'TypeScript', 'Sanity CMS', 'Vercel'],
  ARRAY['8 premium templates', 'Live preview editor', 'Custom domain deployment', '200+ active users in LATAM'],
  null,
  null,
  'published',
  false,
  4
),
(
  'Computer Vision Demo',
  'computer-vision-demo',
  'Real-time object detection and scene analysis demo using a fine-tuned vision model.',
  'Computer Vision Demo is an experimental showcase of real-time image analysis capabilities. It accepts live camera input or uploaded images and returns bounding boxes, object labels, and a natural-language scene description generated by a multimodal LLM.' || E'\n\n' || 'Built as an internal R&D project to explore visual AI for retail inventory management. Runs inference in under 300ms on edge hardware.',
  'R&D',
  '2024',
  ARRAY['AI', 'Python', 'TensorFlow', 'OpenCV', 'FastAPI'],
  ARRAY['< 300ms inference on edge hardware', 'Bounding box detection', 'Natural-language scene description', 'Live camera + image upload support'],
  null,
  null,
  'published',
  false,
  5
);
