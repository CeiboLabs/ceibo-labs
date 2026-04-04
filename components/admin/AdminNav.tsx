'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText, Star, FolderOpen, Settings, ScrollText,
  ExternalLink, LogOut, Menu, X, FileSpreadsheet,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { logoutAction } from '@/app/admin/actions';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin',                  label: 'Posts',         icon: FileText,       exact: true  },
  { href: '/admin/reviews',          label: 'Reviews',       icon: Star,           exact: false },
  { href: '/admin/projects',         label: 'Projects',      icon: FolderOpen,     exact: false },
  { href: '/admin/cotizaciones',     label: 'Cotizaciones',  icon: FileSpreadsheet,exact: false },
  { href: '/admin/settings',         label: 'Settings',      icon: Settings,       exact: false },
  { href: '/admin/logs',             label: 'Logs',          icon: ScrollText,     exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      <header className="h-14 border-b border-slate-200 dark:border-navy-700/50 bg-white/90 dark:bg-navy-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-slate-400 dark:text-slate-500 text-sm hidden sm:inline">/</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium hidden sm:inline">Admin</span>
          </div>

          {/* Nav — desktop */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-electric-400/12 text-electric-400 border border-electric-400/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800/60'
                  )}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800/60 transition-colors"
            >
              <ExternalLink size={13} />
              <span>Site</span>
            </Link>
            <form action={logoutAction} className="hidden sm:block">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-sm px-2 py-1.5 rounded-lg hover:bg-red-500/8 transition-colors"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </form>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800/60 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-navy-950 border-l border-slate-200 dark:border-navy-700/50 flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-navy-700/50 h-14">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800/60 transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-electric-400/12 text-electric-400 border border-electric-400/25'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800/60'
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="px-3 py-4 border-t border-slate-200 dark:border-navy-700/50 space-y-1">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800/60 transition-colors"
              >
                <ExternalLink size={16} />
                View site
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-500/8 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
