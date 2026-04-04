import type { WizardAnswers, CotizacionConfig, QuoteItem } from '@/types/cotizacion';
import { FEATURES_BY_TIPO, COMMON_FEATURES, complejidadFromFeatures } from './features';

// Maps project type → catalog item IDs to include (base services)
const ITEMS_BY_TIPO: Record<string, string[]> = {
  landing:       ['landing_diseno', 'landing_frontend', 'landing_produccion'],
  institucional: ['inst_diseno', 'inst_frontend', 'inst_produccion'],
  ecommerce:     ['ec_diseno', 'ec_frontend', 'ec_panel', 'ec_produccion'],
  sistema:       ['sis_diseno', 'sis_frontend', 'sis_backend', 'sis_db_api', 'sis_produccion'],
  mantenimiento: ['mant_diagnostico', 'mant_trabajo'],
};

const DESIGN_ITEM_IDS = new Set([
  'landing_diseno', 'inst_diseno', 'ec_diseno', 'sis_diseno',
]);

const SECCION_ITEM_IDS = new Set([
  'landing_diseno', 'landing_frontend',
  'inst_diseno',    'inst_frontend',
]);

const PRODUCTO_ITEM_IDS = new Set(['ec_panel', 'ec_frontend']);

let _idCounter = 0;
function newId(prefix: string) {
  return `${prefix}_${++_idCounter}_${Math.random().toString(36).slice(2, 5)}`;
}

export interface GenerateResult {
  items: QuoteItem[];
  plazo_estimado: string;
  mult: number;
}

