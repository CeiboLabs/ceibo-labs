'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Loader2, Check, ExternalLink, PenLine } from 'lucide-react';
import Link from 'next/link';
import { QuoteDocument } from '@/components/cotizaciones/QuoteDocument';
import { calcTotals } from '@/lib/cotizaciones/rules';
import { complejidadFromFeatures } from '@/lib/cotizaciones/features';
import type { Cotizacion, QuoteItem, Condiciones, EstadoCotizacion, CatalogoItem, Complejidad } from '@/types/cotizacion';

interface Props {
  cotizacion: Cotizacion;
  empresa: { nombre: string; email: string; rut?: string | null };
  catalogo: CatalogoItem[];
}

const inputCls =
  'w-full border border-slate-200 dark:border-navy-700/60 rounded-lg bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-xs px-2.5 py-1.5 outline-none focus:border-slate-400 dark:focus:border-electric-400 transition-colors font-[inherit]';

const ESTADOS: { value: EstadoCotizacion; label: string }[] = [
  { value: 'borrador',  label: 'Borrador'  },
  { value: 'enviada',   label: 'Enviada'   },
  { value: 'aceptada',  label: 'Aceptada'  },
  { value: 'rechazada', label: 'Rechazada' },
];

const COND_LABELS: Record<keyof Omit<Condiciones, 'show_firmas'>, string> = {
  pago: 'Forma de pago', entrega: 'Plazo de entrega',
  revisiones: 'Revisiones incluidas', soporte: 'Soporte post-entrega',
  ip: 'Propiedad intelectual', respuesta: 'Tiempo de respuesta',
};

let _id = 0;
function uid() { return `item_${++_id}_${Math.random().toString(36).slice(2, 5)}`; }

