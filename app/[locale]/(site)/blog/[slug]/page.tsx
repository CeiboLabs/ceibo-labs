import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SITE } from '@/lib/constants';
import { pickI18n, pickI18nMedia } from '@/lib/i18n-content';
import { BlogPostContent } from './BlogPostContent';
import type { Locale } from '@/lib/i18n/translations';

const ALLOWED_EMAILS = [process.env.BRUNO_EMAIL, process.env.EMILIANO_EMAIL].filter(Boolean) as string[];

interface Post {
  id: string;
  slug: string;
  tags: string[];
  cover_image_url: string | null;
  cover_image_url_i18n: Record<string, string> | null;
  published_at: string | null;
  status: string;
  title_i18n: Record<string, string> | null;
  excerpt_i18n: Record<string, string> | null;
  content_i18n: Record<string, string> | null;
}

const getPost = cache(async function getPost(slug: string, isPreview = false): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('id, slug, tags, cover_image_url, cover_image_url_i18n, published_at, status, title_i18n, excerpt_i18n, content_i18n')
    .eq('slug', slug)
    .single();

  if (!data) return null;
  if (!isPreview && data.status !== 'published') return null;
  return data as Post;
});

async function getRelatedPosts(currentId: string, tags: string[]): Promise<Post[]> {
  if (tags.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('id, slug, tags, published_at, status, cover_image_url, cover_image_url_i18n, title_i18n, excerpt_i18n, content_i18n')
    .eq('status', 'published')
    .neq('id', currentId)
    .contains('tags', tags.slice(0, 1))
    .order('published_at', { ascending: false })
    .limit(3);
  return (data as Post[]) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = pickI18n(post.title_i18n, locale as Locale);
  const excerpt = pickI18n(post.excerpt_i18n, locale as Locale);
  const localizedCover = pickI18nMedia(post.cover_image_url_i18n, locale as Locale) || post.cover_image_url || '';
  const ogImage = localizedCover
    ? localizedCover
    : `${SITE.url}/api/og?type=blog&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(excerpt)}`;

  return {
    title,
    description: excerpt || undefined,
    alternates: {
      canonical: `${SITE.url}/${locale}/blog/${slug}`,
      languages: { es: `${SITE.url}/es/blog/${slug}`, en: `${SITE.url}/en/blog/${slug}`, 'x-default': `${SITE.url}/en/blog/${slug}` },
    },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description: excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { locale, slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === '1';

  if (isPreview) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ALLOWED_EMAILS.includes(user.email ?? '')) {
      redirect(`/${locale}/blog/${slug}`);
    }
  }

  const post = await getPost(slug, isPreview);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.tags);

  const title = pickI18n(post.title_i18n, locale as Locale);
  const excerpt = pickI18n(post.excerpt_i18n, locale as Locale);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt || undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.published_at ?? undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Ceibo Labs',
      url: SITE.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE.url}/${locale}/blog/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE.url}/${locale}/blog` },
      { '@type': 'ListItem', position: 2, name: title, item: `${SITE.url}/${locale}/blog/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <BlogPostContent post={post} relatedPosts={related} isPreview={isPreview} locale={locale as Locale} />
    </>
  );
}
