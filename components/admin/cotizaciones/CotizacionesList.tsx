'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Settings, Eye, Pencil, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Cotizacion, EstadoCotizacion } from '@/types/cotizacion';

const ESTADO_STYLES: Record<EstadoCotizacion, string> = {
  borrador:  'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400',
  enviada:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  aceptada:  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  rechazada: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
};

const ESTADO_LABELS: Record<EstadoCotizacion, string> = {
  borrador: 'Borrador', enviada: 'Enviada', aceptada: 'Aceptada', rechazada: 'Rechazada',
};

const ESTADOS: EstadoCotizacion[] = ['borrador', 'enviada', 'aceptada', 'rechazada'];

function fmtMoney(n: number, moneda: string) {
  if (moneda === 'UYU') return '$U ' + Math.round(n).toLocaleString('es-UY');
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Fixed-position dropdown (avoids table overflow clipping) ──────────────────
function RowMenu({
  cotizacion,
  onEstado,
  onDuplicate,
  onDelete,
  disabled,
}: {
  cotizacion: Cotizacion;
  onEstado: (id: string, estado: EstadoCotizacion) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); openMenu(); }}
        className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
        title="Más opciones"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div
          style={menuStyle}
          className="z-[100] w-48 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl shadow-xl overflow-hidden py-1"
          onClick={e => e.stopPropagation()}
        >
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Cambiar estado
          </p>
          {ESTADOS.filter(e => e !== cotizacion.estado).map(e => (
            <button
              key={e}
              onClick={() => { onEstado(cotizacion.id, e); setOpen(false); }}
              disabled={disabled}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
            >
              Marcar como {ESTADO_LABELS[e].toLowerCase()}
            </button>
          ))}
          <div className="border-t border-slate-100 dark:border-navy-700 my-1" />
          <button
            onClick={() => { onDuplicate(cotizacion.id); setOpen(false); }}
            disabled={disabled}
            className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors flex items-center gap-2"
          >
            <Copy size={12} /> Duplicar
          </button>
          <button
            onClick={() => { onDelete(cotizacion.id); setOpen(false); }}
            disabled={disabled}
            className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      )}
    </>
  );
}

// ── Confirm delete modal ──────────────────────────────────────────────────────
function DeleteModal({
  nombre,
  onConfirm,
  onCancel,
}: {
  nombre: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Eliminar cotización</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          ¿Eliminar la cotización de <span className="font-medium text-slate-700 dark:text-slate-200">{nombre || 'este cliente'}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main list ─────────────────────────────────────────────────────────────────
interface Props {
  initialData: Cotizacion[];
}

export function CotizacionesList({ initialData }: Props) {
  const router = useRouter();
  const [items,      setItems]      = useState<Cotizacion[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Cotizacion | null>(null);

  const handleEstado = (id: string, estado: EstadoCotizacion) => {
    startTransition(async () => {
      await fetch(`/api/cotizaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      setItems(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/cotizaciones/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.id) router.push(`/admin/cotizaciones/${data.id}/editar`);
    });
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setConfirmDelete(null);
    setDeletingId(id);
    startTransition(async () => {
      const res = await fetch(`/api/cotizaciones/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) setItems(prev => prev.filter(c => c.id !== id));
      setDeletingId(null);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Cotizaciones</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {items.length} cotización{items.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/configuracion"
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            <Settings size={14} />
            Configuración
          </Link>
          <Link
            href="/admin/cotizaciones/nueva"
            className="flex items-center gap-1.5 text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 rounded-lg px-3 py-2 font-medium transition-colors"
          >
            <Plus size={14} />
            Nueva cotización
          </Link>
        </div>
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <div className="text-center py-20 text-slate-400 dark:text-slate-600">
          <p className="text-base font-medium">Todavía no hay cotizaciones</p>
          <p className="text-sm mt-1">Creá la primera usando el asistente</p>
          <Link
            href="/admin/cotizaciones/nueva"
            className="inline-flex items-center gap-1.5 mt-4 text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg px-4 py-2"
          >
            <Plus size={14} /> Nueva cotización
          </Link>
        </div>
      )}

      {/* ── Table ── */}
      {items.length > 0 && (
        <div className="border border-slate-200 dark:border-navy-700/50 rounded-xl bg-white dark:bg-navy-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-700/50 bg-slate-50 dark:bg-navy-800/60">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide rounded-tl-xl">N°</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide hidden md:table-cell">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide hidden lg:table-cell">Fecha</th>
                <th className="px-4 py-3 w-28 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {items.map((c, idx) => (
                <tr
                  key={c.id}
                  className={cn(
                    'group hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors',
                    deletingId === c.id && 'opacity-40',
                    idx === items.length - 1 && 'last-row'
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {c.numero}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100 leading-tight">
                      {c.cliente_nombre || '—'}
                    </p>
                    {c.cliente_contacto && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.cliente_contacto}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', ESTADO_STYLES[c.estado])}>
                      {ESTADO_LABELS[c.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    {fmtMoney(c.total, c.moneda)}{' '}
                    <span className="text-xs font-normal text-slate-400">{c.moneda}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-xs hidden lg:table-cell whitespace-nowrap">
                    {fmtDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/q/${c.id}`}
                        target="_blank"
                        title="Ver pública"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/cotizaciones/${c.id}/editar`}
                        title="Editar"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <RowMenu
                        cotizacion={c}
                        onEstado={handleEstado}
                        onDuplicate={handleDuplicate}
                        onDelete={id => {
                          const target = items.find(i => i.id === id);
                          if (target) setConfirmDelete(target);
                        }}
                        disabled={isPending}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {confirmDelete && (
        <DeleteModal
          nombre={confirmDelete.cliente_nombre}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
