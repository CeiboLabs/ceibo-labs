'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { useActiveSection } from '@/lib/hooks/useActiveSection';
import { useTranslation } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

const SECTION_IDS = ['hero', 'services', 'projects', 'about', 'testimonials', 'contact'];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const { t, locale } = useTranslation();

  const NAV_LINKS = [
    { label: t.nav.services, href: '#services', hash: true },
    { label: t.nav.projects, href: '#projects', hash: true },
    { label: t.nav.about, href: '#about', hash: true },
    { label: t.nav.contact, href: '#contact', hash: true },
    { label: t.nav.blog, href: `/${locale}/blog`, hash: false },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-navy-950/90 dark:bg-navy-950/90 backdrop-blur-xl border-b border-navy-700/50 shadow-lg'
            : 'bg-transparent'
        )}
      >
        <nav
          aria-label="Main navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          <Link
            href={`/${locale}`}
            onClick={(e) => {
              if (isHomepage) { e.preventDefault(); handleNavClick('#hero'); }
            }}
            aria-label="Ceibo Labs — go to homepage"
            className="flex-shrink-0"
          >
            <Logo />
          </Link>

          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ label, href, hash }) => {
              const id = href.replace('#', '');
              const isActive = hash
                ? isHomepage && activeSection === id
                : pathname.startsWith(href);
              return (
                <li key={href}>
                  {hash ? (
                    <a
                      href={isHomepage ? href : `/${locale}/${href}`}
                      onClick={(e) => {
                        if (isHomepage) { e.preventDefault(); handleNavClick(href); }
                      }}
                      className={cn(
                        'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                        isActive ? 'text-electric-400' : 'text-slate-400 hover:text-white'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-lg bg-electric-400/10 border border-electric-400/20"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className={cn(
                        'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                        isActive ? 'text-electric-400' : 'text-slate-400 hover:text-white'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-lg bg-electric-400/10 border border-electric-400/20"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              href={`/${locale}/formulario`}
              className="hidden sm:inline-flex"
            >
              {t.nav.getInTouch}
            </Button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700/60 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-navy-950/98 backdrop-blur-xl flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-navy-700/50">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-6 flex-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ label, href, hash }, i) => (
                hash ? (
                  <motion.a
                    key={href}
                    href={isHomepage ? href : `/${href}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={(e) => {
                      if (isHomepage) { e.preventDefault(); handleNavClick(href); }
                      setMobileOpen(false);
                    }}
                    className="flex items-center px-4 py-4 text-lg font-medium text-slate-300 hover:text-white rounded-xl hover:bg-navy-800/60 transition-colors border border-transparent hover:border-navy-600/40"
                  >
                    {label}
                  </motion.a>
                ) : (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-4 text-lg font-medium text-slate-300 hover:text-white rounded-xl hover:bg-navy-800/60 transition-colors border border-transparent hover:border-navy-600/40"
                    >
                      {label}
                    </Link>
                  </motion.div>
                )
              ))}

              <div className="mt-auto pt-6 border-t border-navy-700/50 flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  href={`/${locale}/formulario`}
                  className="w-full justify-center"
                >
                  {t.nav.getInTouch}
                </Button>
                <div className="flex justify-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
