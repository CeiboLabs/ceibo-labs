'use client';

import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useTranslation } from '@/lib/i18n/context';
import { CONTACT, SITE } from '@/lib/constants';

export function Footer() {
  const { t, locale } = useTranslation();

  const SOCIAL_LINKS = [
    { label: 'WhatsApp', href: `${CONTACT.whatsappUrl}?text=${encodeURIComponent(locale === 'es' ? '¡Hola Oriental Labs! Me gustaría hablar sobre un proyecto.' : 'Hi Oriental Labs! I would like to talk about a project.')}`, icon: MessageCircle },
    { label: 'Instagram', href: CONTACT.instagramUrl, icon: Instagram },
    { label: 'Email', href: CONTACT.emailUrl, icon: Mail },
  ];

  const NAV_LINKS = [
    { label: t.nav.services, href: '/#services' },
    { label: t.nav.projects, href: '/#projects' },
    { label: t.nav.about, href: '/#about' },
    { label: t.nav.contact, href: '/#contact' },
    { label: t.nav.blog, href: '/blog' },
  ];

  return (
    <footer aria-label="Site footer" className="relative border-t border-navy-700/50 bg-navy-950">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-electric-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="space-y-3">
            <Logo />
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {SITE.tagline}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              {t.footer.navigate}
            </h3>
            <ul className="space-y-2" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="block py-1 text-sm text-slate-400 hover:text-electric-400 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              {t.footer.getInTouch}
            </h3>
            <ul className="space-y-2" role="list">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    className="flex items-center gap-2 py-1 text-sm text-slate-400 hover:text-electric-400 transition-colors"
                  >
                    <Icon size={14} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-navy-700/50">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Oriental Labs. {t.footer.copyright}
          </p>
          <p className="text-xs text-slate-500">{t.footer.builtIn}</p>
        </div>
      </div>
    </footer>
  );
}
