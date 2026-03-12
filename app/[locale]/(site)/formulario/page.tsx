import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/translations';
import { SITE } from '@/lib/constants';
import { LanguageProvider } from '@/lib/i18n/context';
import { ContactForm } from '@/components/sections/ContactForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Mail } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === 'es';
  const title = isEs ? 'Formulario de contacto' : 'Contact form';
  const description = isEs
    ? 'Contáctanos para hablar sobre tu proyecto.'
    : 'Get in touch to talk about your project.';

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE.url}/${locale}/formulario`,
      languages: {
        es: `${SITE.url}/es/formulario`,
        en: `${SITE.url}/en/formulario`,
        'x-default': `${SITE.url}/en/formulario`,
      },
    },
  };
}

export default async function FormularioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale === 'es';

  return (
    <LanguageProvider initialLocale={locale as Locale}>
      <Navbar />
      <main className="min-h-screen bg-navy-950 pt-28 pb-24 px-4">
        <div className="max-w-lg mx-auto">

          <div className="flex flex-col items-center text-center mb-10 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-electric-400/10 border border-electric-400/25 flex items-center justify-center">
              <Mail size={22} className="text-electric-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {isEs ? 'Hablemos.' : "Let's talk."}
            </h1>
            <p className="text-slate-400 text-base max-w-sm">
              {isEs
                ? 'Contanos sobre tu proyecto y te respondemos en pocas horas.'
                : "Tell us about your project and we'll get back to you within a few hours."}
            </p>
          </div>

          <ContactForm />
        </div>
      </main>
      <Footer />
    </LanguageProvider>
  );
}
