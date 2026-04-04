'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Check } from 'lucide-react';
import { FEATURES_BY_TIPO, COMMON_FEATURES, complejidadFromFeatures } from '@/lib/cotizaciones/features';
import type {
  WizardAnswers, TipoProyecto, Complejidad, Integracion,
  NumSecciones, AuthTipo, CantidadProductos, Idiomas, Revisiones,
} from '@/types/cotizacion';

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full border border-slate-200 dark:border-navy-700/60 rounded-lg bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 text-sm px-3 py-2 outline-none focus:border-slate-400 dark:focus:border-electric-400 transition-colors';

function Toggle({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-start justify-between gap-3 w-full p-3 rounded-xl border text-left transition-all ${
        checked
          ? 'border-electric-400/50 bg-electric-400/8 text-slate-800 dark:text-slate-100'
          : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600 text-slate-500 dark:text-slate-400'
      }`}
    >
      <div>
        <p className="text-sm font-medium leading-tight">{label}</p>
        {desc && <p className="text-xs mt-0.5 opacity-70">{desc}</p>}
      </div>
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
        checked ? 'border-electric-400 bg-electric-400' : 'border-slate-300 dark:border-navy-600'
      }`}>
        {checked && <span className="block w-full h-full rounded-full bg-white scale-50" />}
      </div>
    </button>
  );
}

