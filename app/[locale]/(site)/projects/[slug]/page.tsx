import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ProjectPageContent } from './ProjectPageContent';
import { SITE } from '@/lib/constants';
import { pickI18n } from '@/lib/i18n-content';
import {
  getPublishedProjectBySlug,
  getProjectBySlugAdmin,
  getPublishedProjects,
  getPublishedProjectSlugs,
} from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n/translations';

export const revalidate = 60;

const ALLOWED_EMAILS = [process.env.BRUNO_EMAIL, process.env.EMILIANO_EMAIL].filter(Boolean) as string[];

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjectSlugs();
    const locales = ['es', 'en'];
    return locales.flatMap((locale) =>
      projects.map((p) => ({ locale, slug: p.slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};

  const title = pickI18n(project.title_i18n, locale as Locale) || project.title || project.slug;
  const description = pickI18n(project.short_description_i18n, locale as Locale) || project.short_description || '';
  const ogUrl = `${SITE.url}/api/og?type=project&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Ceibo Labs')}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE.url}/${locale}/projects/${slug}`,
      languages: { es: `${SITE.url}/es/projects/${slug}`, en: `${SITE.url}/en/projects/${slug}`, 'x-default': `${SITE.url}/en/projects/${slug}` },
    },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE.name}`,
      description,
      images: [ogUrl],
    },
  };
}

export default async function ProjectPage({
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
    await cookies();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.email && ALLOWED_EMAILS.includes(user.email);

    if (!isAdmin) {
      const pub = await getPublishedProjectBySlug(slug);
      if (!pub) notFound();
      return <ProjectPageContent project={pub} allProjects={await getPublishedProjects()} locale={locale as Locale} />;
    }

    const project = await getProjectBySlugAdmin(slug);
    if (!project) notFound();
    return <ProjectPageContent project={project} allProjects={await getPublishedProjects()} locale={locale as Locale} isPreview />;
  }

  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();
  const allProjects = await getPublishedProjects();

  const title = pickI18n(project.title_i18n, locale as Locale) || project.title || project.slug;
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'es' ? 'Proyectos' : 'Projects', item: `${SITE.url}/${locale}/#projects` },
      { '@type': 'ListItem', position: 2, name: title, item: `${SITE.url}/${locale}/projects/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProjectPageContent project={project} allProjects={allProjects} locale={locale as Locale} />
    </>
  );
}
