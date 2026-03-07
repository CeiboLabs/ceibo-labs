'use client';

import { useState, useMemo, useTransition } from 'react';
import { Search, Trash2, ChevronRight, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { clearLogsAction } from '@/app/admin/logs/actions';

export interface AuditLog {
  id: string;
  action: string;
  actor_email: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_slug: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ACTION_STYLES: Record<string, string> = {
  'settings.update':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'post.create':       'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'post.publish':      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'post.update':       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'post.unpublish':    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'post.delete':       'bg-red-500/10 text-red-400 border-red-500/20',
  'project.create':    'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'project.publish':   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'project.update':    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'project.unpublish': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'project.delete':    'bg-red-500/10 text-red-400 border-red-500/20',
  'review.create':     'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'review.publish':    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'review.update':     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'review.unpublish':  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'review.delete':     'bg-red-500/10 text-red-400 border-red-500/20',
  'logs.clear':        'bg-red-500/10 text-red-400 border-red-500/20',
};
const DEFAULT_STYLE = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

const FIELD_LABELS: Record<string, string> = {
  maintenance_enabled:  'Maintenance',
  maintenance_message:  'Maintenance message',
  maintenance_message_i18n: 'Maintenance message',
  banner_enabled:       'Banner',
  banner_text:          'Banner text',
  banner_text_i18n:     'Banner text',
  banner_link_url:      'Banner URL',
  taking_clients:       'Taking clients',
  home_projects_limit:  'Projects limit',
  home_reviews_limit:   'Reviews limit',
};

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'ON' : 'OFF';
  if (typeof v === 'string' && v.length > 40) return v.slice(0, 40) + '…';
  return String(v);
}

function DiffBadge({ label, from, to }: { label: string; from: unknown; to: unknown }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border bg-slate-100 dark:bg-navy-800/60 border-slate-200 dark:border-navy-600/40 text-slate-700 dark:text-slate-300">
      <span className="font-medium">{label}:</span>
      <span className="text-slate-400 line-through">{renderValue(from)}</span>
      <span className="text-electric-400">→</span>
      <span>{renderValue(to)}</span>
    </span>
  );
}

