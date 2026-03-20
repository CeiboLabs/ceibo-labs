'use server';

import { createClient } from '@/lib/supabase/server';
import { invalidateSettingsCache } from '@/lib/settings';
import { logAudit } from '@/lib/audit';

export async function saveSettingsAction(
  _prev: { error: string | null; ok: boolean },
  formData: FormData
): Promise<{ error: string | null; ok: boolean }> {
  const supabase = await createClient();

  // getSession reads from cookie without a network call (middleware already verified the JWT)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { error: 'Not authenticated.', ok: false };

  const maintenanceMsgEs = (formData.get('maintenance_message_es') as string) || '';
  const maintenanceMsgEn = (formData.get('maintenance_message_en') as string) || '';
  const bannerTextEs = (formData.get('banner_text_es') as string) || '';
  const bannerTextEn = (formData.get('banner_text_en') as string) || '';
  const bannerTitleEs = (formData.get('banner_title_es') as string) || '';
  const bannerTitleEn = (formData.get('banner_title_en') as string) || '';
  const bannerSubtitleEs = (formData.get('banner_subtitle_es') as string) || '';
  const bannerSubtitleEn = (formData.get('banner_subtitle_en') as string) || '';
  const bannerImageFile = formData.get('banner_image') as File | null;
  const bannerImageRemove = formData.get('banner_image_remove') === '1';

  // Current image URL comes from the form (hidden field) — avoids an extra SELECT query
  let bannerImageUrl: string | null = (formData.get('banner_image_url_current') as string) || null;

  // Handle image upload/removal
  if (bannerImageRemove) {
    if (bannerImageUrl) {
      const oldPath = bannerImageUrl.split('/banner-images/')[1];
      if (oldPath) supabase.storage.from('banner-images').remove([oldPath]);
    }
    bannerImageUrl = null;
  } else if (bannerImageFile && bannerImageFile.size > 0) {
    if (bannerImageUrl) {
      const oldPath = bannerImageUrl.split('/banner-images/')[1];
      if (oldPath) supabase.storage.from('banner-images').remove([oldPath]);
    }
    const ext = bannerImageFile.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('banner-images')
      .upload(fileName, bannerImageFile, { upsert: false });

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('banner-images').getPublicUrl(fileName);
      bannerImageUrl = urlData.publicUrl;
    }
  }

  const payload = {
    id: 1,
    maintenance_enabled: formData.get('maintenance_enabled') === 'on',
    maintenance_message_i18n: { es: maintenanceMsgEs, en: maintenanceMsgEn },
    banner_enabled: formData.get('banner_enabled') === 'on',
    banner_text_i18n: { es: bannerTextEs, en: bannerTextEn },
    banner_title_i18n: { es: bannerTitleEs, en: bannerTitleEn },
    banner_subtitle_i18n: { es: bannerSubtitleEs, en: bannerSubtitleEn },
    banner_link_url: (formData.get('banner_link_url') as string) || null,
    banner_image_url: bannerImageUrl,
    taking_clients: formData.get('taking_clients') === 'on',
    home_projects_limit: Math.max(1, parseInt(formData.get('home_projects_limit') as string) || 6),
    home_reviews_limit: Math.max(1, parseInt(formData.get('home_reviews_limit') as string) || 4),
  };

  const { error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'id' });

  if (error) return { error: error.message, ok: false };

  invalidateSettingsCache();

  logAudit({
    action:     'settings.update',
    actorEmail: session.user.email ?? 'unknown',
    entityType: 'settings',
    metadata:   null,
  });

  return { error: null, ok: true };
}
