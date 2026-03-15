import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/settings';
import type { SettingsSnapshot } from '@/types/settings';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getSiteSettings();

  const snapshot: SettingsSnapshot = {
    maintenance_enabled: s.maintenance_enabled,
    maintenance_message_i18n: s.maintenance_message_i18n ?? null,
    banner_enabled: s.banner_enabled,
    banner_text_i18n: s.banner_text_i18n ?? null,
    banner_link_url: s.banner_link_url,
    banner_image_url: s.banner_image_url,
    banner_title_i18n: s.banner_title_i18n ?? null,
    banner_subtitle_i18n: s.banner_subtitle_i18n ?? null,
    taking_clients: s.taking_clients,
    home_projects_limit: s.home_projects_limit,
    home_reviews_limit: s.home_reviews_limit,
  };

  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
