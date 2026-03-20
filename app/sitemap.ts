import { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { createStaticClient } from '@/lib/supabase/server';

const LOCALES = ['es', 'en'] as const;

const altLanguages = (path: string) =>
  Object.fromEntries(LOCALES.map((l) => [l, `${SITE.url}/${l}${path}`]));

export const revalidate = 3600; // revalidate hourly

async function getDynamicRoutes() {
  try {
    const supabase = createStaticClient();
    const [{ data: posts }, { data: projects }] = await Promise.all([
      supabase
        .from('posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false }),
      supabase
        .from('projects')
        .select('slug, updated_at')
        .eq('status', 'published'),
    ]);
    return { posts: posts ?? [], projects: projects ?? [] };
  } catch {
    return { posts: [], projects: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, projects } = await getDynamicRoutes();

  const staticRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => [
    {
      url: `${SITE.url}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
      alternates: { languages: altLanguages('') },
    },
    {
      url: `${SITE.url}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: { languages: altLanguages('/blog') },
    },
    {
      url: `${SITE.url}/${locale}/formulario`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternates: { languages: altLanguages('/formulario') },
    },
  ]);

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).flatMap((post) =>
    LOCALES.map((locale) => ({
      url: `${SITE.url}/${locale}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: { languages: altLanguages(`/blog/${post.slug}`) },
    }))
  );

  const projectRoutes: MetadataRoute.Sitemap = (projects ?? []).flatMap((project) =>
    LOCALES.map((locale) => ({
      url: `${SITE.url}/${locale}/projects/${project.slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: { languages: altLanguages(`/projects/${project.slug}`) },
    }))
  );

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
