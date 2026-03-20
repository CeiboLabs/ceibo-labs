import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getSiteSettings } from '@/lib/settings';
import { MaintenanceBanner } from '@/components/admin/MaintenanceBanner';

export const metadata: Metadata = {
  title: {
    default: 'Admin — Ceibo Labs',
    template: '%s — Admin | Ceibo Labs',
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [settings, cookieStore] = await Promise.all([
    getSiteSettings(),
    cookies(),
  ]);

  const isAdmin = cookieStore.get('cl_admin')?.value === '1';
  const showWarning = settings.maintenance_enabled && isAdmin;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      {showWarning && <MaintenanceBanner />}
      {children}
    </div>
  );
}
