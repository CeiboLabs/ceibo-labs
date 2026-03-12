'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Upload, X, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { logAuditAction } from '@/app/admin/audit-action';
import { deleteReviewAction } from '@/app/admin/actions/entities';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { Review } from '@/types/review';

interface FormData {
  author_name: string;
  author_title_es: string;
  author_title_en: string;
  author_company: string;
  rating: number;
  quote: string;
  quote_en: string;
  featured: boolean;
  status: 'draft' | 'published';
  sort_order: number;
  project_slug: string;
  source_url: string;
  author_avatar_url: string;
}

function isValidUrl(val: string) {
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={cn(
              'transition-colors',
              n <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600'
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-slate-400">{value}/5</span>
    </div>
  );
}

interface ProjectOption {
  slug: string;
  title: string;
}

interface Props {
  initial?: Partial<Review>;
  publishedProjects?: ProjectOption[];
}

export function ReviewEditor({ initial, publishedProjects = [] }: Props) {
  const router = useRouter();
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');
  const [form, setForm] = useState<FormData>({
    author_name: initial?.author_name ?? '',
    author_title_es: initial?.author_title_i18n?.es || initial?.author_title || '',
    author_title_en: initial?.author_title_i18n?.en || '',
    author_company: initial?.author_company ?? '',
    rating: initial?.rating ?? 5,
    quote: initial?.quote_i18n?.es || initial?.quote || '',
    quote_en: initial?.quote_i18n?.en || '',
    featured: initial?.featured ?? false,
    status: initial?.status ?? 'published',
    sort_order: initial?.sort_order ?? 0,
    project_slug: initial?.project_slug ?? '',
    source_url: initial?.source_url ?? '',
    author_avatar_url: initial?.author_avatar_url ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, startDeleteTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const set =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
    };

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `avatars/${Date.now()}.${ext}`;
    const { error: err } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (err) {
      if (err.message.includes('Bucket not found') || err.message.includes('bucket')) {
        setUploadError('Storage bucket "avatars" not found. Create it in Supabase → Storage → New bucket → Name: avatars → Public: on. Or paste a URL below.');
      } else {
        setUploadError(err.message);
      }
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setForm((f) => ({ ...f, author_avatar_url: data.publicUrl }));
    }
    setUploading(false);
  }, []);

  const sourceUrlInvalid =
    form.source_url.trim() !== '' && !isValidUrl(form.source_url.trim());

  async function save(targetStatus: 'draft' | 'published') {
    setError(null);

    if (!form.author_name.trim()) {
      setError('Author name is required.');
      return;
    }
    if (!form.quote.trim()) {
      setError('Quote is required.');
      return;
    }
    if (sourceUrlInvalid) {
      setError('Source URL must be a valid URL (e.g. https://linkedin.com/...)');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      author_name: form.author_name.trim(),
      author_title_i18n: { es: form.author_title_es.trim(), en: form.author_title_en.trim() },
      author_company: form.author_company.trim() || null,
      author_avatar_url: form.author_avatar_url.trim() || null,
      rating: form.rating,
      quote_i18n: { es: form.quote.trim(), en: form.quote_en.trim() },
      project_slug: form.project_slug.trim() || null,
      source_url: form.source_url.trim() || null,
      featured: form.featured,
      status: targetStatus,
      sort_order: Number(form.sort_order),
    };

    if (initial?.id) {
      const { error: err } = await supabase
        .from('reviews')
        .update(payload)
        .eq('id', initial.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from('reviews').insert(payload);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    const action = !initial?.id ? 'review.create'
      : targetStatus === 'published' ? 'review.publish'
      : 'review.update';
    await logAuditAction({ action, entityType: 'review', metadata: { author: form.author_name } });

    setSaving(false);
    router.push('/admin/reviews');
    router.refresh();
  }

  function handleDelete() {
    if (!initial?.id) return;
    setShowDeleteDialog(true);
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-navy-800/60 border border-navy-600/50 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-electric-400/50 focus:ring-1 focus:ring-electric-400/30 transition-colors';
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">
          {initial?.id ? 'Edit review' : 'New review'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Language tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-navy-700/50">
        {(['es', 'en'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLangTab(lang)}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
              langTab === lang
                ? 'text-electric-400 border-electric-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
        <span className="ml-2 text-xs text-slate-500">
          {langTab === 'es' ? '— primary language' : '— English translation'}
        </span>
      </div>

      <div className="space-y-5">
        {/* Quote — shown on both tabs */}
        <div>
          <label className={labelClass}>
            Quote {langTab === 'es' && <span className="text-red-400">*</span>}
          </label>
          <textarea
            value={langTab === 'es' ? form.quote : form.quote_en}
            onChange={set(langTab === 'es' ? 'quote' : 'quote_en')}
            rows={4}
            placeholder={langTab === 'es' ? 'Oriental Labs entregó nuestro MVP a tiempo...' : 'Oriental Labs delivered our MVP in record time...'}
            className={cn(inputClass, 'resize-y')}
          />
        </div>

        {/* Author title — shown on both tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass} style={{ marginBottom: 0 }}>
              Author title{langTab === 'es' && <span className="ml-1 text-slate-500 font-normal text-xs">(recommended)</span>}
            </label>
            {langTab === 'en' && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, author_title_en: f.author_title_es }))}
                className="text-xs text-electric-400 hover:text-electric-300 transition-colors"
              >
                Copy ES → EN
              </button>
            )}
          </div>
          <input
            value={langTab === 'es' ? form.author_title_es : form.author_title_en}
            onChange={set(langTab === 'es' ? 'author_title_es' : 'author_title_en')}
            placeholder={langTab === 'es' ? 'Fundador & CEO' : 'Founder & CEO'}
            className={inputClass}
          />
        </div>

        {/* Non-translatable fields — ES tab only */}
        {langTab === 'es' && <>
        {/* Author name */}
        <div>
          <label className={labelClass}>Author name *</label>
          <input
            value={form.author_name}
            onChange={set('author_name')}
            placeholder="Valentina García"
            className={inputClass}
          />
        </div>

        {/* Company */}
        <div>
          <label className={labelClass}>Company</label>
          <input
            value={form.author_company}
            onChange={set('author_company')}
            placeholder="Startup Name"
            className={inputClass}
          />
        </div>

        {/* Rating */}
        <div>
          <label className={labelClass}>Rating *</label>
          <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
        </div>

        {/* Avatar */}
        <div>
          <label className={labelClass}>Avatar</label>
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div className="flex-shrink-0">
              {form.author_avatar_url ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-electric-400/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.author_avatar_url}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-electric-400/10 border-2 border-electric-400/20 flex items-center justify-center">
                  <span className="text-electric-400 text-sm font-bold">
                    {form.author_name
                      ? form.author_name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                      : '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl bg-navy-800/60 border border-navy-600/50 text-slate-400 hover:text-white text-sm transition-colors hover:border-slate-500">
                  <Upload size={14} />
                  {uploading ? 'Uploading…' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="sr-only"
                    disabled={uploading}
                  />
                </label>
                {form.author_avatar_url && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, author_avatar_url: '' }))}
                    className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-xs transition-colors"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
              {uploadError && <p className="text-amber-400 text-xs">{uploadError}</p>}
              <input
                value={form.author_avatar_url}
                onChange={set('author_avatar_url')}
                placeholder="Or paste an image URL"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Project slug */}
        <div>
          <label className={labelClass}>
            Linked project{' '}
            <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          {publishedProjects.length > 0 ? (
            <select
              value={form.project_slug}
              onChange={set('project_slug')}
              className={inputClass}
            >
              <option value="">— None —</option>
              {publishedProjects.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title} ({p.slug})
                </option>
              ))}
            </select>
          ) : (
            <input
              value={form.project_slug}
              onChange={set('project_slug')}
              placeholder="ai-content-assistant"
              className={inputClass}
            />
          )}
        </div>

        {/* Source URL */}
        <div>
          <label className={labelClass}>
            Source URL{' '}
            <span className="text-slate-500 font-normal">(optional — e.g. LinkedIn post)</span>
          </label>
          <input
            value={form.source_url}
            onChange={set('source_url')}
            placeholder="https://linkedin.com/..."
            className={cn(inputClass, sourceUrlInvalid && 'border-red-500/50')}
          />
          {sourceUrlInvalid && (
            <p className="mt-1.5 text-xs text-red-400">Must be a valid URL.</p>
          )}
        </div>

        {/* Featured + Status + Sort order */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Featured</label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full bg-navy-700 peer-checked:bg-electric-400 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-slate-400">Show featured</span>
            </label>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={set('status')}
              className={inputClass}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sort order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={set('sort_order')}
              min={0}
              className={inputClass}
            />
          </div>
        </div>
        </>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-navy-700/40 flex-wrap">
        <button
          type="button"
          onClick={() => save('draft')}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-navy-800/80 border border-navy-600/50 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button
          type="button"
          onClick={() => save('published')}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Publishing…' : 'Publish'}
        </button>
        {initial?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/8 text-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/admin/reviews')}
          className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm transition-colors ml-auto"
        >
          Cancel
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete review?"
        description="This action cannot be undone."
        loading={deleting}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          if (!initial?.id) return;
          startDeleteTransition(async () => {
            const { error: err } = await deleteReviewAction(initial.id!);
            if (!err) {
              router.push('/admin/reviews');
              router.refresh();
            }
          });
        }}
      />
    </div>
  );
}
