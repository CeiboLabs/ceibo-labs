import type { I18nField } from '@/lib/i18n-content';

export interface SiteSettings {
  id: number;
  maintenance_enabled: boolean;
  maintenance_message: string | null;
  maintenance_message_i18n: I18nField | null;
  banner_enabled: boolean;
  banner_text: string | null;
  banner_text_i18n: I18nField | null;
  banner_link_url: string | null;
  taking_clients: boolean;
  home_projects_limit: number;
  home_reviews_limit: number;
  updated_at: string;
}

/** Fields exposed via the public /api/settings/snapshot endpoint */
export interface SettingsSnapshot {
  maintenance_enabled: boolean;
  maintenance_message_i18n: I18nField | null;
  banner_enabled: boolean;
  banner_text_i18n: I18nField | null;
  banner_link_url: string | null;
  taking_clients: boolean;
  home_projects_limit: number;
  home_reviews_limit: number;
}
