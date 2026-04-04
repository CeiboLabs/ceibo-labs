export interface FeatureDef {
  id: string;
  label: string;
  desc: string;
  hrs: number; // fixed hours added regardless of complejidad
}

export const FEATURES_BY_TIPO: Record<string, FeatureDef[]> = {
  landing: [
    { id: 'video_hero',     label: 'Hero con video de fondo',        desc: 'Video autoplay en la sección principal',                    hrs: 5 },
    { id: 'testimonios',    label: 'Testimonios / reseñas',           desc: 'Carrusel o grilla con opiniones de clientes',               hrs: 2 },
    { id: 'faq',            label: 'FAQ / preguntas frecuentes',      desc: 'Acordeón desplegable con preguntas y respuestas',           hrs: 2 },
    { id: 'estadisticas',   label: 'Contadores animados',             desc: 'Números que se animan al hacer scroll (clientes, años, etc.)', hrs: 2 },
    { id: 'precios_planes', label: 'Tabla de precios / planes',       desc: 'Comparativa de planes con botones de acción',              hrs: 3 },
    { id: 'popup_lead',     label: 'Pop-up de captación de leads',    desc: 'Modal con formulario tras X segundos o al intentar salir', hrs: 3 },
  ],
  institucional: [
    { id: 'blog',        label: 'Blog / sección de noticias',       desc: 'Publicar artículos con categorías y buscador',              hrs: 10 },
    { id: 'portfolio',   label: 'Portfolio / galería de proyectos', desc: 'Grilla filtrable de trabajos o proyectos realizados',       hrs: 5  },
    { id: 'equipo',      label: 'Sección del equipo',               desc: 'Tarjetas con foto, nombre y cargo de cada integrante',     hrs: 2  },
    { id: 'newsletter',  label: 'Suscripción a newsletter',         desc: 'Formulario conectado a Mailchimp, Brevo u otro',           hrs: 4  },
    { id: 'testimonios', label: 'Testimonios / reseñas',            desc: 'Sección con opiniones de clientes',                       hrs: 2  },
    { id: 'faq',         label: 'FAQ / preguntas frecuentes',       desc: 'Acordeón desplegable con preguntas y respuestas',         hrs: 2  },
  ],
  ecommerce: [
    { id: 'filtros_avanzados', label: 'Filtros avanzados',          desc: 'Filtrar por precio, categoría, color, talla u atributos', hrs: 8 },
    { id: 'wishlist',          label: 'Lista de deseos',            desc: 'Los usuarios guardan productos para comprar después',      hrs: 4 },
    { id: 'reviews',           label: 'Reviews y puntuaciones',     desc: 'Compradores dejan reseñas verificadas del producto',      hrs: 6 },
    { id: 'cupones',           label: 'Cupones y descuentos',       desc: 'Códigos de descuento, promociones y precios especiales',  hrs: 6 },
    { id: 'envios_calc',       label: 'Calculadora de envíos',      desc: 'Calcula el costo de envío en el checkout',                hrs: 5 },
    { id: 'compra_rapida',     label: 'Compra rápida',              desc: 'Añadir al carrito o comprar directo desde el listado',    hrs: 3 },
  ],
  sistema: [
    { id: 'dashboard_kpis', label: 'Dashboard con KPIs y gráficos',    desc: 'Métricas con gráficos de barras, líneas y torta',        hrs: 14 },
    { id: 'exportacion',    label: 'Exportación a PDF / Excel',         desc: 'Descargar reportes en PDF o planillas Excel',            hrs: 8  },
    { id: 'notif_email',    label: 'Notificaciones automáticas',        desc: 'Emails automáticos disparados por eventos del sistema',  hrs: 5  },
    { id: 'api_docs',       label: 'API REST documentada',              desc: 'Endpoints documentados con Swagger / OpenAPI',           hrs: 8  },
    { id: 'auditoria',      label: 'Log de auditoría',                  desc: 'Registro de quién hizo qué y cuándo en el sistema',     hrs: 5  },
    { id: 'notif_realtime', label: 'Notificaciones en tiempo real',     desc: 'Alertas instantáneas dentro del sistema (WebSockets)',   hrs: 8  },
  ],
  mantenimiento: [],
};

export const COMMON_FEATURES: FeatureDef[] = [
  { id: 'whatsapp_btn', label: 'Botón de WhatsApp flotante', desc: 'Acceso directo a WhatsApp desde cualquier página del sitio', hrs: 1 },
  { id: 'chat_vivo',    label: 'Chat en vivo',               desc: 'Integración con Intercom, Crisp, Tawk.to u otro servicio',  hrs: 5 },
  { id: 'buscador',     label: 'Buscador interno',           desc: 'Búsqueda de contenido dentro del sitio',                   hrs: 4 },
];

/** Derives complejidad from number of selected features (used for catalog hour lookup) */
export function complejidadFromFeatures(count: number): 'basica' | 'estandar' | 'avanzada' {
  if (count >= 5) return 'avanzada';
  if (count >= 2) return 'estandar';
  return 'basica';
}
