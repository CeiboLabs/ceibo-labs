export type EstadoCotizacion = 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
export type Moneda = 'UYU' | 'USD';
export type TipoProyecto = 'landing' | 'institucional' | 'ecommerce' | 'sistema' | 'mantenimiento';
export type Complejidad = 'basica' | 'estandar' | 'avanzada';
export type Integracion = 'formularios' | 'pagos' | 'reservas' | 'mapa' | 'otro';

export interface QuoteItem {
  id: string;
  svc: string;
  desc: string;
  hrs: number;
  precio: number; // total for this item (hrs * tarifa_hora)
}

export interface Condiciones {
  pago: string;
  entrega: string;
  revisiones: string;
  soporte: string;
  ip: string;
  respuesta: string;
  show_firmas?: boolean; // stored in condiciones JSONB to avoid migration
}

export type NumSecciones    = '1-3' | '4-6' | '7+';
export type AuthTipo        = 'ninguno' | 'basico' | 'roles' | 'oauth';
export type CantidadProductos = 'menos50' | '50-300' | 'mas300';
export type Idiomas         = 'es' | 'es-en' | 'multi';
export type Revisiones      = '1' | '2' | '3+';

export interface WizardAnswers {
  tipo: TipoProyecto;
  complejidad: Complejidad; // derived from features.length — not shown in wizard
  descripcion: string;      // free-text project description shown in the quote

  // Step 2 – features & project-specific details
  features: string[];                 // selected feature IDs
  num_secciones: NumSecciones;        // landing / institucional
  cantidad_productos: CantidadProductos; // ecommerce
  auth_tipo: AuthTipo;                // sistema
  tiene_sitio_actual: boolean;        // all types

  // Step 3 – design & content
  incluye_diseno: boolean;
  incluye_contenido: boolean;
  tiene_logo: boolean;
  incluye_cms: boolean;
  idiomas: Idiomas;

  // Step 4 – extras
  necesita_hosting: boolean;
  integraciones: Integracion[];

  // Step 5 – conditions
  urgente: boolean;
  sin_brief: boolean;
  revisiones: Revisiones;
  moneda: Moneda;
}

export interface Cotizacion {
  id: string;
  numero: string;
  estado: EstadoCotizacion;
  cliente_nombre: string;
  cliente_contacto: string;
  moneda: Moneda;
  tarifa_hora: number;
  items: QuoteItem[];
  notas: string;
  descuento: number;       // percentage 0–100
  mult: number;            // combined multiplier (e.g. 1.495 = urgente + sin_brief)
  subtotal: number;        // sum of item prices
  total: number;           // subtotal * mult * (1 - descuento/100)
  plazo_estimado: string;
  condiciones: Condiciones;
  answers: WizardAnswers | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogoItem {
  id: string;
  nombre: string;
  descripcion: string;
  horas_basica: number;
  horas_estandar: number;
  horas_avanzada: number;
}

export interface CotizacionConfig {
  id: 1;
  tarifa_hora_uyu: number;
  tarifa_hora_usd: number;
  mult_urgencia: number;
  mult_sin_brief: number;
  empresa_nombre: string;
  empresa_email: string;
  empresa_rut: string | null;
  condiciones_default: Condiciones;
  catalogo: CatalogoItem[];
}
