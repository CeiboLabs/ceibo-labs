import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Providers } from './providers';
import { RouteProgress } from '@/components/ui/RouteProgress';
import { SITE } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'software studio',
    'Uruguay',
    'web development',
    'AI integrations',
    'Next.js',
    'MVP development',
    'software agency',
    'Oriental Labs',
  ],
  authors: [{ name: 'Bruno Jorba' }, { name: 'Emiliano Rodriguez' }],
  creator: 'Oriental Labs',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    creator: SITE.twitterHandle,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE.url,
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Oriental Labs',
  url: SITE.url,
  description: SITE.description,
  logo: `${SITE.url}/api/og`,
  foundingLocation: {
    '@type': 'Place',
    addressCountry: 'UY',
    addressLocality: 'Montevideo',
    name: 'Uruguay',
  },
  areaServed: 'Uruguay',
  founders: [
    {
      '@type': 'Person',
      name: 'Bruno Jorba',
      jobTitle: 'CEO & Co-Founder',
      nationality: 'Uruguayan',
    },
    {
      '@type': 'Person',
      name: 'Emiliano Rodriguez',
      jobTitle: 'CEO & Co-Founder',
      nationality: 'Uruguayan',
    },
  ],
  sameAs: [
    'https://instagram.com/orientallabs',
    'https://twitter.com/orientallabs',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Spanish'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';
  const lang = pathname.startsWith('/es') ? 'es' : 'en';

  return (
    <html lang={lang} suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-navy-950 text-white antialiased">
        <Providers>
          <RouteProgress />
          {children}
        </Providers>
      </body>
    </html>
  );
}
