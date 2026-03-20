'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Trash2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { logAuditAction } from '@/app/admin/audit-action';
import { deleteProjectAction } from '@/app/admin/actions/entities';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { DbProject, GalleryItem } from '@/types/project';

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(base: string, currentId?: string): Promise<string> {
  const supabase = createClient();
  let candidate = base;
  let i = 1;
  while (true) {
    const { data } = await supabase.from('projects').select('id').eq('slug', candidate);
    const conflict = data?.find((r) => r.id !== currentId);
    if (!conflict) return candidate;
    candidate = `${base}-${i++}`;
  }
}

function isValidUrl(val: string) {
  try { new URL(val); return true; } catch { return false; }
}

interface FormData {
  title: string;
  title_en: string;
  slug: string;
  short_description: string;
  short_description_en: string;
  long_description: string;
  long_description_en: string;
  highlights: string;
  highlights_en: string;
  role: string;
  year: string;
  tags: string;
  live_url: string;
  github_url: string;
  featured: boolean;
  status: 'draft' | 'published';
  sort_order: number;
  cover_image_url: string;
  gallery: GalleryItem[];
}

interface Props { initial?: Partial<DbProject> }

export function ProjectEditor({ initial }: Props) {
  const router = useRouter();
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');
  const [form, setForm] = useState<FormData>({
    title: initial?.title_i18n?.es || initial?.title || '',
    title_en: initial?.title_i18n?.en || '',
    slug: initial?.slug ?? '',
    short_description: initial?.short_description_i18n?.es || initial?.short_description || '',
    short_description_en: initial?.short_description_i18n?.en || '',
    long_description: initial?.long_description_i18n?.es || initial?.long_description || '',
    long_description_en: initial?.long_description_i18n?.en || '',
    highlights: (initial?.highlights_i18n?.es ?? initial?.highlights ?? []).join('\n'),
    highlights_en: (initial?.highlights_i18n?.en ?? []).join('\n'),
    role: initial?.role ?? '',
    year: initial?.year ?? '',
    tags: initial?.tags?.join(', ') ?? '',
    live_url: initial?.live_url ?? '',
    github_url: initial?.github_url ?? '',
    featured: initial?.featured ?? false,
    status: initial?.status ?? 'published',
    sort_order: initial?.sort_order ?? 0,
    cover_image_url: initial?.cover_image_url ?? '',
    gallery: (initial?.gallery as GalleryItem[]) ?? [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ogTitle, setOgTitle] = useState(form.title);

  useEffect(() => {
    const t = setTimeout(() => {
      setOgTitle(langTab === 'es' ? form.title : (form.title_en || form.title));
    }, 800);
    return () => clearTimeout(t);
  }, [form.title, form.title_en, langTab]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, startDeleteTransition] = useTransition();
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (langTab === 'es') {
      const title = e.target.value;
      setForm((f) => ({
        ...f,
        title,
        slug: f.slug === slugify(f.title) ? slugify(title) : f.slug,
      }));
    } else {
      setForm((f) => ({ ...f, title_en: e.target.value }));
    }
  };

  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    setCoverUploadError(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const slug = form.slug || 'project';
    const path = `${slug}/cover-${Date.now()}.${ext}`;
    const { error: err } = await supabase.storage.from('projects').upload(path, file, { upsert: true });
    if (err) {
      if (err.message.includes('Bucket not found') || err.message.includes('bucket')) {
        setCoverUploadError('Storage bucket "projects" not found. Create it in Supabase → Storage → New bucket → Name: projects → Public: on. Or paste a URL below.');
      } else {
        setCoverUploadError(err.message);
      }
    } else {
      const { data } = supabase.storage.from('projects').getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: data.publicUrl }));
    }
    setCoverUploading(false);
  }, [form.slug]);

  const handleGalleryUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const supabase = createClient();
    const slug = form.slug || 'project';
    const newItems: GalleryItem[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${slug}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: err } = await supabase.storage.from('projects').upload(path, file, { upsert: true });
      if (!err) {
        const { data } = supabase.storage.from('projects').getPublicUrl(path);
        newItems.push({ src: data.publicUrl, alt: file.name.replace(/\.[^.]+$/, ''), type: 'image' });
      }
    }
    if (newItems.length) setForm((f) => ({ ...f, gallery: [...f.gallery, ...newItems] }));
    e.target.value = '';
  }, [form.slug]);

  function addGalleryUrl() {
    setForm((f) => ({ ...f, gallery: [...f.gallery, { src: '', alt: '', type: 'image' }] }));
  }

  function updateGalleryItem(idx: number, field: 'src' | 'alt', value: string) {
    setForm((f) => {
      const gallery = [...f.gallery];
      gallery[idx] = { ...gallery[idx], [field]: value };
      return { ...f, gallery };
    });
  }

  function removeGalleryItem(idx: number) {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== idx) }));
  }

  async function save(targetStatus: 'draft' | 'published') {
    setError(null);
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.short_description.trim()) { setError('Short description is required.'); return; }
    if (!form.long_description.trim()) { setError('Long description is required.'); return; }
    if (form.live_url.trim() && !isValidUrl(form.live_url.trim())) { setError('Live URL must be a valid URL.'); return; }
    if (form.github_url.trim() && !isValidUrl(form.github_url.trim())) { setError('GitHub URL must be a valid URL.'); return; }

    setSaving(true);
    const finalSlug = await ensureUniqueSlug(form.slug || slugify(form.title), initial?.id);

    const highlightsEs = form.highlights.split('\n').map((h) => h.trim()).filter(Boolean);
    const highlightsEn = form.highlights_en.split('\n').map((h) => h.trim()).filter(Boolean);

    const payload = {
      title_i18n: { es: form.title.trim(), en: form.title_en.trim() },
      slug: finalSlug,
      short_description_i18n: { es: form.short_description.trim(), en: form.short_description_en.trim() },
      long_description_i18n: { es: form.long_description.trim(), en: form.long_description_en.trim() },
      role: form.role.trim() || null,
      year: form.year.trim() || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      highlights_i18n: { es: highlightsEs, en: highlightsEn },
      live_url: form.live_url.trim() || null,
      github_url: form.github_url.trim() || null,
      featured: form.featured,
      status: targetStatus,
      sort_order: Number(form.sort_order),
      cover_image_url: form.cover_image_url.trim() || null,
      gallery: form.gallery.filter((g) => g.src.trim()),
    };

    const supabase = createClient();
    if (initial?.id) {
      const { error: err } = await supabase.from('projects').update(payload).eq('id', initial.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('projects').insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    const action = !initial?.id ? 'project.create'
      : targetStatus === 'published' ? 'project.publish'
      : 'project.update';
    logAuditAction({ action, entityType: 'project', entitySlug: finalSlug, metadata: { title: form.title } });

    setSaving(false);
    router.push('/admin/projects');
    router.refresh();
  }

  function handleDelete() {
    if (!initial?.id) return;
    setShowDeleteDialog(true);
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl bg-navy-800/60 border border-navy-600/50 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-electric-400/50 focus:ring-1 focus:ring-electric-400/30 transition-colors';
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">
        {initial?.id ? 'Edit project' : 'New project'}
      </h1>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
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

      <div className="space-y-6">
        {/* ── Translatable fields ────────────────────── */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>
              Title {langTab === 'es' && <span className="text-red-400">*</span>}
            </label>
            <input
              value={langTab === 'es' ? form.title : form.title_en}
              onChange={handleTitleChange}
              placeholder={langTab === 'es' ? 'AI Content Assistant (Spanish)' : 'AI Content Assistant (English)'}
              className={inputClass}
            />
          </div>

          {/* Slug — ES tab only */}
          {langTab === 'es' && (
            <div>
              <label className={labelClass}>Slug <span className="text-red-400">*</span></label>
              <input value={form.slug} onChange={set('slug')} placeholder="ai-content-assistant" className={cn(inputClass, 'font-mono')} />
            </div>
          )}

          {/* Short description */}
          <div>
            <label className={labelClass}>
              Short description {langTab === 'es' && <span className="text-red-400">*</span>}{' '}
              <span className="text-slate-500 font-normal">(shown on cards)</span>
            </label>
            <textarea
              value={langTab === 'es' ? form.short_description : form.short_description_en}
              onChange={set(langTab === 'es' ? 'short_description' : 'short_description_en')}
              rows={2}
              placeholder={langTab === 'es' ? 'Una frase sobre el proyecto' : 'One compelling sentence about the project'}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          {/* Long description */}
          <div>
            <label className={labelClass}>
              Long description {langTab === 'es' && <span className="text-red-400">*</span>}{' '}
              <span className="text-slate-500 font-normal">(2–4 paragraphs)</span>
            </label>
            <textarea
              value={langTab === 'es' ? form.long_description : form.long_description_en}
              onChange={set(langTab === 'es' ? 'long_description' : 'long_description_en')}
              rows={8}
              placeholder={langTab === 'es' ? 'Primer párrafo sobre el proyecto…' : 'First paragraph about the project…'}
              className={cn(inputClass, 'resize-y')}
            />
          </div>

          {/* Highlights */}
          <div>
            <label className={labelClass}>
              Highlights <span className="text-slate-500 font-normal">(one per line)</span>
            </label>
            <textarea
              value={langTab === 'es' ? form.highlights : form.highlights_en}
              onChange={set(langTab === 'es' ? 'highlights' : 'highlights_en')}
              rows={4}
              placeholder={langTab === 'es' ? 'Inferencia rápida\nSoporte multilenguaje' : 'Fast inference\nMulti-language support'}
              className={cn(inputClass, 'resize-none')}
            />
          </div>
        </div>

        {/* ── Non-translatable (ES tab only) ─────────── */}
        {langTab === 'es' && (
          <>
            {/* Tags & Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tags <span className="text-slate-500 font-normal">(comma-separated)</span></label>
                <input value={form.tags} onChange={set('tags')} placeholder="AI, Next.js, TypeScript" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Role <span className="text-slate-500 font-normal">(optional)</span></label>
                <input value={form.role} onChange={set('role')} placeholder="Full-stack build" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Year <span className="text-slate-500 font-normal">(optional)</span></label>
                <input value={form.year} onChange={set('year')} placeholder="2024" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Live URL <span className="text-slate-500 font-normal">(optional)</span></label>
                <input value={form.live_url} onChange={set('live_url')} placeholder="https://..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>GitHub URL <span className="text-slate-500 font-normal">(optional)</span></label>
                <input value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/..." className={inputClass} />
              </div>
            </div>

            {/* Status, Featured, Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Featured</label>
                <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                  <div className="relative">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full bg-navy-700 peer-checked:bg-electric-400 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-sm text-slate-400">Show featured</span>
                </label>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={set('status')} className={inputClass}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Sort order</label>
                <input type="number" value={form.sort_order} onChange={set('sort_order')} min={0} className={inputClass} />
              </div>
            </div>

            {/* Cover image */}
            <div>
              <label className={labelClass}>Cover image</label>
              <div className="flex items-start gap-4">
                {form.cover_image_url && (
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-navy-900 border border-navy-600/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl bg-navy-800/60 border border-navy-600/50 text-slate-400 hover:text-white text-sm transition-colors hover:border-slate-500">
                      <Upload size={14} />
                      {coverUploading ? 'Uploading…' : 'Upload cover'}
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" disabled={coverUploading} />
                    </label>
                    {form.cover_image_url && (
                      <button type="button" onClick={() => setForm((f) => ({ ...f, cover_image_url: '' }))}
                        className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-xs transition-colors">
                        <X size={12} /> Remove
                      </button>
                    )}
                  </div>
                  {coverUploadError && <p className="text-amber-400 text-xs">{coverUploadError}</p>}
                  <input value={form.cover_image_url} onChange={set('cover_image_url')} placeholder="Or paste a URL" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <label className={labelClass}>
                Gallery <span className="text-slate-500 font-normal">(2–4 images recommended)</span>
              </label>
              <div className="space-y-3">
                {form.gallery.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={item.src} onChange={(e) => updateGalleryItem(idx, 'src', e.target.value)}
                        placeholder="https://... (image URL)" className={inputClass} />
                      <input value={item.alt} onChange={(e) => updateGalleryItem(idx, 'alt', e.target.value)}
                        placeholder="Alt text description" className={inputClass} />
                    </div>
                    <button type="button" onClick={() => removeGalleryItem(idx)}
                      className="mt-2.5 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl bg-navy-800/60 border border-navy-600/50 text-slate-400 hover:text-white text-sm transition-colors hover:border-slate-500">
                    <Upload size={14} />
                    Upload images
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="sr-only" />
                  </label>
                  <button type="button" onClick={addGalleryUrl}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800/60 border border-navy-600/50 text-slate-400 hover:text-white text-sm transition-colors hover:border-slate-500">
                    <Plus size={14} />
                    Add URL
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* OG Preview */}
        {(langTab === 'es' ? form.title : form.title_en) && (
          <div>
            <label className={labelClass}>
              OG Preview <span className="text-slate-500 font-normal">(how it looks when shared)</span>
            </label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/og?type=project&title=${encodeURIComponent(ogTitle)}&subtitle=${encodeURIComponent('Ceibo Labs')}`}
              alt="OG preview"
              className="w-full rounded-xl border border-navy-600/50"
              style={{ aspectRatio: '1200/630' }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-10 pt-6 border-t border-navy-700/40 flex-wrap">
        <button type="button" onClick={() => save('draft')} disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-navy-800/80 border border-navy-600/50 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Saving…' : 'Save draft'}
        </button>
        <button type="button" onClick={() => save('published')} disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Publishing…' : 'Publish'}
        </button>
        {initial?.id && (
          <>
            <a href={`/es/projects/${initial.slug}?preview=1`} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl border border-navy-600/50 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors">
              Preview
            </a>
            <button type="button" onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/8 text-sm transition-colors flex items-center gap-1.5">
              <Trash2 size={14} />
              Delete
            </button>
          </>
        )}
        <button type="button" onClick={() => router.push('/admin/projects')}
          className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm transition-colors ml-auto">
          Cancel
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete project?"
        description="This action cannot be undone."
        loading={deleting}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          if (!initial?.id) return;
          startDeleteTransition(async () => {
            const { error: err } = await deleteProjectAction(initial.id!);
            if (!err) {
              router.push('/admin/projects');
              router.refresh();
            }
          });
        }}
      />
    </div>
  );
}
