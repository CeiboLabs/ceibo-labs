import type { Locale } from '@/lib/i18n/translations';

/** A JSONB field storing one string per locale, e.g. { es: "Hola", en: "Hello" } */
export type I18nField = Partial<Record<Locale, string>>;

/** A JSONB field storing one string[] per locale, e.g. { es: ["a", "b"], en: ["c", "d"] } */
export type I18nArrayField = Partial<Record<Locale, string[]>>;

/**
 * Pick the best string from an i18n JSONB field.
 * Priority: requested locale → 'es' → 'en' → ''
 */
export function pickI18n(
  field: I18nField | null | undefined,
  locale: Locale
): string {
  if (!field) return '';
  return field[locale] ?? field['es'] ?? field['en'] ?? '';
}

/**
 * Pick the best string[] from an i18n JSONB array field.
 * Priority: requested locale → 'es' → 'en' → []
 */
export function pickI18nArray(
  field: I18nArrayField | null | undefined,
  locale: Locale
): string[] {
  if (!field) return [];
  return field[locale] ?? field['es'] ?? field['en'] ?? [];
}

/** Returns true if the given locale key is non-empty in this i18n field. */
export function hasI18n(
  field: I18nField | null | undefined,
  locale: Locale
): boolean {
  return !!field?.[locale];
}

/**
 * Pick the best media URL (image, etc.) from an i18n JSONB field.
 * Priority: requested locale → 'es' → 'en' → ''
 * Identical to pickI18n but named explicitly for media fields for clarity.
 */
export function pickI18nMedia(
  field: I18nField | null | undefined,
  locale: Locale
): string {
  if (!field) return '';
  return field[locale] ?? field['es'] ?? field['en'] ?? '';
}
