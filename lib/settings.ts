/**
 * Site settings cache — two-layer system:
 *   Layer 1: module-level in-memory cache (TTL = 60s)
 *   Layer 2: Supabase fetch (only when cache is stale)
 *
 * Uses createBrowserClient so this module is safe to import in both
 * Node.js runtime (Server Components / API routes) and Edge runtime (middleware).
 */
import { createBrowserClient } from '@supabase/ssr';
import type { SiteSettings } from '@/types/settings';

// ─── Defaults ────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  maintenance_enabled: false,
  maintenance_message: null,
  maintenance_message_i18n: null,
  banner_enabled: false,
  banner_text: null,
  banner_text_i18n: null,
  banner_link_url: null,
  banner_image_url: null,
  banner_title_i18n: null,
  banner_subtitle_i18n: null,
  taking_clients: true,
  home_projects_limit: 6,
  home_reviews_limit: 4,
  updated_at: new Date().toISOString(),
};

// ─── In-memory cache ─────────────────────────────────────────────────
const CACHE_TTL_MS = 300_000; // 5 minutes

let _cache: { data: SiteSettings; timestamp: number } | null = null;

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Returns site settings. Reads from in-memory cache if fresh,
 * otherwise fetches from Supabase and refreshes the cache.
 * Pass fresh=true to bypass cache (e.g. on the maintenance page).
 * Always returns a valid object — falls back to DEFAULT_SETTINGS on error.
 */
export async function getSiteSettings(fresh = false): Promise<SiteSettings> {
  const now = Date.now();

  if (!fresh && _cache && now - _cache.timestamp < CACHE_TTL_MS) {
    return _cache.data;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return DEFAULT_SETTINGS;
    }

    const settings = data as SiteSettings;
    _cache = { data: settings, timestamp: now };
    return settings;
  } catch {
    // Fail open — never block the site due to a settings fetch failure
    return DEFAULT_SETTINGS;
  }
}

/**
 * Clears the in-memory cache.
 * Call this after saving settings so the next request re-fetches from Supabase.
 */
export function invalidateSettingsCache(): void {
  _cache = null;
}
