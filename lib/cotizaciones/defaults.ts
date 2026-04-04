import type { CatalogoItem, Condiciones, CotizacionConfig } from '@/types/cotizacion';

export const DEFAULT_CATALOG: CatalogoItem[] = [
  // ── Landing ──────────────────────────────────────────────────────────────
  {
    id: 'landing_diseno',
    nombre: 'Diseño UI/UX',
    descripcion: 'Diseño de interfaces para las páginas principales. Incluye propuesta visual, tipografía y maquetas navegables.',
    horas_basica: 8, horas_estandar: 16, horas_avanzada: 28,
  },
  {
    id: 'landing_frontend',
    nombre: 'Desarrollo frontend',
    descripcion: 'Maquetado y programación del sitio. Responsivo (móvil, tablet, escritorio). Optimización de rendimiento y SEO.',
    horas_basica: 12, horas_estandar: 20, horas_avanzada: 32,
  },
  {
    id: 'landing_produccion',
    nombre: 'Puesta en producción',
    descripcion: 'Despliegue en entorno de producción, verificación de funcionalidades y pruebas finales.',
    horas_basica: 2, horas_estandar: 2, horas_avanzada: 3,
  },

  // ── Institucional ─────────────────────────────────────────────────────────
  {
    id: 'inst_diseno',
    nombre: 'Diseño UI/UX',
    descripcion: 'Diseño completo de la identidad web y todas las secciones del sitio. Propuesta visual, componentes y guía de estilos.',
    horas_basica: 12, horas_estandar: 22, horas_avanzada: 36,
  },
  {
    id: 'inst_frontend',
    nombre: 'Desarrollo frontend',
    descripcion: 'Implementación completa del sitio con animaciones, formularios de contacto y optimización de rendimiento.',
    horas_basica: 16, horas_estandar: 28, horas_avanzada: 44,
  },
  {
    id: 'inst_produccion',
    nombre: 'Puesta en producción',
    descripcion: 'Despliegue, configuración SSL y pruebas en múltiples dispositivos y navegadores.',
    horas_basica: 2, horas_estandar: 3, horas_avanzada: 4,
  },

  // ── E-commerce ───────────────────────────────────────────────────────────
  {
    id: 'ec_diseno',
    nombre: 'Diseño UI/UX',
    descripcion: 'Diseño de tienda online: home, catálogo, detalle de producto, carrito y checkout. Experiencia de compra optimizada.',
    horas_basica: 16, horas_estandar: 28, horas_avanzada: 44,
  },
  {
    id: 'ec_frontend',
    nombre: 'Desarrollo frontend',
    descripcion: 'Implementación de todas las vistas y flujos de compra. Integración con catálogo de productos.',
    horas_basica: 20, horas_estandar: 36, horas_avanzada: 56,
  },
  {
    id: 'ec_panel',
    nombre: 'Panel de administración',
    descripcion: 'Panel de gestión de productos, pedidos y stock. Acceso protegido por usuario y contraseña.',
    horas_basica: 12, horas_estandar: 20, horas_avanzada: 32,
  },
  {
    id: 'ec_produccion',
    nombre: 'Puesta en producción',
    descripcion: 'Despliegue de la tienda, configuración SSL y pruebas de flujo completo de compra.',
    horas_basica: 3, horas_estandar: 4, horas_avanzada: 6,
  },

  // ── Sistema Web ───────────────────────────────────────────────────────────
  {
    id: 'sis_diseno',
    nombre: 'Diseño UI/UX',
    descripcion: 'Diseño completo del sistema: dashboard, módulos principales, formularios y flujos de trabajo.',
    horas_basica: 20, horas_estandar: 36, horas_avanzada: 56,
  },
  {
    id: 'sis_frontend',
    nombre: 'Desarrollo frontend',
    descripcion: 'Implementación del sistema web con gestión de estado, navegación por módulos y experiencia de usuario.',
    horas_basica: 20, horas_estandar: 40, horas_avanzada: 64,
  },
  {
    id: 'sis_backend',
    nombre: 'Desarrollo backend',
    descripcion: 'Lógica de negocio, procesamiento de datos, autenticación y autorización de usuarios.',
    horas_basica: 16, horas_estandar: 32, horas_avanzada: 56,
  },
  {
    id: 'sis_db_api',
    nombre: 'Base de datos y API REST',
    descripcion: 'Diseño de esquema de base de datos, endpoints REST y documentación de la API.',
    horas_basica: 8, horas_estandar: 16, horas_avanzada: 24,
  },
  {
    id: 'sis_produccion',
    nombre: 'Puesta en producción',
    descripcion: 'Despliegue en cloud, configuración de entorno, monitoreo y pruebas de integración.',
    horas_basica: 4, horas_estandar: 6, horas_avanzada: 8,
  },

  // ── Mantenimiento ─────────────────────────────────────────────────────────
  {
    id: 'mant_diagnostico',
    nombre: 'Diagnóstico y auditoría',
    descripcion: 'Evaluación del estado actual del sitio, identificación de problemas y propuesta de mejoras.',
    horas_basica: 4, horas_estandar: 4, horas_avanzada: 4,
  },
  {
    id: 'mant_trabajo',
    nombre: 'Desarrollo y correcciones',
    descripcion: 'Implementación de mejoras, corrección de errores y actualizaciones según el diagnóstico.',
    horas_basica: 8, horas_estandar: 16, horas_avanzada: 28,
  },

  // ── Opcionales transversales ──────────────────────────────────────────────
  {
    id: 'opt_contenido',
    nombre: 'Redacción de contenido',
    descripcion: 'Redacción de textos para todas las secciones: inicio, servicios, acerca de y contacto.',
    horas_basica: 4, horas_estandar: 8, horas_avanzada: 12,
  },
  {
    id: 'opt_logo',
    nombre: 'Diseño de identidad básica',
    descripcion: 'Diseño de logotipo y paleta de colores básica para el proyecto.',
    horas_basica: 6, horas_estandar: 8, horas_avanzada: 10,
  },
  {
    id: 'opt_hosting',
    nombre: 'Configuración dominio y hosting',
    descripcion: 'Registro de dominio, configuración DNS, certificado SSL y puesta en marcha del hosting.',
    horas_basica: 2, horas_estandar: 2, horas_avanzada: 2,
  },

  // ── Integraciones ─────────────────────────────────────────────────────────
  {
    id: 'integ_formularios',
    nombre: 'Integración de formularios',
    descripcion: 'Formularios de contacto, cotización o registro con validación y notificaciones por email.',
    horas_basica: 2, horas_estandar: 3, horas_avanzada: 4,
  },
  {
    id: 'integ_pagos',
    nombre: 'Pasarela de pago',
    descripcion: 'Integración con pasarela de pago (MercadoPago, Stripe u otra). Flujo completo de cobro y confirmación.',
    horas_basica: 8, horas_estandar: 10, horas_avanzada: 14,
  },
  {
    id: 'integ_reservas',
    nombre: 'Sistema de reservas',
    descripcion: 'Módulo de agendamiento online con gestión de turnos, confirmaciones y notificaciones.',
    horas_basica: 6, horas_estandar: 8, horas_avanzada: 12,
  },
  {
    id: 'integ_mapa',
    nombre: 'Integración de mapa',
    descripcion: 'Mapa interactivo con ubicación, marcadores personalizados y dirección del negocio.',
    horas_basica: 1, horas_estandar: 2, horas_avanzada: 2,
  },
  {
    id: 'integ_otro',
    nombre: 'Integración personalizada',
    descripcion: 'Integración con API externa o servicio de terceros según requerimiento del cliente.',
    horas_basica: 4, horas_estandar: 6, horas_avanzada: 8,
  },
];

export const DEFAULT_CONDITIONS: Condiciones = {
  pago: '50% al confirmar el proyecto · 50% contra entrega final.',
  entrega: 'El plazo comenzará a correr desde la confirmación del proyecto y recepción del material.',
  revisiones: 'Hasta 2 rondas de ajustes por módulo sin costo adicional.',
  soporte: '30 días de soporte gratuito para corrección de errores tras la entrega.',
  ip: 'El código pasa a ser propiedad del cliente una vez liquidado el pago total.',
  respuesta: 'Respuesta a consultas en máximo 24 horas hábiles.',
};

export const DEFAULT_CONFIG: CotizacionConfig = {
  id: 1,
  tarifa_hora_uyu: 800,
  tarifa_hora_usd: 20,
  mult_urgencia: 1.3,
  mult_sin_brief: 1.15,
  empresa_nombre: 'Ceibo Labs',
  empresa_email: 'info@ceibolabs.dev',
  empresa_rut: null,
  condiciones_default: DEFAULT_CONDITIONS,
  catalogo: DEFAULT_CATALOG,
};