function MetadataSummary({ action, metadata }: { action: string; metadata: AuditLog['metadata'] }) {
  if (!metadata) return <span className="text-slate-500 text-xs italic">—</span>;

  if (action === 'settings.update') {
    const entries = Object.entries(metadata);
    if (entries.length === 0) return <span className="text-slate-500 text-xs italic">no changes</span>;
    const firstVal = entries[0][1];
    if (typeof firstVal === 'object' && firstVal !== null && 'from' in firstVal) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {entries.slice(0, 4).map(([field, change]) => {
            const { from, to } = change as { from: unknown; to: unknown };
            return <DiffBadge key={field} label={FIELD_LABELS[field] ?? field} from={from} to={to} />;
          })}
          {entries.length > 4 && <span className="text-xs text-slate-500">+{entries.length - 4} more</span>}
        </div>
      );
    }
  }

  const title = (metadata.title ?? metadata.slug ?? metadata.name ?? metadata.author) as string | undefined;
  if (title) return <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">&ldquo;{title}&rdquo;</span>;

  return <span className="font-mono text-xs text-slate-500 break-all">{JSON.stringify(metadata)}</span>;
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_STYLES[action] ?? DEFAULT_STYLE}`}>
      {action}
    </span>
  );
}

// ── Log Detail Modal ──────────────────────────────────────────────────────────

function LogDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-navy-700/40 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ActionBadge action={log.action} />
            <span className="text-xs text-slate-400">{formatDate(log.created_at)}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ml-2"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5 text-sm flex-1">
          {/* Actor */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Actor</p>
            <p className="font-mono text-slate-700 dark:text-slate-300">{log.actor_email}</p>
          </div>

          {/* Entity */}
          {(log.entity_type || log.entity_slug || log.entity_id) && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Entity</p>
              <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
                {log.entity_type && (
                  <p><span className="text-slate-400 mr-1">type:</span>{log.entity_type}</p>
                )}
                {log.entity_slug && (
                  <p><span className="text-slate-400 mr-1">slug:</span><span className="font-mono">{log.entity_slug}</span></p>
                )}
                {log.entity_id && (
                  <p><span className="text-slate-400 mr-1">id:</span><span className="font-mono text-xs break-all">{log.entity_id}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Before snapshot */}
          {log.before && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Before</p>
              <pre className="text-xs font-mono bg-slate-100 dark:bg-navy-800/60 rounded-xl p-3 overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all">
                {JSON.stringify(log.before, null, 2)}
              </pre>
            </div>
          )}

          {/* After snapshot */}
          {log.action.endsWith('.delete') && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">After</p>
              <span className="text-red-400 text-xs font-medium">— deleted —</span>
            </div>
          )}

          {/* Metadata / changes */}
          {log.metadata && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {log.action === 'settings.update' ? 'Changes' : 'Metadata'}
              </p>
              <MetadataSummary action={log.action} metadata={log.metadata} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main LogsClient ───────────────────────────────────────────────────────────

export function LogsClient({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, startClearTransition] = useTransition();

  // Unique entity types from data
  const entityTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.entity_type).filter(Boolean) as string[]);
    return ['all', ...Array.from(types).sort()];
  }, [logs]);

  // Filter + search
  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesType =
        entityFilter === 'all' ||
        log.entity_type === entityFilter ||
        log.action.startsWith(entityFilter + '.');

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.actor_email.toLowerCase().includes(q) ||
        (log.entity_slug?.toLowerCase().includes(q) ?? false) ||
        log.action.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [logs, entityFilter, searchQuery]);

  function handleClear() {
    startClearTransition(async () => {
      const { error } = await clearLogsAction();
      if (!error) {
        setLogs([]);
        setShowClearDialog(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-start gap-3 flex-wrap">
        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {entityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setEntityFilter(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                entityFilter === type
                  ? 'bg-electric-400/15 text-electric-400 border-electric-400/30'
                  : 'bg-slate-100 dark:bg-navy-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-navy-700/40 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, slug, email…"
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700/40 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-electric-400/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Clear button */}
        <button
          onClick={() => setShowClearDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/8 text-sm transition-colors border border-red-500/20 hover:border-red-500/40 whitespace-nowrap"
        >
          <Trash2 size={13} />
          Clear all
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">
        {filtered.length === logs.length
          ? `${logs.length} event${logs.length !== 1 ? 's' : ''}`
          : `${filtered.length} of ${logs.length} events`}
        {' · max 50 stored'}
      </p>

      {/* Log list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-navy-700/40 p-10 text-center text-sm text-slate-400">
          {logs.length === 0 ? 'No logs yet.' : 'No matching logs.'}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-navy-700/40 overflow-hidden">
          {/* Desktop table */}
          <table className="w-full text-sm hidden md:table">
            <thead>
              <tr className="bg-slate-100 dark:bg-navy-900/60 border-b border-slate-200 dark:border-navy-700/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-40">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-36">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Summary</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-44">Date</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-700/30">
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-navy-800/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <ActionBadge action={log.action} />
                    <div className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[130px]">
                      {log.actor_email.split('@')[0]}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {log.entity_slug && (
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{log.entity_slug}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <MetadataSummary action={log.action} metadata={log.metadata} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap align-top">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ChevronRight size={14} className="text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-navy-700/30">
            {filtered.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="px-4 py-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-800/30 transition-colors bg-white dark:bg-transparent"
              >
                <div className="flex-1 min-w-0">
                  <ActionBadge action={log.action} />
                  {log.entity_slug && (
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">{log.entity_slug}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(log.created_at)}</p>
                </div>
                <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log detail modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      {/* Clear confirm dialog */}
      <ConfirmDialog
        open={showClearDialog}
        title="Clear all audit logs?"
        description={`This will permanently delete all ${logs.length} entries. A single 'logs.clear' event will be recorded.`}
        confirmLabel="Clear all"
        loading={clearing}
        onCancel={() => setShowClearDialog(false)}
        onConfirm={handleClear}
      />
    </div>
  );
}
