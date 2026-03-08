'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenLine, Trash2, Eye, EyeOff, Star, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { DbProject } from '@/types/project';
import { deleteProjectAction } from '@/app/admin/actions/entities';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

function formatDate(d: string) {
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

export function ProjectsDashboard({ initialProjects }: { initialProjects: DbProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, startDeleteTransition] = useTransition();
  const [statusTarget, setStatusTarget] = useState<DbProject | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function confirmToggleStatus() {
    if (!statusTarget) return;
    const p = statusTarget;
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', p.id);
    if (!error) {
      setProjects((prev) => prev.map((x) => x.id === p.id ? { ...x, status: newStatus as DbProject['status'] } : x));
      setStatusTarget(null);
      startTransition(() => router.refresh());
    }
  }

  async function toggleFeatured(p: DbProject) {
    const newFeatured = !p.featured;
    const { error } = await supabase.from('projects').update({ featured: newFeatured }).eq('id', p.id);
    if (!error) {
      setProjects((prev) => prev.map((x) => x.id === p.id ? { ...x, featured: newFeatured } : x));
    }
  }

  async function updateSortOrder(p: DbProject, value: number) {
    const { error } = await supabase.from('projects').update({ sort_order: value }).eq('id', p.id);
    if (!error) {
      setProjects((prev) => prev.map((x) => x.id === p.id ? { ...x, sort_order: value } : x));
    }
  }

  function handleDelete(id: string) {
    startDeleteTransition(async () => {
      const { error } = await deleteProjectAction(id);
      if (!error) {
        setProjects((prev) => prev.filter((x) => x.id !== id));
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  const getTitle = (p: DbProject) =>
    (p.title_i18n as Record<string, string> | null)?.es || p.title || p.slug;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 font-semibold text-sm transition-colors"
        >
          <PenLine size={14} />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No projects yet.{' '}
          <Link href="/admin/projects/new" className="text-electric-400 hover:underline">Create one</Link>.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-navy-700/40 overflow-hidden">
          {/* Desktop table */}
          <table className="w-full hidden md:table">
            <thead className="bg-slate-100 dark:bg-navy-900/60 border-b border-slate-200 dark:border-navy-700/40">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Featured</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Order</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">Year</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">Updated</th>
                <th className="px-4 py-3 w-40" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-700/30 bg-white dark:bg-transparent">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-slate-900 dark:text-white font-medium text-sm line-clamp-1">{getTitle(p)}</span>
                    <p className="text-slate-500 text-xs mt-0.5 font-mono">{p.slug}</p>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={cn('p-1.5 rounded-lg transition-colors',
                        p.featured ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10' : 'text-slate-500 dark:text-slate-600 hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-700/60'
                      )}
                      title={p.featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star size={14} className={p.featured ? 'fill-yellow-400' : ''} />
                    </button>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <input
                      type="number"
                      defaultValue={p.sort_order}
                      onBlur={(e) => updateSortOrder(p, Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-600/50 text-slate-900 dark:text-white text-xs text-center focus:outline-none focus:border-electric-400/50"
                    />
                  </td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-sm">{p.year ?? '—'}</td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-sm">{formatDate(p.updated_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/es/projects/${p.slug}${p.status === 'draft' ? '?preview=1' : ''}`} target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors" title={p.status === 'published' ? 'View live' : 'Preview'}>
                        <ExternalLink size={14} />
                      </Link>
                      <button onClick={() => setStatusTarget(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors"
                        title={p.status === 'published' ? 'Unpublish' : 'Publish'}>
                        {p.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link href={`/admin/projects/edit/${p.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors" title="Edit">
                        <PenLine size={14} />
                      </Link>
                      <button onClick={() => setDeleteTarget(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-navy-700/30 bg-white dark:bg-transparent">
            {projects.map((p) => (
              <div key={p.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{getTitle(p)}</p>
                      {p.featured && <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{p.slug}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={p.status} />
                      {p.year && <span className="text-xs text-slate-400">{p.year}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href={`/admin/projects/edit/${p.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors">
                      <PenLine size={14} />
                    </Link>
                    <button onClick={() => setStatusTarget(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-700/60 transition-colors">
                      {p.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => setDeleteTarget(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete project?"
        description="This action cannot be undone."
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.status === 'published' ? 'Unpublish project?' : 'Publish project?'}
        description={statusTarget?.status === 'published'
          ? 'This will hide the project from the public site.'
          : 'This will make the project visible on the public site.'}
        onCancel={() => setStatusTarget(null)}
        onConfirm={confirmToggleStatus}
      />
    </div>
  );
}