function RadioCard({ label, desc, selected, onClick }: {
  label: string; desc?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col text-left w-full p-3 rounded-xl border transition-all ${
        selected
          ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
          : 'border-slate-200 dark:border-navy-700 hover:border-slate-400 dark:hover:border-navy-500 text-slate-700 dark:text-slate-300'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      {desc && <span className={`text-xs mt-0.5 ${selected ? 'opacity-70' : 'text-slate-400 dark:text-slate-500'}`}>{desc}</span>}
    </button>
  );
}

function FeatureCheckbox({ label, desc, checked, onClick }: {
  label: string; desc: string; checked: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 w-full p-3 rounded-xl border text-left transition-all ${
        checked
          ? 'border-electric-400/60 bg-electric-400/8 dark:bg-electric-400/10'
          : 'border-slate-200 dark:border-navy-700 hover:border-slate-300 dark:hover:border-navy-600'
      }`}
    >
      <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'border-electric-500 bg-electric-500' : 'border-slate-300 dark:border-navy-600'
      }`}>
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${checked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
          {label}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{desc}</p>
      </div>
    </button>
  );
}

// ── Wizard data ───────────────────────────────────────────────────────────────

const TIPOS: { value: TipoProyecto; label: string; desc: string }[] = [
  { value: 'landing',       label: 'Landing page',       desc: 'Una sola página de presentación o captación' },
  { value: 'institucional', label: 'Web institucional',  desc: 'Sitio multi-sección con info y contacto' },
  { value: 'ecommerce',     label: 'E-commerce',         desc: 'Tienda online con catálogo y carrito' },
  { value: 'sistema',       label: 'Sistema web',        desc: 'Aplicación con backend, base de datos y login' },
  { value: 'mantenimiento', label: 'Mantenimiento',      desc: 'Mejoras y correcciones a un proyecto existente' },
];

const COMPLEJIDADES: { value: Complejidad; label: string; desc: string }[] = [
  { value: 'basica',   label: 'Básica',   desc: 'Pocos servicios, diseño simple, plazo corto' },
  { value: 'estandar', label: 'Estándar', desc: 'Alcance medio, funcionalidades habituales' },
  { value: 'avanzada', label: 'Avanzada', desc: 'Alto detalle, animaciones, funcionalidades extra' },
];

const INTEGRACIONES: { value: Integracion; label: string }[] = [
  { value: 'formularios', label: 'Formularios de contacto/registro' },
  { value: 'pagos',       label: 'Pasarela de pago' },
  { value: 'reservas',    label: 'Sistema de reservas / turnos' },
  { value: 'mapa',        label: 'Mapa interactivo' },
  { value: 'otro',        label: 'Integración personalizada / API' },
];

const STEPS = ['Cliente', 'Proyecto', 'Funcionalidades', 'Detalles', 'Diseño', 'Extras', 'Condiciones'];

const DEFAULT_ANSWERS: WizardAnswers = {
  tipo:               'landing',
  complejidad:        'estandar',
  descripcion:        '',
  features:           [],
  num_secciones:      '4-6',
  cantidad_productos: '50-300',
  auth_tipo:          'basico',
  tiene_sitio_actual: false,
  incluye_diseno:     true,
  incluye_contenido:  false,
  tiene_logo:         true,
  incluye_cms:        false,
  idiomas:            'es',
  necesita_hosting:   false,
  integraciones:      [],
  urgente:            false,
  sin_brief:          false,
  revisiones:         '2',
  moneda:             'USD',
};

export function WizardClient() {
  const router                       = useRouter();
  const [step, setStep]              = useState(0);
  const [nombre, setNombre]          = useState('');
  const [contacto, setContacto]      = useState('');
  const [answers, setAnswers]        = useState<WizardAnswers>(DEFAULT_ANSWERS);
  const [error, setError]            = useState('');
  const [isPending, setIsPending]    = useState(false);

  const set = <K extends keyof WizardAnswers>(key: K, val: WizardAnswers[K]) =>
    setAnswers(prev => ({ ...prev, [key]: val }));

  const toggleFeature = (id: string) =>
    set('features',
      answers.features.includes(id)
        ? answers.features.filter(f => f !== id)
        : [...answers.features, id]
    );

  const toggleInteg = (v: Integracion) =>
    set('integraciones',
      answers.integraciones.includes(v)
        ? answers.integraciones.filter(i => i !== v)
        : [...answers.integraciones, v]
    );

  const canNext = () => step === 0 ? nombre.trim().length > 0 : true;

  const handleSubmit = async () => {
    setError('');
    setIsPending(true);
    try {
      const derived = complejidadFromFeatures(answers.features.length);
      const finalAnswers = { ...answers, complejidad: derived };
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), contacto: contacto.trim(), answers: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Error al crear cotización');
      } else {
        router.push(`/admin/cotizaciones/${data.id}/editar`);
      }
    } catch {
      setError('Error de red');
    } finally {
      setIsPending(false);
    }
  };

  const tipoFeatures = FEATURES_BY_TIPO[answers.tipo] ?? [];

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header + Navigation (sticky) ── */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-navy-950 pb-4 mb-4 pt-1">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nueva cotización</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              <ArrowLeft size={14} /> Atrás
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="flex items-center gap-1.5 text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none rounded-lg px-4 py-2 font-medium transition-colors"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isPending}
                className="flex items-center gap-1.5 text-sm bg-electric-500 hover:bg-electric-600 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isPending ? 'Generando...' : 'Generar cotización'}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step    ? 'bg-electric-500 text-white'
                : i === step ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-200 dark:bg-navy-700 text-slate-400 dark:text-slate-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i === step ? 'font-medium text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-electric-400' : 'bg-slate-200 dark:bg-navy-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/50 rounded-2xl p-6">

        {/* ── Step 0: Cliente ── */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Datos del cliente</h2>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nombre del cliente *</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Muebles Rústicos del Este" className={inputCls} autoFocus />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contacto / Email</label>
              <input value={contacto} onChange={e => setContacto(e.target.value)}
                placeholder="Ej. juan@empresa.com" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Descripción del proyecto</label>
              <textarea
                value={answers.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                placeholder="Ej. Desarrollo de sitio web institucional para empresa de logística, con secciones de servicios, equipo y formulario de contacto."
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Proyecto ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Tipo de proyecto</h2>
              <div className="grid grid-cols-1 gap-2">
                {TIPOS.map(t => (
                  <RadioCard key={t.value} label={t.label} desc={t.desc}
                    selected={answers.tipo === t.value}
                    onClick={() => { set('tipo', t.value); set('features', []); }} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Complejidad</h2>
              <div className="grid grid-cols-3 gap-2">
                {COMPLEJIDADES.map(c => (
                  <RadioCard key={c.value} label={c.label} desc={c.desc}
                    selected={answers.complejidad === c.value}
                    onClick={() => set('complejidad', c.value)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Funcionalidades ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Funcionalidades</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Seleccioná las que el cliente necesita. Cada una suma horas al presupuesto.
              </p>
            </div>

            {tipoFeatures.length > 0 && (
              <div className="flex flex-col gap-2">
                {tipoFeatures.map(f => (
                  <FeatureCheckbox key={f.id} label={f.label}
                    desc={`${f.desc} · +${f.hrs}h`}
                    checked={answers.features.includes(f.id)}
                    onClick={() => toggleFeature(f.id)} />
                ))}
              </div>
            )}

            {answers.tipo !== 'mantenimiento' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Comunes a cualquier proyecto
                </p>
                {COMMON_FEATURES.map(f => (
                  <FeatureCheckbox key={f.id} label={f.label}
                    desc={`${f.desc} · +${f.hrs}h`}
                    checked={answers.features.includes(f.id)}
                    onClick={() => toggleFeature(f.id)} />
                ))}
              </div>
            )}

            {answers.features.length > 0 && (
              <p className="text-xs text-electric-500 dark:text-electric-400">
                {answers.features.length} funcionalidad{answers.features.length !== 1 ? 'es' : ''} seleccionada{answers.features.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: Detalles ── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Detalles del proyecto</h2>

            {(answers.tipo === 'landing' || answers.tipo === 'institucional') && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  ¿Cuántas secciones tiene el sitio?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: '1-3', label: '1 – 3',   desc: 'Landing simple' },
                    { value: '4-6', label: '4 – 6',   desc: 'Sitio estándar' },
                    { value: '7+',  label: '7 o más',  desc: 'Sitio amplio' },
                  ] as { value: NumSecciones; label: string; desc: string }[]).map(o => (
                    <RadioCard key={o.value} label={o.label} desc={o.desc}
                      selected={answers.num_secciones === o.value}
                      onClick={() => set('num_secciones', o.value)} />
                  ))}
                </div>
              </div>
            )}

            {answers.tipo === 'ecommerce' && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  ¿Cuántos productos tiene el catálogo?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'menos50', label: 'Menos de 50',  desc: 'Catálogo pequeño' },
                    { value: '50-300',  label: '50 – 300',     desc: 'Catálogo mediano' },
                    { value: 'mas300',  label: 'Más de 300',   desc: 'Catálogo grande' },
                  ] as { value: CantidadProductos; label: string; desc: string }[]).map(o => (
                    <RadioCard key={o.value} label={o.label} desc={o.desc}
                      selected={answers.cantidad_productos === o.value}
                      onClick={() => set('cantidad_productos', o.value)} />
                  ))}
                </div>
              </div>
            )}

            {answers.tipo === 'sistema' && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  ¿Qué tipo de autenticación necesita?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'ninguno', label: 'Sin login',         desc: 'Acceso público o por invitación' },
                    { value: 'basico',  label: 'Login básico',      desc: 'Usuario y contraseña' },
                    { value: 'roles',   label: 'Roles y permisos',  desc: 'Admin, operador, visor, etc.' },
                    { value: 'oauth',   label: 'Login social',      desc: 'Google, GitHub u otro OAuth' },
                  ] as { value: AuthTipo; label: string; desc: string }[]).map(o => (
                    <RadioCard key={o.value} label={o.label} desc={o.desc}
                      selected={answers.auth_tipo === o.value}
                      onClick={() => set('auth_tipo', o.value)} />
                  ))}
                </div>
              </div>
            )}

            <Toggle
              label="El cliente tiene un sitio actual"
              desc="Se incluye trabajo de migración de contenido, redirecciones y revisión del entorno existente."
              checked={answers.tiene_sitio_actual}
              onChange={() => set('tiene_sitio_actual', !answers.tiene_sitio_actual)}
            />
          </div>
        )}

        {/* ── Step 4: Diseño y contenido ── */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Diseño y contenido</h2>
            <Toggle
              label="Ceibo Labs diseña el proyecto"
              desc="Incluye UI/UX, propuesta visual y maquetas. Si el cliente trae su propio diseño, desactivar."
              checked={answers.incluye_diseno}
              onChange={() => set('incluye_diseno', !answers.incluye_diseno)}
            />
            <Toggle
              label="Ceibo Labs redacta el contenido"
              desc="Textos para todas las secciones del sitio. Si el cliente los provee, desactivar."
              checked={answers.incluye_contenido}
              onChange={() => set('incluye_contenido', !answers.incluye_contenido)}
            />
            <Toggle
              label="El cliente tiene logo y branding"
              desc="Si no tiene logo, se agrega diseño de identidad básica."
              checked={answers.tiene_logo}
              onChange={() => set('tiene_logo', !answers.tiene_logo)}
            />
            <Toggle
              label="El cliente necesita CMS para editar contenido"
              desc="Se integra un panel para que el cliente gestione textos e imágenes sin programador."
              checked={answers.incluye_cms}
              onChange={() => set('incluye_cms', !answers.incluye_cms)}
            />
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Idiomas del sitio</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'es',    label: 'Solo español', desc: 'Un solo idioma' },
                  { value: 'es-en', label: 'ES + EN',      desc: 'Bilingüe' },
                  { value: 'multi', label: '3+ idiomas',   desc: 'Multilenguaje' },
                ] as { value: Idiomas; label: string; desc: string }[]).map(o => (
                  <RadioCard key={o.value} label={o.label} desc={o.desc}
                    selected={answers.idiomas === o.value}
                    onClick={() => set('idiomas', o.value)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Extras ── */}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Infraestructura</h2>
              <Toggle
                label="Incluye dominio y hosting"
                desc="Se agrega configuración DNS, certificado SSL y puesta en marcha."
                checked={answers.necesita_hosting}
                onChange={() => set('necesita_hosting', !answers.necesita_hosting)}
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Integraciones</h2>
              <div className="flex flex-col gap-2">
                {INTEGRACIONES.map(i => (
                  <button key={i.value} type="button" onClick={() => toggleInteg(i.value)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                      answers.integraciones.includes(i.value)
                        ? 'border-electric-400/50 bg-electric-400/8 text-slate-800 dark:text-slate-100 font-medium'
                        : 'border-slate-200 dark:border-navy-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-navy-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      answers.integraciones.includes(i.value) ? 'border-electric-500 bg-electric-500' : 'border-slate-300 dark:border-navy-600'
                    }`}>
                      {answers.integraciones.includes(i.value) && (
                        <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                          <path d="M1 4l3 3L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 6: Condiciones ── */}
        {step === 6 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Condiciones finales</h2>
            <Toggle
              label="Plazo urgente (menos de 2 semanas)"
              desc="Se aplica un recargo por urgencia en el total."
              checked={answers.urgente}
              onChange={() => set('urgente', !answers.urgente)}
            />
            <Toggle
              label="Cliente sin brief definido"
              desc="Se incluye tiempo extra para reuniones de levantamiento de requisitos."
              checked={answers.sin_brief}
              onChange={() => set('sin_brief', !answers.sin_brief)}
            />
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Rondas de revisión incluidas
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: '1',  label: '1 ronda',  desc: 'Ajuste puntual' },
                  { value: '2',  label: '2 rondas', desc: 'Estándar' },
                  { value: '3+', label: '3 o más',  desc: 'Proceso iterativo' },
                ] as { value: Revisiones; label: string; desc: string }[]).map(o => (
                  <RadioCard key={o.value} label={o.label} desc={o.desc}
                    selected={answers.revisiones === o.value}
                    onClick={() => set('revisiones', o.value)} />
                ))}
              </div>
              {answers.revisiones === '3+' && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Se agregan horas de revisión adicionales al presupuesto.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Moneda de presentación</p>
              <div className="grid grid-cols-2 gap-2">
                {(['USD', 'UYU'] as const).map(m => (
                  <RadioCard key={m} label={m === 'USD' ? 'USD (dólares)' : 'UYU (pesos)'}
                    selected={answers.moneda === m} onClick={() => set('moneda', m)} />
                ))}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
