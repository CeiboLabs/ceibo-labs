'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('w-9 h-9 rounded-lg bg-navy-800/60', className)} />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg',
        'bg-white dark:bg-navy-800/60 border border-black/10 dark:border-navy-600/50',
        'text-slate-500 dark:text-slate-400 hover:text-electric-400 dark:hover:text-electric-400',
        'hover:border-electric-400/40 hover:bg-slate-100 dark:hover:bg-navy-700/60',
        'transition-all duration-200',
        className
      )}
    >
      {theme === 'dark' ? (
        <Sun size={16} aria-hidden />
      ) : (
        <Moon size={16} aria-hidden />
      )}
    </button>
  );
}
