-- ─────────────────────────────────────────────────────────────────────
-- Ceibo Labs — Supabase Schema
-- Run this in the SQL editor at https://app.supabase.com/project/_/sql
-- ─────────────────────────────────────────────────────────────────────

-- ─── TABLE: posts ────────────────────────────────────────────────────
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  excerpt       text,
  content       text not null default '',
  tags          text[] not null default '{}',
  cover_image_url text,
  status        text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_posts_slug   on posts (slug);
create index if not exists idx_posts_status on posts (status, published_at desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_updated_at on posts;
create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────
alter table posts enable row level security;

-- Public can read published posts only
create policy "Public can read published posts"
  on posts for select
  using (status = 'published');

-- Authenticated users (founders only — we control who gets accounts) have full CRUD.
-- Access is further restricted at the app layer via allowlist in middleware + login action.
create policy "Authenticated users have full access"
  on posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─── STORAGE POLICIES (run after creating the "blog" bucket) ──────────
-- Storage → New bucket → Name: blog → Public: on
create policy "Public read blog storage"
  on storage.objects for select
  using (bucket_id = 'blog');

create policy "Authenticated upload blog storage"
  on storage.objects for insert
  with check (bucket_id = 'blog' and auth.role() = 'authenticated');

create policy "Authenticated update blog storage"
  on storage.objects for update
  using (bucket_id = 'blog' and auth.role() = 'authenticated');

create policy "Authenticated delete blog storage"
  on storage.objects for delete
  using (bucket_id = 'blog' and auth.role() = 'authenticated');

-- ─── SEED DATA (example posts) ───────────────────────────────────────
-- Run these inserts after the founder Supabase Auth users are created.
-- Posts are set to 'published' so they appear on the blog immediately.

insert into posts (title, slug, excerpt, content, tags, status, published_at) values
(
  'Building a modern portfolio studio site with Next.js',
  'building-portfolio-studio-nextjs',
  'How we designed and built the Ceibo Labs website — from tech choices to deployment.',
  E'# Building a modern portfolio studio site with Next.js\n\nAt Ceibo Labs, we practice what we preach. When it was time to build our own studio site, we treated it like any client project: scoped requirements, chose a deliberate stack, and shipped.\n\n## Why Next.js?\n\nNext.js 15 with the App Router gave us everything we needed: static generation for fast page loads, server components for metadata and SEO, and seamless Vercel deployment.\n\n## Design philosophy\n\nWe kept the palette simple — a deep navy background, electric blue accents, and clean white type. Inspired by Linear, Vercel, and Stripe. No gradients for the sake of it, no hero images that slow things down.\n\n## Framer Motion for subtle animation\n\nWe used `framer-motion` sparingly — viewport-triggered fade-ins and staggered card entrances. The goal was *felt* rather than *seen*.\n\n## Internationalization without a library\n\nThe site supports Spanish and English, auto-detected from `navigator.language`. We wrote a tiny context-based i18n system (~60 lines) instead of pulling in a 50kb library.\n\n## Deployment\n\nVercel. Zero config. Done.',
  ARRAY['Next.js', 'Design', 'Case Study'],
  'published',
  now() - interval '14 days'
),
(
  'Lessons from integrating AI into real products',
  'lessons-integrating-ai-real-products',
  'What we learned after shipping multiple AI-powered features to production clients.',
  E'# Lessons from integrating AI into real products\n\nAfter shipping AI features into several production apps, we have a few hard-won lessons to share.\n\n## 1. Latency is a UX problem first\n\nStreaming responses with the Vercel AI SDK transformed the feel of our chat interfaces. Users tolerate slow AI if they see progress — a blank screen for 3 seconds is unacceptable.\n\n## 2. Prompt engineering is engineering\n\nTreating prompts as code — versioned, tested, and reviewed — made our outputs dramatically more consistent. We now keep prompts in source control alongside the components that render them.\n\n## 3. Guard against hallucinations at the boundary\n\nDon''t let raw LLM output touch your database without a schema validation layer. We use Zod to parse structured outputs before writing anything.\n\n## 4. Cost scales with misuse\n\nRate limiting and token budgets per user prevented runaway API costs. Monitor your token usage from day one.\n\n## Closing thought\n\nAI is a powerful lever, but a lever still needs a machine around it. The software engineering fundamentals — clean architecture, error handling, observability — matter more than ever.',
  ARRAY['AI', 'Engineering', 'Lessons'],
  'published',
  now() - interval '7 days'
),
(
  'Performance checklist for fast web apps',
  'performance-checklist-fast-web-apps',
  'A practical list of optimizations we apply on every project to hit sub-second load times.',
  E'# Performance checklist for fast web apps\n\nEvery project we ship goes through this checklist before launch.\n\n## Images\n- [ ] Use `next/image` with explicit `width`/`height`\n- [ ] Serve WebP/AVIF via format negotiation\n- [ ] Add `priority` prop only to above-the-fold images\n- [ ] Lazy-load everything else\n\n## Fonts\n- [ ] Use `next/font` with `display: swap`\n- [ ] Subset to Latin characters if possible\n- [ ] Preload critical font files\n\n## JavaScript\n- [ ] Audit your bundle with `@next/bundle-analyzer`\n- [ ] Defer non-critical third-party scripts\n- [ ] Use `React.lazy` + Suspense for heavy client components\n\n## Network\n- [ ] Enable HTTP/2 (Vercel does this automatically)\n- [ ] Set cache headers for static assets (1 year)\n- [ ] Use a CDN for all media\n\n## Core Web Vitals targets\n| Metric | Target |\n|--------|--------|\n| LCP    | < 2.5s |\n| FID    | < 100ms |\n| CLS    | < 0.1 |',
  ARRAY['Performance', 'Engineering', 'Checklist'],
  'published',
  now() - interval '3 days'
),
(
  'From idea to MVP: our workflow at Ceibo Labs',
  'from-idea-to-mvp-ceibo-labs',
  'How we take a client from napkin sketch to a shipped product in 2–4 weeks.',
  E'# From idea to MVP: our workflow at Ceibo Labs\n\nWe ship fast without cutting corners. Here''s exactly how.\n\n## Week 0: Discovery (2–3 days)\n\n- 1-hour kick-off call: goals, users, constraints\n- Competitive audit\n- Draft a one-page scope doc with the client\n- Agree on a definition of "done"\n\n## Week 1: Design + Architecture\n\n- Figma wireframes (lo-fi first, hi-fi for key screens)\n- Tech stack decision\n- Database schema draft\n- Set up repo, CI, staging environment\n\n## Week 2–3: Build\n\n- Feature branches, daily async updates to the client\n- We ship to staging after every significant feature\n- Client reviews on staging — feedback is immediate\n\n## Week 4: Polish + Launch\n\n- Responsive QA on real devices\n- Lighthouse audit (we target 95+)\n- Security review (OWASP Top 10)\n- DNS cutover and production deploy\n- 30-day post-launch support window\n\n## The secret\n\nScope discipline. We say no to scope creep firmly and kindly. The MVP is the version that validates the idea — everything else comes in v2.',
  ARRAY['Process', 'MVP', 'Workflow'],
  'published',
  now() - interval '1 day'
);