export function generateItems(
  answers: WizardAnswers,
  config: CotizacionConfig
): GenerateResult {
  const {
    tipo, features,
    num_secciones, cantidad_productos, auth_tipo, tiene_sitio_actual,
    incluye_diseno, incluye_contenido, tiene_logo, incluye_cms, idiomas,
    necesita_hosting, integraciones,
    urgente, sin_brief, revisiones,
    moneda,
  } = answers;

  // Derive complejidad from number of features selected
  const complejidad = complejidadFromFeatures(features.length);

  const tarifa  = moneda === 'UYU' ? config.tarifa_hora_uyu : config.tarifa_hora_usd;
  const catMap  = Object.fromEntries(config.catalogo.map(i => [i.id, i]));

  const getHrs = (id: string): number => {
    const item = catMap[id];
    if (!item) return 0;
    if (complejidad === 'estandar') return item.horas_estandar;
    if (complejidad === 'avanzada') return item.horas_avanzada;
    return item.horas_basica;
  };

  const seccionesFactor =
    num_secciones === '1-3' ? 0.7 :
    num_secciones === '7+'  ? 1.5 : 1.0;

  const productosFactor =
    cantidad_productos === 'menos50' ? 0.6 :
    cantidad_productos === 'mas300'  ? 1.6 : 1.0;

  const makeItem = (catalogId: string, factor = 1): QuoteItem | null => {
    const c = catMap[catalogId];
    if (!c) return null;
    const hrs = Math.round(getHrs(catalogId) * factor * 10) / 10;
    if (hrs === 0) return null;
    return {
      id: newId(catalogId),
      svc: c.nombre,
      desc: c.descripcion,
      hrs,
      precio: Math.round(hrs * tarifa * 100) / 100,
    };
  };

  const items: QuoteItem[] = [];

  // ── Base items ──────────────────────────────────────────────────────────────
  for (const catalogId of ITEMS_BY_TIPO[tipo] ?? []) {
    if (!incluye_diseno && DESIGN_ITEM_IDS.has(catalogId)) continue;

    let factor = 1;
    if (SECCION_ITEM_IDS.has(catalogId))  factor = seccionesFactor;
    if (PRODUCTO_ITEM_IDS.has(catalogId)) factor = productosFactor;

    const item = makeItem(catalogId, factor);
    if (item) items.push(item);
  }

  // ── Feature items (specific functionalities selected in wizard) ─────────────
  const allFeatureDefs = [...(FEATURES_BY_TIPO[tipo] ?? []), ...COMMON_FEATURES];
  for (const featureId of features) {
    const def = allFeatureDefs.find(f => f.id === featureId);
    if (!def) continue;
    items.push({
      id: newId(`feat_${featureId}`),
      svc: def.label,
      desc: def.desc,
      hrs: def.hrs,
      precio: Math.round(def.hrs * tarifa * 100) / 100,
    });
  }

  // ── E-commerce: catalog loading ────────────────────────────────────────────
  if (tipo === 'ecommerce') {
    const catFactor =
      cantidad_productos === 'menos50' ? 0.5 :
      cantidad_productos === 'mas300'  ? 2.0 : 1.0;
    const item = makeItem('ec_carga_catalogo', catFactor);
    if (item) items.push(item);
  }

  // ── Sistema: auth extras ───────────────────────────────────────────────────
  if (tipo === 'sistema') {
    if (auth_tipo === 'roles') {
      const item = makeItem('auth_roles');
      if (item) items.push(item);
    }
    if (auth_tipo === 'oauth') {
      const item = makeItem('auth_oauth');
      if (item) items.push(item);
    }
  }

  // ── Migration ──────────────────────────────────────────────────────────────
  if (tiene_sitio_actual) {
    const item = makeItem('opt_migracion');
    if (item) items.push(item);
  }

  // ── CMS ────────────────────────────────────────────────────────────────────
  if (incluye_cms) {
    const item = makeItem('opt_cms');
    if (item) items.push(item);
  }

  // ── Languages ─────────────────────────────────────────────────────────────
  if (idiomas === 'es-en') {
    const item = makeItem('opt_bilingue');
    if (item) items.push(item);
  }
  if (idiomas === 'multi') {
    const item = makeItem('opt_multilenguaje');
    if (item) items.push(item);
  }

  // ── Content / logo / hosting ───────────────────────────────────────────────
  if (incluye_contenido) {
    const item = makeItem('opt_contenido');
    if (item) items.push(item);
  }
  if (!tiene_logo) {
    const item = makeItem('opt_logo');
    if (item) items.push(item);
  }
  if (necesita_hosting) {
    const item = makeItem('opt_hosting');
    if (item) items.push(item);
  }

  // ── Extra revisions ────────────────────────────────────────────────────────
  if (revisiones === '3+') {
    const item = makeItem('opt_revisiones_extra');
    if (item) items.push(item);
  }

  // ── Integrations ──────────────────────────────────────────────────────────
  for (const integ of integraciones) {
    const item = makeItem(`integ_${integ}`);
    if (item) items.push(item);
  }

  // ── Multipliers ───────────────────────────────────────────────────────────
  let mult = 1;
  if (urgente)   mult *= config.mult_urgencia;
  if (sin_brief) mult *= config.mult_sin_brief;
  mult = Math.round(mult * 10000) / 10000;

  // ── Delivery estimate ─────────────────────────────────────────────────────
  const totalHrs   = items.reduce((s, i) => s + i.hrs, 0);
  const diasBase   = Math.max(3, Math.ceil(totalHrs / 6));
  const diasMax    = Math.ceil(diasBase * 1.4);
  const plazo_estimado = urgente
    ? `${diasBase} días hábiles (entrega urgente)`
    : `${diasBase}–${diasMax} días hábiles`;

  return { items, plazo_estimado, mult };
}

export function calcTotals(
  items: QuoteItem[],
  mult: number,
  descuento: number
): { subtotal: number; total: number } {
  const subtotal = Math.round(items.reduce((s, i) => s + i.precio, 0) * 100) / 100;
  const recargo  = subtotal * (mult - 1);
  const desc     = (subtotal + recargo) * (descuento / 100);
  const total    = Math.round((subtotal + recargo - desc) * 100) / 100;
  return { subtotal, total };
}
