'use client';

import { useActionState, useState } from 'react';
import { Save, ChevronDown, ChevronRight } from 'lucide-react';
import { saveConfigAction } from '@/app/admin/configuracion/actions';
import type { CotizacionConfig, CatalogoItem } from '@/types/cotizacion';

const inputCls =
  'w-full border border-slate-200 dark:border-navy-700/60 rounded-lg bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm px-3 py-2 outline-none focus:border-slate-400 dark:focus:border-electric-400 transition-colors font-[inherit]';

const smInputCls =
  'w-full border border-slate-200 dark:border-navy-700/60 rounded bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-xs px-2 py-1.5 outline-none focus:border-slate-400 dark:focus:border-electric-400 transition-colors font-[inherit]';

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-navy-700/50 rounded-xl overflow-hidden bg-white dark:bg-navy-900">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-100">{title}</span>
        {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-100 dark:border-navy-800 pt-4">{children}</div>}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 dark:text-slate-600">{hint}</p>}
    </div>
  );
}

// Catalog item group labels
const CATALOG_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Landing page',     ids: ['landing_diseno','landing_frontend','landing_produccion'] },
  { label: 'Web institucional',ids: ['inst_diseno','inst_frontend','inst_produccion'] },
  { label: 'E-commerce',       ids: ['ec_diseno','ec_frontend','ec_panel','ec_produccion','ec_carga_catalogo'] },
  { label: 'Sistema web',      ids: ['sis_diseno','sis_frontend','sis_backend','sis_db_api','sis_produccion'] },
  { label: 'Autenticación',    ids: ['auth_roles','auth_oauth'] },
  { label: 'Mantenimiento',    ids: ['mant_diagnostico','mant_trabajo'] },
  { label: 'Opcionales',       ids: ['opt_cms','opt_migracion','opt_contenido','opt_logo','opt_hosting','opt_bilingue','opt_multilenguaje','opt_revisiones_extra'] },
  { label: 'Integraciones',    ids: ['integ_formularios','integ_pagos','integ_reservas','integ_mapa','integ_otro'] },
];

interface Props {
  config: CotizacionConfig;
}

export function ConfiguracionClient({ config }: Props) {
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>(config.catalogo);
  const [state, formAction, isPending] = useActionState(saveConfigAction, { error: null, ok: false });

  const updateCatItem = (id: string, field: keyof CatalogoItem, val: string | number) => {
    setCatalogo(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const getCatItem = (id: string) => catalogo.find(i => i.id === id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tarifas, multiplicadores y catálogo de servicios
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {/* Hidden field for catalog JSON */}
        <input type="hidden" name="catalogo" value={JSON.stringify(catalogo)} />

        {/* ── Rates ── */}
        <Section title="Tarifas por hora">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tarifa / hora en USD" hint="Usada cuando la cotización es en dólares">
              <input type="number" name="tarifa_hora_usd" min={1} step={0.5}
                defaultValue={config.tarifa_hora_usd} className={inputCls} />
            </Field>
            <Field label="Tarifa / hora en UYU" hint="Usada cuando la cotización es en pesos">
              <input type="number" name="tarifa_hora_uyu" min={1} step={50}
                defaultValue={config.tarifa_hora_uyu} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ── Multipliers ── */}
        <Section title="Multiplicadores">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Recargo por urgencia"
              hint="Ej: 1.30 = +30% cuando el plazo es urgente"
            >
              <input type="number" name="mult_urgencia" min={1} step={0.05}
                defaultValue={config.mult_urgencia} className={inputCls} />
            </Field>
            <Field
              label="Recargo sin brief"
              hint="Ej: 1.15 = +15% cuando el cliente no tiene brief"
            >
              <input type="number" name="mult_sin_brief" min={1} step={0.05}
                defaultValue={config.mult_sin_brief} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ── Company data ── */}
        <Section title="Datos de la empresa">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre de la empresa">
              <input type="text" name="empresa_nombre"
                defaultValue={config.empresa_nombre} className={inputCls} />
            </Field>
            <Field label="Email de contacto">
              <input type="email" name="empresa_email"
                defaultValue={config.empresa_email} className={inputCls} />
            </Field>
            <Field label="RUT (opcional)">
              <input type="text" name="empresa_rut"
                defaultValue={config.empresa_rut ?? ''} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ── Default conditions ── */}
        <Section title="Condiciones por defecto">
          <div className="flex flex-col gap-3">
            {(['pago', 'entrega', 'revisiones', 'soporte', 'ip', 'respuesta'] as const).map(key => {
              const labels: Record<typeof key, string> = {
                pago: 'Forma de pago', entrega: 'Plazo de entrega',
                revisiones: 'Revisiones incluidas', soporte: 'Soporte post-entrega',
                ip: 'Propiedad intelectual', respuesta: 'Tiempo de respuesta',
              };
              return (
                <Field key={key} label={labels[key]}>
                  <input
                    type="text"
                    name={`cond_${key}`}
                    defaultValue={config.condiciones_default[key] as string}
                    className={inputCls}
                  />
                </Field>
              );
            })}
          </div>
        </Section>

        {/* ── Catalog ── */}
        <Section title="Catálogo de servicios" defaultOpen={false}>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            Las horas se aplican según la complejidad elegida en el asistente (básica / estándar / avanzada).
          </p>
          <div className="flex flex-col gap-6">
            {CATALOG_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  {group.label}
                </p>
                <div className="border border-slate-200 dark:border-navy-700/50 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-navy-800/60 border-b border-slate-200 dark:border-navy-700/50">
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 w-40">Servicio</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Descripción</th>
                        <th className="text-center px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 w-20">Básica (h)</th>
                        <th className="text-center px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 w-24">Estándar (h)</th>
                        <th className="text-center px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 w-24">Avanzada (h)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                      {group.ids.map(id => {
                        const item = getCatItem(id);
                        if (!item) return null;
                        return (
                          <tr key={id} className="hover:bg-slate-50 dark:hover:bg-navy-800/30">
                            <td className="px-3 py-2">
                              <input
                                value={item.nombre}
                                onChange={e => updateCatItem(id, 'nombre', e.target.value)}
                                className={smInputCls}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={item.descripcion}
                                onChange={e => updateCatItem(id, 'descripcion', e.target.value)}
                                className={smInputCls}
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number" min={0} step={1}
                                value={item.horas_basica}
                                onChange={e => updateCatItem(id, 'horas_basica', parseInt(e.target.value) || 0)}
                                className={smInputCls + ' text-center'}
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number" min={0} step={1}
                                value={item.horas_estandar}
                                onChange={e => updateCatItem(id, 'horas_estandar', parseInt(e.target.value) || 0)}
                                className={smInputCls + ' text-center'}
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number" min={0} step={1}
                                value={item.horas_avanzada}
                                onChange={e => updateCatItem(id, 'horas_avanzada', parseInt(e.target.value) || 0)}
                                className={smInputCls + ' text-center'}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Submit ── */}
        <div className="flex items-center justify-between gap-3">
          {state.ok && (
            <p className="text-sm text-green-600 dark:text-green-400">Configuración guardada correctamente.</p>
          )}
          {state.error && (
            <p className="text-sm text-red-500 dark:text-red-400">{state.error}</p>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <Save size={14} />
              {isPending ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