function fmtMoney(n: number, moneda: string) {
  if (moneda === 'UYU') return '$U ' + Math.round(n).toLocaleString('es-UY');
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1.5 border-b border-slate-100 dark:border-navy-800">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</label>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-slate-800 dark:bg-white' : 'bg-slate-300 dark:bg-navy-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-navy-950 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

// ── Save confirmation modal ────────────────────────────────────────────────────
function ConfirmSaveModal({
  estadoActual,
  estadoNuevo,
  onConfirm,
  onCancel,
  isPending,
}: {
  estadoActual: EstadoCotizacion;
  estadoNuevo: EstadoCotizacion;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const estadoCambia = estadoActual !== estadoNuevo;
  const LABELS: Record<EstadoCotizacion, string> = {
    borrador: 'Borrador', enviada: 'Enviada', aceptada: 'Aceptada', rechazada: 'Rechazada',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Guardar cambios</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Se actualizará la cotización con todos los cambios realizados.
        </p>
        {estadoCambia && (
          <div className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-4 text-amber-700 dark:text-amber-300">
            Estado: <span className="font-medium">{LABELS[estadoActual]}</span> → <span className="font-medium">{LABELS[estadoNuevo]}</span>
          </div>
        )}
        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isPending ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Catalog picker ────────────────────────────────────────────────────────────
function CatalogPicker({
  catalogo,
  currentItems,
  complejidad,
  tarifa,
  onSelect,
  onEmpty,
  onClose,
}: {
  catalogo: CatalogoItem[];
  currentItems: QuoteItem[];
  complejidad: Complejidad;
  tarifa: number;
  onSelect: (item: QuoteItem) => void;
  onEmpty: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const usedNames = new Set(currentItems.map(i => i.svc.toLowerCase().trim()));
  const available = catalogo.filter(c => !usedNames.has(c.nombre.toLowerCase().trim()));

  const getHrs = (c: CatalogoItem) => {
    if (complejidad === 'avanzada') return c.horas_avanzada;
    if (complejidad === 'estandar') return c.horas_estandar;
    return c.horas_basica;
  };

  const handleSelect = (c: CatalogoItem) => {
    const hrs = getHrs(c);
    onSelect({ id: uid(), svc: c.nombre, desc: c.descripcion, hrs, precio: Math.round(hrs * tarifa * 100) / 100 });
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="max-h-60 overflow-y-auto">
        {available.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
            Todos los servicios del catálogo ya están incluidos
          </p>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pt-2.5 pb-1">
              Desde el catálogo
            </p>
            {available.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full flex items-start justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-navy-700/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{c.nombre}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{c.descripcion}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                  {getHrs(c)} h
                </span>
              </button>
            ))}
          </>
        )}
      </div>
      <div className="border-t border-slate-100 dark:border-navy-700 p-2">
        <button
          type="button"
          onClick={() => { onEmpty(); onClose(); }}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700/60 transition-colors"
        >
          <PenLine size={11} /> Ítem personalizado vacío
        </button>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export function CotizacionEditor({ cotizacion, empresa, catalogo }: Props) {
  const [items,          setItems]          = useState<QuoteItem[]>(cotizacion.items);
  const [notas,          setNotas]          = useState(cotizacion.notas);
  const [descuento,      setDescuento]      = useState(cotizacion.descuento);
  const [mult,           setMult]           = useState(cotizacion.mult);
  const [plazo,          setPlazo]          = useState(cotizacion.plazo_estimado);
  const [condiciones,    setCondiciones]    = useState<Condiciones>(cotizacion.condiciones);
  const [clienteNombre,  setClienteNombre]  = useState(cotizacion.cliente_nombre);
  const [clienteContacto,setClienteContacto]= useState(cotizacion.cliente_contacto);
  // Estado is local until saved
  const [estado,         setEstado]         = useState<EstadoCotizacion>(cotizacion.estado);
  const [saved,          setSaved]          = useState(false);
  const [saveError,      setSaveError]      = useState('');
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [showPicker,     setShowPicker]     = useState(false);
  const [isPending,      startTransition]   = useTransition();

  const showFirmas = condiciones.show_firmas ?? false;
  const setShowFirmas = (v: boolean) => setCondiciones(prev => ({ ...prev, show_firmas: v }));

  const complejidad: Complejidad = cotizacion.answers
    ? complejidadFromFeatures(cotizacion.answers.features?.length ?? 0)
    : 'estandar';

  const { subtotal, total } = calcTotals(items, mult, descuento);
  const multPct = Math.round((mult - 1) * 100);

  const preview: Cotizacion = {
    ...cotizacion,
    items, notas, descuento, mult, subtotal, total,
    plazo_estimado: plazo,
    condiciones, cliente_nombre: clienteNombre,
    cliente_contacto: clienteContacto, estado,
  };

  const addEmptyItem = () =>
    setItems(prev => [...prev, { id: uid(), svc: '', desc: '', hrs: 0, precio: 0 }]);

  const addCatalogItem = (item: QuoteItem) =>
    setItems(prev => [...prev, item]);

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const updateItem = (id: string, field: keyof Omit<QuoteItem, 'id'>, val: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'hrs') {
        updated.precio = Math.round((val as number) * cotizacion.tarifa_hora * 100) / 100;
      }
      return updated;
    }));
  };

  const updateCondicion = (key: keyof Omit<Condiciones, 'show_firmas'>, val: string) =>
    setCondiciones(prev => ({ ...prev, [key]: val }));

  const doSave = () => {
    setSaveError('');
    setSaved(false);
    startTransition(async () => {
      const res = await fetch(`/api/cotizaciones/${cotizacion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items, notas, descuento, mult, plazo_estimado: plazo,
          condiciones, cliente_nombre: clienteNombre,
          cliente_contacto: clienteContacto, estado,
        }),
      });
      const data = await res.json();
      setShowConfirm(false);
      if (data.ok) setSaved(true);
      else setSaveError(data.error ?? 'Error al guardar');
    });
  };

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <aside className="w-[380px] shrink-0 border-r border-slate-200 dark:border-navy-700/50 bg-white dark:bg-navy-950 overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 dark:bg-navy-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="text-sm font-bold tracking-wide">{cotizacion.numero}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {clienteNombre || 'Sin cliente'} · {cotizacion.moneda}
              </p>
            </div>
            <Link
              href={`/q/${cotizacion.id}`}
              target="_blank"
              title="Ver vista pública"
              className="p-1.5 rounded text-slate-400 hover:text-white transition-colors hover:bg-white/10"
            >
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-5 p-5 flex-1">

            {/* Estado — local only, saved with the rest */}
            <FieldGroup title="Estado">
              <div className="grid grid-cols-2 gap-1.5">
                {ESTADOS.map(e => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setEstado(e.value)}
                    className={`text-xs rounded-lg px-2 py-1.5 font-medium transition-colors border ${
                      e.value === estado
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                        : 'border-slate-200 dark:border-navy-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {estado !== cotizacion.estado && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  Cambio pendiente de guardar
                </p>
              )}
            </FieldGroup>

            {/* Client */}
            <FieldGroup title="Cliente">
              <Field label="Nombre">
                <input value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Contacto / Email">
                <input value={clienteContacto} onChange={e => setClienteContacto(e.target.value)} className={inputCls} />
              </Field>
            </FieldGroup>

            {/* Financial */}
            <FieldGroup title="Totales">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Recargo total (×)">
                  <input
                    type="number" min={1} step={0.05} value={mult}
                    onChange={e => setMult(parseFloat(e.target.value) || 1)}
                    className={inputCls}
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-600">
                    {multPct > 0 ? `+${multPct}%` : 'Sin recargo'}
                  </p>
                </Field>
                <Field label="Descuento (%)">
                  <input
                    type="number" min={0} max={100} step={1} value={descuento}
                    onChange={e => setDescuento(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 space-y-0.5 bg-slate-50 dark:bg-navy-900 rounded-lg p-2.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{fmtMoney(subtotal, cotizacion.moneda)}</span>
                </div>
                {mult > 1 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Recargo +{multPct}%</span>
                    <span>+{fmtMoney(subtotal * (mult - 1), cotizacion.moneda)}</span>
                  </div>
                )}
                {descuento > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Descuento {descuento}%</span>
                    <span>-{fmtMoney((subtotal * mult) * (descuento / 100), cotizacion.moneda)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-navy-700">
                  <span>Total</span>
                  <span>{fmtMoney(total, cotizacion.moneda)} {cotizacion.moneda}</span>
                </div>
              </div>
            </FieldGroup>

            {/* Items */}
            <FieldGroup title="Servicios">
              <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="border border-slate-200 dark:border-navy-700/60 rounded-xl p-3 bg-slate-50 dark:bg-navy-900">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ítem {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <Field label="Servicio">
                      <input
                        value={item.svc}
                        onChange={e => updateItem(item.id, 'svc', e.target.value)}
                        placeholder="Nombre del servicio"
                        className={inputCls}
                      />
                    </Field>
                    <div className="mt-1.5">
                      <Field label="Descripción">
                        <textarea
                          rows={2}
                          value={item.desc}
                          onChange={e => updateItem(item.id, 'desc', e.target.value)}
                          className={`${inputCls} resize-y`}
                        />
                      </Field>
                    </div>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <Field label="Horas">
                        <input
                          type="number" min={0} step={0.5} value={item.hrs}
                          onChange={e => updateItem(item.id, 'hrs', parseFloat(e.target.value) || 0)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label={`Precio (${cotizacion.moneda})`}>
                        <div className={`${inputCls} bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 cursor-default select-none`}>
                          {fmtMoney(item.hrs * cotizacion.tarifa_hora, cotizacion.moneda)}
                        </div>
                      </Field>
                    </div>
                  </div>
                ))}

                {/* Add item button + picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPicker(v => !v)}
                    className="w-full py-2.5 border border-dashed border-slate-300 dark:border-navy-600 rounded-xl text-slate-400 dark:text-slate-500 text-xs hover:border-slate-500 dark:hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={12} /> Agregar servicio
                  </button>
                  {showPicker && (
                    <CatalogPicker
                      catalogo={catalogo}
                      currentItems={items}
                      complejidad={complejidad}
                      tarifa={cotizacion.tarifa_hora}
                      onSelect={addCatalogItem}
                      onEmpty={addEmptyItem}
                      onClose={() => setShowPicker(false)}
                    />
                  )}
                </div>
              </div>
            </FieldGroup>

            {/* Delivery */}
            <FieldGroup title="Plazo de entrega">
              <Field label="Texto del plazo">
                <input value={plazo} onChange={e => setPlazo(e.target.value)} className={inputCls} />
              </Field>
            </FieldGroup>

            {/* Conditions */}
            <FieldGroup title="Términos y Condiciones">
              {(Object.keys(COND_LABELS) as (keyof typeof COND_LABELS)[]).map(key => (
                <Field key={key} label={COND_LABELS[key]}>
                  <input
                    value={condiciones[key] ?? ''}
                    onChange={e => updateCondicion(key, e.target.value)}
                    className={inputCls}
                  />
                </Field>
              ))}
              <Toggle
                label="Incluir sección de firmas"
                checked={showFirmas}
                onChange={() => setShowFirmas(!showFirmas)}
              />
            </FieldGroup>

            {/* Notes */}
            <FieldGroup title="Notas adicionales">
              <textarea
                rows={4}
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Texto libre para el cliente..."
                className={`${inputCls} resize-y`}
              />
            </FieldGroup>

            {/* Save */}
            <div className="flex flex-col gap-2">
              {saveError && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}
              <button
                type="button"
                onClick={() => { setSaved(false); setShowConfirm(true); }}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-lg py-3 transition-colors"
              >
                {saved ? <Check size={14} /> : <Save size={14} />}
                {saved ? 'Guardado' : 'Guardar cambios'}
              </button>
            </div>

          </div>
        </aside>

        {/* ── RIGHT: PREVIEW ── */}
        <main className="flex-1 bg-slate-200 dark:bg-[#1a1a24] overflow-y-auto flex flex-col items-center py-8 px-8 gap-4">
          <div className="flex items-center justify-between w-full" style={{ maxWidth: '210mm' }}>
            <span className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Vista previa del documento
            </span>
            <Link
              href={`/q/${cotizacion.id}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 rounded-lg px-3 py-1.5 transition-colors"
            >
              <ExternalLink size={12} /> Abrir / Imprimir
            </Link>
          </div>
          <div style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.22)' }}>
            <QuoteDocument cotizacion={preview} empresa={empresa} />
          </div>
        </main>
      </div>

      {/* ── Confirm save modal ── */}
      {showConfirm && (
        <ConfirmSaveModal
          estadoActual={cotizacion.estado}
          estadoNuevo={estado}
          onConfirm={doSave}
          onCancel={() => setShowConfirm(false)}
          isPending={isPending}
        />
      )}
    </>
  );
}
