'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { PenLine, Trash2, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { deletePostAction } from '@/app/admin/actions/entities';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface Post {
  id: string;
  slug: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  title_i18n: Record<string, string> | null;
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      status === 'published'
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    )}>
      {status}
    </span>
  );
}

export function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, startDeleteTransition] = useTransition();
  const [draftTarget, setDraftTarget] = useState<Post | null>(null);
  const [drafting, startDraftTransition] = useTransition();

  const fetchPosts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select('id, slug, status, published_at, updated_at, title_i18n')
      .order('updated_at', { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function toggleStatus(post: Post) {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const supabase = createClient();
    const { error } = await supabase
      .from('posts')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', post.id);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }
            : p
        )
      );
    }
  }

  function handleDraft() {
    if (!draftTarget) return;
    startDraftTransition(async () => {
      await toggleStatus(draftTarget);
      setDraftTarget(null);
    });
  }

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      const { error } = await deletePostAction(id);
      if (!error) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setDeleteTarget(null);
      }
    });
  }

  const actionButtons = (post: Post) => (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/es/${post.status === 'published' ? 'blog' : 'blog'}/${post.slug}${post.status === 'draft' ? '?preview=1' : ''}`}
        target="_blank"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors"
        title={post.status === 'published' ? 'View live' : 'Preview draft'}
      >
        <ExternalLink size={14} />
      </Link>
      <button
        onClick={() => setDraftTarget(post)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors"
        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
      >
        {post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <Link
        href={`/admin/edit/${post.id}`}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors"
        title="Edit"
      >
        <PenLine size={14} />
      </Link>
      <button
        onClick={() => setDeleteTarget(post.id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-colors"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Posts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {loading ? 'Loading…' : `${posts.length} post${posts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); startTransition(() => { fetchPosts(); }); }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700/60 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <Link
            href="/admin/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 font-semibold text-sm transition-colors"
          >
            <PenLine size={14} />
            New post
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-navy-700/40 overflow-hidden">
          <div className="divide-y divide-slate-200 dark:divide-navy-700/30 bg-white dark:bg-transparent">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-navy-700/60 rounded w-48 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-navy-700/40 rounded w-32" />
              </div>
            ))}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No posts yet.{' '}
          <Link href="/admin/new" className="text-electric-400 hover:underline">Create one</Link>.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-navy-700/40 overflow-hidden">
          {/* Desktop table */}
          <table className="w-full hidden md:table">
            <thead className="bg-slate-100 dark:bg-navy-900/60 border-b border-slate-200 dark:border-navy-700/40">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">Updated</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">Published</th>
                <th className="px-4 py-3 w-36" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-700/30 bg-white dark:bg-transparent">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-slate-900 dark:text-white font-medium text-sm leading-snug line-clamp-1">
                      {post.title_i18n?.es || post.title_i18n?.en || post.slug}
                    </span>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-mono">{post.slug}</p>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={post.status} /></td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-sm">{formatDate(post.updated_at)}</td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-sm">{formatDate(post.published_at)}</td>
                  <td className="px-4 py-4">{actionButtons(post)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-navy-700/30 bg-white dark:bg-transparent">
            {posts.map((post) => (
              <div key={post.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {post.title_i18n?.es || post.title_i18n?.en || post.slug}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{post.slug}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-slate-400">{formatDate(post.updated_at)}</span>
                    </div>
                  </div>
                  {actionButtons(post)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={draftTarget !== null}
        title={draftTarget?.status === 'published' ? 'Unpublish post?' : 'Publish post?'}
        description={draftTarget?.status === 'published'
          ? `"${draftTarget?.title_i18n?.es || draftTarget?.title_i18n?.en || draftTarget?.slug}" will be moved to draft and won't be visible to visitors.`
          : `"${draftTarget?.title_i18n?.es || draftTarget?.title_i18n?.en || draftTarget?.slug}" will be published and visible to all visitors.`}
        confirmLabel={draftTarget?.status === 'published' ? 'Unpublish' : 'Publish'}
        confirmVariant={draftTarget?.status === 'published' ? 'warning' : 'primary'}
        loading={drafting}
        loadingLabel={draftTarget?.status === 'published' ? 'Unpublishing…' : 'Publishing…'}
        onCancel={() => setDraftTarget(null)}
        onConfirm={handleDraft}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete post?"
        description="This action cannot be undone."
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
