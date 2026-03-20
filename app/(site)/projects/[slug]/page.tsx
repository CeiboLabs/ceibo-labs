import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ProjectPageContent } from './ProjectPageContent';
import { SITE } from '@/lib/constants';
import { getPublishedProjectBySlug, getProjectBySlugAdmin, getPublishedProjects, getPublishedProjectSlugs } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

const ALLOWED_EMAILS = [
  process.env.BRUNO_EMAIL,
  process.env.EMILIANO_EMAIL,
].filter(Boolean) as string[];

export async function generateStaticParams() {
  const projects = await getPublishedProjectSlugs();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};

  const title = (project.title_i18n as Record<string, string> | null)?.es ?? project.title ?? project.slug;
  const shortDesc = (project.short_description_i18n as Record<string, string> | null)?.es ?? project.short_description ?? '';
  const ogUrl = `/api/og?type=project&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Ceibo Labs')}`;

  return {
    title,
    description: shortDesc,
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description: shortDesc,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE.name}`,
      description: shortDesc,
      images: [ogUrl],
    },
    alternates: { canonical: `${SITE.url}/projects/${slug}` },
  };
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === '1';

  if (isPreview) {
    // Verify admin session before showing draft
    await cookies(); // ensure cookies are readable
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.email && ALLOWED_EMAILS.includes(user.email);

    if (!isAdmin) {
      // Not an admin — fall through to published-only lookup
      const pub = await getPublishedProjectBySlug(slug);
      if (!pub) notFound();
      return <ProjectPageContent project={pub} allProjects={await getPublishedProjects()} />;
    }

    const project = await getProjectBySlugAdmin(slug);
    if (!project) notFound();
    const all = await getPublishedProjects();
    return <ProjectPageContent project={project} allProjects={all} isPreview />;
  }

  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();
  const allProjects = await getPublishedProjects();

  return <ProjectPageContent project={project} allProjects={allProjects} />;
}
