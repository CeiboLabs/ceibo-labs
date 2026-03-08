import type { I18nField } from '@/lib/i18n-content';

export interface Review {
  id: string;
  author_name: string;
  /** @deprecated Use author_title_i18n instead */
  author_title: string | null;
  author_title_i18n: I18nField | null;
  author_company: string | null;
  author_avatar_url: string | null;
  rating: number;
  quote: string;
  quote_i18n: I18nField | null;
  project_slug: string | null;
  source_url: string | null;
  featured: boolean;
  status: 'draft' | 'published';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type ReviewUpdate = Partial<ReviewInsert>;
