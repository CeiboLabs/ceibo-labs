'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, EyeOff, Upload, X, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { logAuditAction } from '@/app/admin/audit-action';
import { deletePostAction } from '@/app/admin/actions/entities';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface PostData {
  id?: string;
  title: string;
  title_en: string;
  slug: string;
  excerpt: string;
  excerpt_en: string;
  content: string;
  content_en: string;
  tags: string;
  cover_image_url: string;
  cover_image_url_en: string;
  status: 'draft' | 'published';
}

interface InitialPost extends Partial<Omit<PostData, 'tags'>> {
  id?: string;
  tags?: string | string[];
  title_i18n?: Record<string, string> | null;
  excerpt_i18n?: Record<string, string> | null;
  content_i18n?: Record<string, string> | null;
  cover_image_url_i18n?: Record<string, string> | null;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(base: string, currentId?: string): Promise<string> {
  const supabase = createClient();
  let candidate = base;
  let i = 1;
  while (true) {
    const { data } = await supabase.from('posts').select('id').eq('slug', candidate);
    const conflict = data?.find((r) => r.id !== currentId);
    if (!conflict) return candidate;
    candidate = `${base}-${i++}`;
  }
}

interface Props {
  initial?: InitialPost;
}

export function PostEditor({ initial }: Props) {
  const router = useRouter();
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');
  const [form, setForm] = useState<PostData>({
    title: initial?.title_i18n?.es || initial?.title || '',
    title_en: initial?.title_i18n?.en || '',
    slug: initial?.slug ?? '',
    excerpt: initial?.excerpt_i18n?.es || initial?.excerpt || '',
    excerpt_en: initial?.excerpt_i18n?.en || '',
    content: initial?.content_i18n?.es || initial?.content || '',
    content_en: initial?.content_i18n?.en || '',
    tags: Array.isArray(initial?.tags)
      ? (initial.tags as string[]).join(', ')
      : (initial?.tags as string) ?? '',
    cover_image_url: initial?.cover_image_url_i18n?.es || initial?.cover_image_url || '',
    cover_image_url_en: initial?.cover_image_url_i18n?.en || '',
    status: initial?.status ?? 'draft',
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, startDeleteTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const set = (key: keyof PostData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

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

  const handleCoverUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setUploadError(null);
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `covers/${Date.now()}.${ext}`;
      const { error: err } = await supabase.storage
        .from('blog')
        .upload(path, file, { upsert: true });
      if (err) {
        if (err.message.includes('Bucket not found') || err.message.includes('bucket')) {
          setUploadError('Storage bucket "blog" not found. Create it in Supabase → Storage, or paste an image URL below.');
        } else {
          setUploadError(err.message);
        }
      } else {
        const { data } = supabase.storage.from('blog').getPublicUrl(path);
        const field = langTab === 'es' ? 'cover_image_url' : 'cover_image_url_en';
        setForm((f) => ({ ...f, [field]: data.publicUrl }));
      }
      setUploading(false);
    },
    [langTab]
  );

  async function save(targetStatus: 'draft' | 'published') {
    setError(null);
    setSaving(true);

    const finalSlug = await ensureUniqueSlug(form.slug || slugify(form.title), initial?.id);
    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const coverI18n: Record<string, string> = {};
    if (form.cover_image_url) coverI18n.es = form.cover_image_url;
    if (form.cover_image_url_en) coverI18n.en = form.cover_image_url_en;

    const payload = {
      title_i18n: { es: form.title, en: form.title_en },
      slug: finalSlug,
      excerpt_i18n: { es: form.excerpt, en: form.excerpt_en },
      content_i18n: { es: form.content, en: form.content_en },
      tags: tagsArray,
      cover_image_url: form.cover_image_url || null,
      cover_image_url_i18n: coverI18n,
      status: targetStatus,
      published_at:
        targetStatus === 'published' && form.status !== 'published'
          ? new Date().toISOString()
          : targetStatus === 'published'
          ? undefined
          : null,
    };

    const supabase = createClient();

    if (initial?.id) {
      const { error: err } = await supabase.from('posts').update(payload).eq('id', initial.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('posts').insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    const action = !initial?.id ? 'post.create'
      : targetStatus === 'published' ? 'post.publish'
      : 'post.update';
    await logAuditAction({ action, entityType: 'post', entitySlug: finalSlug, metadata: { title: form.title } });

    setSaving(false);
    router.push('/admin');
    router.refresh();
  }

  const activeTitle = langTab === 'es' ? form.title : form.title_en;
  const activeContent = langTab === 'es' ? form.content : form.content_en;

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl bg-navy-800/60 border border-navy-600/50 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-electric-400/50 focus:ring-1 focus:ring-electric-400/30 transition-colors';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">
          {initial?.id ? 'Edit post' : 'New post'}
        </h1>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-navy-600/50 hover:border-slate-500 transition-colors"
        >
          {preview ? <EyeOff size={14} /> : <Eye size={14} />}
          {preview ? 'Edit' : 'Preview'}
        </button>
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

      {preview ? (
        <div className="prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-electric-400 prose-code:text-electric-400 prose-code:bg-navy-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-navy-800/80 prose-pre:border prose-pre:border-navy-600/40 prose-blockquote:border-l-electric-400 prose-li:text-slate-300 prose-strong:text-white prose-hr:border-navy-700/50">
          <h1>{activeTitle || 'Untitled'}</h1>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeContent}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Title {langTab === 'es' && <span className="text-red-400">*</span>}
            </label>
            <input
              value={langTab === 'es' ? form.title : form.title_en}
              onChange={handleTitleChange}
              placeholder={langTab === 'es' ? 'Post title (Spanish)' : 'Post title (English)'}
              className={inputClass}
            />
          </div>

          {/* Slug — ES tab only */}
          {langTab === 'es' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug <span className="text-red-400">*</span></label>
              <input
                value={form.slug}
                onChange={set('slug')}
                placeholder="post-slug"
                className={`${inputClass} font-mono`}
              />
            </div>
          )}

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Excerpt</label>
            <textarea
              value={langTab === 'es' ? form.excerpt : form.excerpt_en}
              onChange={set(langTab === 'es' ? 'excerpt' : 'excerpt_en')}
              rows={2}
              placeholder={langTab === 'es' ? 'One-sentence summary (Spanish)' : 'One-sentence summary (English)'}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Tags — ES tab only */}
          {langTab === 'es' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Tags <span className="text-slate-500 font-normal">(comma-separated)</span>
              </label>
              <input
                value={form.tags}
                onChange={set('tags')}
                placeholder="Next.js, AI, Engineering"
                className={inputClass}
              />
            </div>
          )}

          {/* Cover image — per language */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Cover image {langTab === 'es' && <span className="text-slate-500 font-normal">(recommended)</span>}
              </label>
              {langTab === 'en' && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, cover_image_url_en: f.cover_image_url }))}
                  className="text-xs text-electric-400 hover:text-electric-300 transition-colors"
                >
                  Copy ES cover to EN
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer px-3.5 py-2 rounded-xl bg-navy-800/60 border border-navy-600/50 text-slate-400 hover:text-white text-sm transition-colors hover:border-slate-500">
                <Upload size={14} />
                {uploading ? 'Uploading…' : 'Upload image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="sr-only"
                  disabled={uploading}
                />
              </label>
              {(langTab === 'es' ? form.cover_image_url : form.cover_image_url_en) && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs truncate max-w-xs">
                    {(langTab === 'es' ? form.cover_image_url : form.cover_image_url_en).split('/').pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm((f) => langTab === 'es'
                      ? { ...f, cover_image_url: '' }
                      : { ...f, cover_image_url_en: '' }
                    )}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
            {uploadError && <p className="mt-2 text-amber-400 text-xs">{uploadError}</p>}
            <input
              value={langTab === 'es' ? form.cover_image_url : form.cover_image_url_en}
              onChange={set(langTab === 'es' ? 'cover_image_url' : 'cover_image_url_en')}
              placeholder="Or paste an image URL"
              className={`mt-2 ${inputClass}`}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Content <span className="text-slate-500 font-normal">(Markdown)</span>
              {langTab === 'es' && <span className="text-red-400"> *</span>}
            </label>
            <textarea
              value={langTab === 'es' ? form.content : form.content_en}
              onChange={set(langTab === 'es' ? 'content' : 'content_en')}
              rows={20}
              placeholder={langTab === 'es' ? '# Título\n\nEscribí aquí…' : '# Post title\n\nWrite here…'}
              className={`${inputClass} font-mono leading-relaxed resize-y`}
            />
          </div>

          {/* OG Preview */}
          {(langTab === 'es' ? form.title : form.title_en) && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                OG Preview <span className="text-slate-500 font-normal">(how it looks when shared)</span>
              </label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/og?type=blog&title=${encodeURIComponent(langTab === 'es' ? form.title : (form.title_en || form.title))}&subtitle=${encodeURIComponent(langTab === 'es' ? form.excerpt : (form.excerpt_en || form.excerpt))}`}
                alt="OG preview"
                className="w-full rounded-xl border border-navy-600/50"
                style={{ aspectRatio: '1200/630' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-navy-700/40 flex-wrap">
        {form.status === 'published' ? (
          <>
            <button
              type="button"
              onClick={() => save('published')}
              disabled={saving || !form.title || !form.content}
              className="px-5 py-2.5 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={() => save('draft')}
              disabled={saving || !form.title}
              className="px-5 py-2.5 rounded-xl bg-navy-800/80 border border-navy-600/50 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volver a borrador
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => save('draft')}
              disabled={saving || !form.title}
              className="px-5 py-2.5 rounded-xl bg-navy-800/80 border border-navy-600/50 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={() => save('published')}
              disabled={saving || !form.title || !form.content}
              className="px-5 py-2.5 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </>
        )}
        {initial?.id && (
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="px-5 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/8 text-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm transition-colors ml-auto"
        >
          Cancel
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete post?"
        description="This action cannot be undone."
        loading={deleting}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          if (!initial?.id) return;
          startDeleteTransition(async () => {
            const { error: err } = await deletePostAction(initial.id!);
            if (!err) {
              router.push('/admin');
              router.refresh();
            }
          });
        }}
      />
    </div>
  );
}
