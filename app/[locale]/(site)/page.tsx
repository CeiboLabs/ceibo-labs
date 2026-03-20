import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { TechStack } from '@/components/sections/TechStack';
import { Projects } from '@/components/sections/Projects';
import { About } from '@/components/sections/About';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import { getPublishedReviews } from '@/lib/reviews';
import { getPublishedProjects } from '@/lib/projects';
import { getSiteSettings } from '@/lib/settings';
import { SITE } from '@/lib/constants';
import type { Locale } from '@/lib/i18n/translations';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  const title = isEs
    ? `${SITE.name} — Web, AI & Software en Uruguay`
    : `${SITE.name} — ${SITE.tagline}`;
  const description = isEs
    ? 'Productos de web, AI y software construidos en Uruguay.'
    : SITE.description;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE.url}/${locale}`,
      languages: {
        es: `${SITE.url}/es`,
        en: `${SITE.url}/en`,
        'x-default': `${SITE.url}/en`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${SITE.url}/${locale}`,
      title,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default async function Home() {
  const settings = await getSiteSettings();

  const [dbReviews, dbProjects] = await Promise.all([
    getPublishedReviews(settings.home_reviews_limit),
    getPublishedProjects(settings.home_projects_limit),
  ]);

  return (
    <>
      <Hero takingClients={settings.taking_clients} />
      <Services />
      <TechStack />
      <Projects dbProjects={dbProjects} />
      <About />
      <Testimonials dbReviews={dbReviews} />
      <Contact />
    </>
  );
}
