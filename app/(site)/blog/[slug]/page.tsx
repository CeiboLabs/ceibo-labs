import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SITE } from '@/lib/constants';
import { BlogPostContent } from './BlogPostContent';

const ALLOWED_EMAILS = [process.env.BRUNO_EMAIL, process.env.EMILIANO_EMAIL].filter(
  Boolean
) as string[];

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  tags: string[];
  cover_image_url: string | null;
  published_at: string | null;
  status: string;
}

async function getPost(slug: string, isPreview = false): Promise<Post | null> {
  const supabase = await createClient();
  const query = supabase
    .from('posts')
    .select('id, title, slug, excerpt, content, tags, cover_image_url, published_at, status')
    .eq('slug', slug)
    .single();

  const { data } = await query;
  if (!data) return null;
  if (!isPreview && data.status !== 'published') return null;
  return data as Post;
}

async function getRelatedPosts(currentId: string, tags: string[]): Promise<Post[]> {
  if (tags.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, tags, published_at, status, content, cover_image_url')
    .eq('status', 'published')
    .neq('id', currentId)
    .contains('tags', tags.slice(0, 1)) // match at least one tag
    .order('published_at', { ascending: false })
    .limit(3);
  return (data as Post[]) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const ogUrl = `/api/og?type=blog&title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.excerpt ?? '')}`;

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: `${post.title} | ${SITE.name}`,
      description: post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${SITE.name}`,
      description: post.excerpt ?? undefined,
      images: [ogUrl],
    },
    alternates: {
      canonical: `${SITE.url}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === '1';

  // Preview requires an authenticated founder session
  if (isPreview) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ALLOWED_EMAILS.includes(user.email ?? '')) {
      redirect(`/blog/${slug}`);
    }
  }

  const post = await getPost(slug, isPreview);
  if (!post) { notFound(); return; }

  const related = await getRelatedPosts(post.id, post.tags);

  return <BlogPostContent post={post} relatedPosts={related} isPreview={isPreview} />;
}
