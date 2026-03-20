'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  function toggle() {
    const next = locale === 'en' ? 'es' : 'en';
    // Swap the locale prefix in the current path: /en/blog → /es/blog
    const newPath = pathname.replace(/^\/(en|es)/, `/${next}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${locale === 'en' ? 'Spanish' : 'English'}`}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg',
        'bg-white dark:bg-navy-800/60 border border-black/10 dark:border-navy-600/50',
        'text-slate-500 dark:text-slate-400 hover:text-electric-400 dark:hover:text-electric-400',
        'hover:border-electric-400/40 hover:bg-slate-100 dark:hover:bg-navy-700/60',
        'transition-all duration-200 text-xs font-semibold tracking-wide',
        className
      )}
    >
      {locale === 'en' ? 'EN' : 'ES'}
    </button>
  );
}
