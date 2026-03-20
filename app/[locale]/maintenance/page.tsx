import { MessageCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { getSiteSettings } from '@/lib/settings';
import { pickI18n } from '@/lib/i18n-content';
import { CONTACT } from '@/lib/constants';
import type { Locale } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === 'es' ? 'Mantenimiento — Ceibo Labs' : 'Maintenance — Ceibo Labs',
    robots: { index: false, follow: false },
  };
}

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSiteSettings();

  const message =
    pickI18n(settings.maintenance_message_i18n, locale as Locale) ||
    settings.maintenance_message ||
    (locale === 'es'
      ? 'Estamos haciendo mejoras. Volvemos pronto.'
      : "We're currently doing some upgrades. We'll be back online shortly.");

  const whatsappUrl = CONTACT.whatsappUrl;

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(126,217,182,0.08) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-electric-500/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-400/30 bg-amber-400/8 text-amber-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            {locale === 'es' ? 'Modo mantenimiento' : 'Maintenance mode'}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {locale === 'es' ? 'Volvemos pronto.' : 'Back soon.'}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">{message}</p>
        </div>

        <a
          href={`${whatsappUrl}?text=${encodeURIComponent(
            locale === 'es'
              ? 'Hola, intenté visitar Ceibo Labs pero está en mantenimiento.'
              : 'Hi! I tried to visit Ceibo Labs but the site is under maintenance.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 font-semibold text-sm transition-colors"
        >
          <MessageCircle size={16} />
          {locale === 'es' ? 'Contáctanos por WhatsApp' : 'Contact us on WhatsApp'}
        </a>
      </div>
    </div>
  );
}
