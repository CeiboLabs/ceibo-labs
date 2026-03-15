import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalBanner } from '@/components/ui/GlobalBanner';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { getSiteSettings } from '@/lib/settings';
import { pickI18n } from '@/lib/i18n-content';
import type { Locale } from '@/lib/i18n/translations';

async function BannerLoader({ locale }: { locale: string }) {
  const settings = await getSiteSettings();
  const bannerText = settings.banner_text_i18n
    ? pickI18n(settings.banner_text_i18n, locale as Locale)
    : settings.banner_text;

  if (!settings.banner_enabled || !bannerText) return null;

  const bannerTitle = settings.banner_title_i18n
    ? pickI18n(settings.banner_title_i18n, locale as Locale)
    : null;

  const bannerSubtitle = settings.banner_subtitle_i18n
    ? pickI18n(settings.banner_subtitle_i18n, locale as Locale)
    : null;

  return (
    <GlobalBanner
      text={bannerText}
      linkUrl={settings.banner_link_url ?? undefined}
      imageUrl={settings.banner_image_url ?? undefined}
      title={bannerTitle}
      subtitle={bannerSubtitle}
      locale={locale}
    />
  );
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Suspense fallback={null}>
        <BannerLoader locale={locale} />
      </Suspense>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
