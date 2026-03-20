import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getSiteSettings } from '@/lib/settings';

// ── Constants ─────────────────────────────────────────────────────────────────
type Locale = 'es' | 'en';
const LOCALES: Locale[] = ['es', 'en'];
const DEFAULT_LOCALE: Locale = 'en';

const ALLOWED_EMAILS = [
  process.env.BRUNO_EMAIL,
  process.env.EMILIANO_EMAIL,
].filter(Boolean) as string[];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract locale prefix from pathname, e.g. '/es/blog' → 'es' */
function getLocaleFromPath(pathname: string): Locale | null {
  const seg = pathname.split('/')[1];
  return LOCALES.includes(seg as Locale) ? (seg as Locale) : null;
}

/** Detect preferred locale from Accept-Language header. */
function detectLocale(request: NextRequest): Locale {
  const al = request.headers.get('accept-language') ?? '';
  return al.toLowerCase().startsWith('es') ||
    al.toLowerCase().includes(',es') ||
    al.toLowerCase().includes(';es')
    ? 'es'
    : DEFAULT_LOCALE;
}

/** Paths that skip both locale-redirect and maintenance (except the locale-redirect guard). */
function isSkippedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  );
}

// ── Main middleware ───────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Admin route protection ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const { supabaseResponse, user } = await updateSession(request);

    if (pathname === '/admin/login') {
      if (user && ALLOWED_EMAILS.includes(user.email ?? '')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return supabaseResponse;
    }

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (!ALLOWED_EMAILS.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }
    return supabaseResponse;
  }

  // ── 2. Skip static / API routes ────────────────────────────────────────────
  if (isSkippedPath(pathname)) {
    return NextResponse.next();
  }

  // ── 3. Locale detection & redirect ─────────────────────────────────────────
  const localeInPath = getLocaleFromPath(pathname);

  if (!localeInPath) {
    // No locale prefix — redirect to localized path
    const locale = detectLocale(request);
    const redirectUrl = new URL(request.url);
    // Redirect "/" → "/es" or "/en"
    redirectUrl.pathname = pathname === '/'
      ? `/${locale}`
      : `/${locale}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  // Path already has a valid locale prefix — proceed to maintenance check
  const locale = localeInPath;
  const adminCookie = request.cookies.get('cl_admin')?.value;

  // ── 4. Maintenance mode ────────────────────────────────────────────────────
  try {
    const settings = await getSiteSettings();
    const isMaintenancePath = pathname === `/${locale}/maintenance`;

    if (isMaintenancePath) {
      // If maintenance is OFF → send to homepage
      if (!settings.maintenance_enabled) {
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }
      // Maintenance is ON → let them see the maintenance page
      return NextResponse.next();
    }

    // Admins bypass maintenance
    if (adminCookie !== '1' && settings.maintenance_enabled) {
      return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
    }
  } catch {
    // Fail open — never block the site due to a settings error
  }

  const res = NextResponse.next();
  res.headers.set('x-pathname', pathname);
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest|txt|xml)$).*)',
  ],
};
