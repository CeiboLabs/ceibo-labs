'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';

async function getActorEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

// ── Post ─────────────────────────────────────────────────────────────────────

export async function deletePostAction(
  id: string
): Promise<{ error: string | null }> {
  const actorEmail = await getActorEmail();
  if (!actorEmail) return { error: 'Not authenticated.' };

  const supabase = await createClient();

  // Fetch before-snapshot (no content — data minimization)
  const { data: post } = await supabase
    .from('posts')
    .select('id, slug, status, tags, published_at, title_i18n, excerpt_i18n')
    .eq('id', id)
    .single();

  if (!post) return { error: 'Post not found.' };

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { error: error.message };

  logAudit({
    action:     'post.delete',
    actorEmail,
    entityType: 'post',
    entityId:   id,
    entitySlug: post.slug,
    before: {
      title:       (post.title_i18n as Record<string, string> | null)?.es ?? post.slug,
      slug:        post.slug,
      status:      post.status,
      tags:        post.tags,
      published_at: post.published_at,
    },
    after: null,
  });

  revalidatePath('/admin');
  return { error: null };
}

// ── Project ───────────────────────────────────────────────────────────────────

export async function deleteProjectAction(
  id: string
): Promise<{ error: string | null }> {
  const actorEmail = await getActorEmail();
  if (!actorEmail) return { error: 'Not authenticated.' };

  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, status, featured, sort_order, year, tags, title_i18n')
    .eq('id', id)
    .single();

  if (!project) return { error: 'Project not found.' };

  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) return { error: error.message };

  logAudit({
    action:     'project.delete',
    actorEmail,
    entityType: 'project',
    entityId:   id,
    entitySlug: project.slug,
    before: {
      title:      (project.title_i18n as Record<string, string> | null)?.es ?? project.slug,
      slug:       project.slug,
      status:     project.status,
      featured:   project.featured,
      sort_order: project.sort_order,
      year:       project.year,
      tags:       project.tags,
    },
    after: null,
  });

  revalidatePath('/admin/projects');
  return { error: null };
}

// ── Review ────────────────────────────────────────────────────────────────────

export async function deleteReviewAction(
  id: string
): Promise<{ error: string | null }> {
  const actorEmail = await getActorEmail();
  if (!actorEmail) return { error: 'Not authenticated.' };

  const supabase = await createClient();

  const { data: review } = await supabase
    .from('reviews')
    .select('id, author_name, rating, status, featured, project_slug')
    .eq('id', id)
    .single();

  if (!review) return { error: 'Review not found.' };

  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) return { error: error.message };

  logAudit({
    action:     'review.delete',
    actorEmail,
    entityType: 'review',
    entityId:   id,
    entitySlug: review.project_slug ?? null,
    before: {
      author_name:  review.author_name,
      rating:       review.rating,
      status:       review.status,
      featured:     review.featured,
      project_slug: review.project_slug,
    },
    after: null,
  });

  revalidatePath('/admin/reviews');
  return { error: null };
}
