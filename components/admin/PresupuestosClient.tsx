'use client';

import { useState, useEffect } from 'react';
import { Printer, RotateCcw } from 'lucide-react';

interface Item {
  id: number;
  svc: string;
  desc: string;
  hrs: number;
  price: number; // used when showHoras = false
}

let _nextId = 1;

const DEFAULT_ITEMS: Omit<Item, 'id'>[] = [
  { svc: 'Diseño UI/UX',                desc: 'Diseño de interfaces para páginas principales (inicio, catálogo, detalle de producto y contacto). Incluye propuesta visual, tipografía y maquetas navegables.',                                                                                                                              hrs: 2, price: 40  },
  { svc: 'Desarrollo Frontend',         desc: 'Maquetado y programación de todas las vistas. Sitio responsivo (móvil, tablet y escritorio). Optimización básica de velocidad y SEO.',                                                                                                                                                     hrs: 5, price: 100 },
  { svc: 'Panel de Administración',     desc: 'Panel web integrado para gestión de productos: agregar, editar, eliminar y ordenar. Acceso protegido con usuario y contraseña.',                                                                                                                                                            hrs: 7, price: 140 },
  { svc: 'Catálogo de Productos',       desc: 'Configuración y carga inicial del catálogo de productos, incluyendo hasta 30 artículos con su respectiva categorización, imágenes, título, descripción y organización dentro del sitio para una correcta visualización y navegación.',                                                      hrs: 2, price: 40  },
  { svc: 'Despliegue y Publicación',    desc: 'Configuración de servidor, dominio y certificado SSL. Puesta en producción y pruebas. Incluye 1 mes de alojamiento.',                                                                                                                                                                      hrs: 2, price: 40  },
  { svc: 'Pruebas y Control de Calidad', desc: 'Pruebas completas del sitio web en distintos dispositivos y navegadores. Verificación de enlaces, formularios, rendimiento básico y correcto funcionamiento del panel de administración antes de la publicación.',                                                                          hrs: 2, price: 40  },
];

type Moneda = 'USD' | 'UYU' | 'EUR';

const DEFAULT_STATE = {
  numero: 'OL-2026-004', vigencia: '30 días',
  cliente: '', proveedor: 'Oriental Labs', provDesc: 'Equipo de desarrollo de software',
  descProj: '', tarifa: 20, moneda: 'USD' as Moneda, descuento: 0,
  showFirmas: true, showHoras: true,
  notas: `**Contenido proporcionado por el cliente:** El cliente deberá proporcionar los textos, imágenes, logotipo, datos de contacto y cualquier otro material necesario para completar el sitio web.

**Alcance del proyecto:** El presupuesto incluye únicamente las funcionalidades y módulos detallados en este documento. Cualquier desarrollo, integración o modificación adicional será cotizado por separado.

**Hosting y base de datos:** El proyecto incluye hosting y base de datos por un período de **12 meses** para el correcto funcionamiento del sitio web.

**Plazo estimado de entrega:** El tiempo estimado de desarrollo es de **7 a 10 días hábiles** desde el inicio del proyecto y la recepción del material necesario por parte del cliente. Los tiempos pueden variar dependiendo de los tiempos de respuesta y aprobación del cliente.

**Inicio del proyecto:** El desarrollo del proyecto comenzará **una vez recibido el pago inicial** correspondiente.`,
  cPago: '50% al confirmar el proyecto · 50% contra entrega final.',
  cEntrega: '7 a 10 días hábiles a partir de la confirmación del proyecto.',
  cRevisiones: 'Hasta 2 rondas de ajustes por módulo sin costo adicional.',
  cSoporte: '30 días de soporte gratuito para corrección de errores.',
  cIp: 'El código pasa a ser propiedad del cliente una vez liquidado el pago total.',
  cRespuesta: 'Respuesta a consultas en máximo 24 horas hábiles.',
  email: 'info@orientalabs.dev',
};

function fechaHoy() {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date();
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function fmtHrs(h: number) {
  return (h % 1 === 0 ? h.toFixed(0) : String(h)) + ' h';
}

function fmtMoney(n: number, moneda: Moneda) {
  if (moneda === 'UYU') return '$U\u00a0' + n.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (moneda === 'EUR') return '€' + n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mdToHtml(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function buildPrintHTML(data: {
  numero: string; fecha: string; vigencia: string;
  cliente: string; proveedor: string; provDesc: string;
  descProj: string; tarifa: number; moneda: Moneda; descuento: number;
  items: Item[]; showFirmas: boolean; showHoras: boolean; notas: string;
  cPago: string; cEntrega: string; cRevisiones: string; cSoporte: string; cIp: string; cRespuesta: string;
  email: string;
}) {
  const { numero, fecha, vigencia, cliente, proveedor, provDesc, descProj,
          tarifa, moneda, descuento, items, showFirmas, showHoras, notas,
          cPago, cEntrega, cRevisiones, cSoporte, cIp, cRespuesta, email } = data;

  const fmt = (n: number) => fmtMoney(n, moneda);
  const validItems = items.filter(i => i.svc);

  const subtotal = showHoras
    ? validItems.reduce((a, i) => a + (i.hrs || 0), 0) * tarifa
    : validItems.reduce((a, i) => a + (i.price || 0), 0);
  const totalHrs    = showHoras ? validItems.reduce((a, i) => a + (i.hrs || 0), 0) : 0;
  const descImporte = subtotal * (descuento / 100);
  const total       = subtotal - descImporte;

  const itemRows = showHoras
    ? validItems.map(it => `
    <tr>
      <td class="svc">${esc(it.svc)}</td>
      <td class="desc">${mdToHtml(it.desc)}</td>
      <td class="hrs">${fmtHrs(it.hrs)}</td>
      <td class="r">${fmt(tarifa)}</td>
      <td class="bold">${fmt(it.hrs * tarifa)}</td>
    </tr>`).join('')
    : validItems.map(it => `
    <tr>
      <td class="svc">${esc(it.svc)}</td>
      <td class="desc">${mdToHtml(it.desc)}</td>
      <td class="bold">${fmt(it.price || 0)}</td>
    </tr>`).join('');

  const theadRow = showHoras
    ? `<tr><th style="width:22%">SERVICIO</th><th style="width:44%">DESCRIPCIÓN</th><th class="c" style="width:9%">HORAS</th><th class="r" style="width:11%">TARIFA/H</th><th class="r" style="width:14%">TOTAL</th></tr>`
    : `<tr><th style="width:28%">SERVICIO</th><th style="width:57%">DESCRIPCIÓN</th><th class="r" style="width:15%">PRECIO</th></tr>`;

  const cols = showHoras ? 4 : 2;

  const subtotalRow = showHoras
    ? `<tr class="row-sub"><td colspan="2">Total: ${fmtHrs(totalHrs)} horas</td><td colspan="2" style="text-align:right">Subtotal</td><td style="text-align:right">${fmt(subtotal)}</td></tr>`
    : descuento > 0
      ? `<tr class="row-sub"><td colspan="2" style="text-align:right">Subtotal</td><td style="text-align:right">${fmt(subtotal)}</td></tr>`
      : '';

  const descuentoRow = descuento > 0 ? `
    <tr class="row-sub">
      <td colspan="${cols}" style="text-align:right">Descuento (${descuento}%)</td>
      <td style="text-align:right;color:#c00">-${fmt(descImporte)}</td>
    </tr>` : '';

  const totalRow = `
    <tr class="row-total">
      <td colspan="${cols}" class="total-label">TOTAL DEL PROYECTO</td>
      <td class="total-value">${fmt(total)} ${moneda}</td>
    </tr>`;

  const conditions: [string, string][] = [
    ['Forma de pago', cPago], ['Plazo de entrega', cEntrega], ['Revisiones incluidas', cRevisiones],
    ['Soporte post-entrega', cSoporte], ['Propiedad intelectual', cIp],
    ['Tiempo de respuesta', cRespuesta],
  ].filter(([, v]) => v) as [string, string][];

  const condHTML = conditions.map(([k, v]) => `<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('');

  const firmasHTML = showFirmas ? `
  <div class="doc-section">
    <div class="doc-section-title">Aceptación del Presupuesto</div>
    <p style="font-size:8pt;color:#888;margin-bottom:4mm">Al firmar, ambas partes aceptan los servicios, costos y condiciones descritos en este documento.</p>
    <div class="doc-firmas">
      <div class="firma-box"><div class="firma-space"></div>
        <div class="firma-line"><div class="firma-name">${esc(cliente || 'Cliente')}</div><div class="firma-role">Cliente — firma y fecha</div></div>
      </div>
      <div class="firma-box"><div class="firma-space"></div>
        <div class="firma-line"><div class="firma-name">${esc(proveedor || 'Oriental Labs')}</div><div class="firma-role">Proveedor — firma</div></div>
      </div>
    </div>
  </div>` : '';

  const notasHTML = notas.trim() ? `
  <div class="doc-section">
    <div class="doc-section-title">Notas</div>
    <p>${mdToHtml(notas.trim())}</p>
  </div>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Presupuesto ${esc(numero)} — ${esc(proveedor)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Helvetica, Arial, sans-serif; background: white; color: #333; }
  .doc { width: 210mm; margin: 0 auto; padding: 10mm 15mm 10mm; font-size: 9pt; line-height: 1.5; }

  .doc-header { background: #111; color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; margin-bottom: 4mm; }
  .doc-header .name { font-size: 20pt; font-weight: bold; color: #fff; line-height: 1.1; }
  .doc-header .sub  { font-size: 9pt; color: #bbb; margin-top: 2px; }
  .doc-header .right { text-align: right; font-size: 8.5pt; color: #bbb; line-height: 1.7; }
  .doc-header .vigencia { font-style: italic; font-size: 8pt; color: #999; }

  .doc-partes { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-bottom: 4mm; }
  .parte-box { border: 0.8px solid #ccc; padding: 4mm 5mm; }
  .parte-box .etiqueta { font-size: 7pt; font-weight: bold; text-transform: uppercase; letter-spacing: .8px; color: #888; margin-bottom: 3px; }
  .parte-box .nombre   { font-size: 11pt; font-weight: bold; color: #111; line-height: 1.2; }
  .parte-box .detalle  { font-size: 8pt; color: #888; margin-top: 1px; }

  .doc-section { margin-bottom: 3.5mm; }
  .doc-section-title { font-size: 10pt; font-weight: bold; color: #111; margin-bottom: 2mm; padding-bottom: 1.5mm; border-bottom: 0.5px solid #ccc; }
  .doc-section p { font-size: 9pt; color: #444; line-height: 1.55; }

  .doc-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  .doc-table thead tr { background: #111; color: #fff; }
  .doc-table thead th { padding: 6px 4px; text-align: left; font-weight: bold; font-size: 8pt; }
  .doc-table thead th.r { text-align: right; }
  .doc-table thead th.c { text-align: center; }
  .doc-table tbody tr:nth-child(odd)  { background: #f2f2f2; }
  .doc-table tbody tr:nth-child(even) { background: #fff; }
  .doc-table tbody td { padding: 5px 4px; vertical-align: middle; }
  .doc-table tbody td.svc  { font-weight: bold; color: #111; font-size: 8.5pt; white-space: nowrap; }
  .doc-table tbody td.desc { font-size: 8pt; color: #777; line-height: 1.4; }
  .doc-table tbody td.hrs  { text-align: center; white-space: nowrap; }
  .doc-table tbody td.r    { text-align: right; white-space: nowrap; }
  .doc-table tbody td.bold { text-align: right; font-weight: bold; color: #111; white-space: nowrap; }
  .row-sub td { border-top: 0.5px solid #ccc; padding: 5px 4px; font-size: 8.5pt; color: #888; font-style: italic; background: #fff !important; }
  .row-total { background: #111 !important; }
  .row-total td { padding: 8px 4px; color: #fff; font-weight: bold; }
  .total-label { text-align: right; font-size: 10pt; white-space: nowrap; }
  .total-value { text-align: right; font-size: 13pt; white-space: nowrap; }

  .conditions-box { border: 0.8px solid #ccc; padding: 4mm 5mm; }
  .conditions-box p { margin-bottom: 4px; font-size: 8.5pt; color: #444; line-height: 1.5; }
  .conditions-box p:last-child { margin-bottom: 0; }

  .doc-firmas { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 2mm; }
  .firma-box { text-align: center; }
  .firma-space { height: 10mm; }
  .firma-line { border-top: 0.8px solid #111; padding-top: 4px; }
  .firma-name { font-size: 9pt; font-weight: bold; color: #111; }
  .firma-role { font-size: 7.5pt; color: #888; }

  .doc-footer { border-top: 0.3px solid #ccc; margin-top: 3mm; padding-top: 2mm; text-align: center; font-size: 7.5pt; color: #888; }

  @page { size: A4 portrait; margin: 10mm 15mm 10mm; }
  @media print {
    body { background: white; margin: 0; padding: 0; }
    .doc { width: 100%; padding: 0; box-shadow: none; margin: 0; }
  }
</style>
</head>
<body>
<div class="doc">

  <div class="doc-header">
    <div class="left">
      <div class="name">${esc(proveedor || 'Oriental Labs')}</div>
      ${provDesc ? `<div class="sub">${esc(provDesc)}</div>` : ''}
    </div>
    <div class="right">
      Fecha: ${esc(fecha)}<br>
      Presupuesto N°: ${esc(numero)}<br>
      <span class="vigencia">Vigencia: ${esc(vigencia)}</span>
    </div>
  </div>

  <div class="doc-partes">
    <div class="parte-box">
      <div class="etiqueta">Cliente</div>
      <div class="nombre">${esc(cliente || 'Cliente')}</div>
    </div>
    <div class="parte-box">
      <div class="etiqueta">Proveedor</div>
      <div class="nombre">${esc(proveedor || 'Oriental Labs')}</div>
      ${provDesc ? `<div class="detalle">${esc(provDesc)}</div>` : ''}
    </div>
  </div>

  ${descProj ? `
  <div class="doc-section">
    <div class="doc-section-title">Descripción del Proyecto</div>
    <p>${mdToHtml(descProj)}</p>
  </div>` : ''}

  <div class="doc-section">
    <div class="doc-section-title">Desglose de Servicios</div>
    <table class="doc-table">
      <thead>${theadRow}</thead>
      <tbody>
        ${itemRows}
        ${subtotalRow}
        ${descuentoRow}
        ${totalRow}
      </tbody>
    </table>
  </div>

  ${condHTML ? `
  <div class="doc-section">
    <div class="doc-section-title">Términos y Condiciones</div>
    <div class="conditions-box">${condHTML}</div>
  </div>` : ''}

  ${firmasHTML}
  ${notasHTML}

  <div class="doc-footer">
    ${esc(proveedor || 'Oriental Labs')} · ${esc(email)} · Presupuesto válido por ${esc(vigencia)} a partir de la fecha de emisión
  </div>

</div>
<script>
  window.onload = function() {
    window.print();
    window.onafterprint = function() { window.close(); };
  };
<\/script>
</body>
</html>`;
}

export function PresupuestosClient() {
  const [numero,     setNumero]     = useState(DEFAULT_STATE.numero);
  const [fecha,      setFecha]      = useState('');
  const [vigencia,   setVigencia]   = useState(DEFAULT_STATE.vigencia);
  const [cliente,    setCliente]    = useState(DEFAULT_STATE.cliente);
  const [proveedor,  setProveedor]  = useState(DEFAULT_STATE.proveedor);
  const [provDesc,   setProvDesc]   = useState(DEFAULT_STATE.provDesc);
  const [descProj,   setDescProj]   = useState(DEFAULT_STATE.descProj);
  const [tarifa,     setTarifa]     = useState(DEFAULT_STATE.tarifa);
  const [moneda,     setMoneda]     = useState<Moneda>(DEFAULT_STATE.moneda);
  const [descuento,  setDescuento]  = useState(DEFAULT_STATE.descuento);
  const [showFirmas, setShowFirmas] = useState(DEFAULT_STATE.showFirmas);
  const [showHoras,  setShowHoras]  = useState(DEFAULT_STATE.showHoras);
  const [notas,      setNotas]      = useState(DEFAULT_STATE.notas);
  const [items,      setItems]      = useState<Item[]>([]);
  const [cPago,       setCPago]       = useState(DEFAULT_STATE.cPago);
  const [cEntrega,    setCEntrega]    = useState(DEFAULT_STATE.cEntrega);
  const [cRevisiones, setCRevisiones] = useState(DEFAULT_STATE.cRevisiones);
  const [cSoporte,    setCSoporte]    = useState(DEFAULT_STATE.cSoporte);
  const [cIp,         setCIp]         = useState(DEFAULT_STATE.cIp);
  const [cRespuesta,  setCRespuesta]  = useState(DEFAULT_STATE.cRespuesta);
  const [email,      setEmail]      = useState(DEFAULT_STATE.email);

  const initItems = () => DEFAULT_ITEMS.map(i => ({ ...i, id: _nextId++ }));

  useEffect(() => {
    setFecha(fechaHoy());
    setItems(initItems());
  }, []);

  const resetForm = () => {
    setNumero(DEFAULT_STATE.numero);
    setFecha(fechaHoy());
    setVigencia(DEFAULT_STATE.vigencia);
    setCliente(DEFAULT_STATE.cliente);
    setProveedor(DEFAULT_STATE.proveedor);
    setProvDesc(DEFAULT_STATE.provDesc);
    setDescProj(DEFAULT_STATE.descProj);
    setTarifa(DEFAULT_STATE.tarifa);
    setMoneda(DEFAULT_STATE.moneda);
    setDescuento(DEFAULT_STATE.descuento);
    setShowFirmas(DEFAULT_STATE.showFirmas);
    setShowHoras(DEFAULT_STATE.showHoras);
    setNotas(DEFAULT_STATE.notas);
    setItems(initItems());
    setCPago(DEFAULT_STATE.cPago);
    setCEntrega(DEFAULT_STATE.cEntrega);
    setCRevisiones(DEFAULT_STATE.cRevisiones);
    setCSoporte(DEFAULT_STATE.cSoporte);
    setCIp(DEFAULT_STATE.cIp);
    setCRespuesta(DEFAULT_STATE.cRespuesta);
    setEmail(DEFAULT_STATE.email);
  };

  const toggleHoras = () => {
    if (showHoras) {
      // switching to fixed price: pre-fill prices from hrs × tarifa
      setItems(prev => prev.map(i => ({ ...i, price: Math.round(i.hrs * tarifa) })));
    }
    setShowHoras(v => !v);
  };

  const addItem = () => setItems(prev => [...prev, { id: _nextId++, svc: '', desc: '', hrs: 0, price: 0 }]);
  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof Omit<Item, 'id'>, value: string | number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const handlePrint = () => {
    const html = buildPrintHTML({
      numero, fecha, vigencia, cliente, proveedor, provDesc,
      descProj, tarifa, moneda, descuento, items, showFirmas, showHoras, notas,
      cPago, cEntrega, cRevisiones, cSoporte, cIp, cRespuesta, email,
    });
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const fmt = (n: number) => fmtMoney(n, moneda);
  const validItems   = items.filter(i => i.svc);
  const subtotal     = showHoras
    ? validItems.reduce((a, i) => a + (i.hrs || 0), 0) * tarifa
    : validItems.reduce((a, i) => a + (i.price || 0), 0);
  const totalHrs     = showHoras ? validItems.reduce((a, i) => a + (i.hrs || 0), 0) : 0;
  const descImporte  = subtotal * (descuento / 100);
  const total        = subtotal - descImporte;

  const conditions: [string, string][] = [
    ['Forma de pago', cPago], ['Plazo de entrega', cEntrega], ['Revisiones incluidas', cRevisiones],
    ['Soporte post-entrega', cSoporte], ['Propiedad intelectual', cIp],
    ['Tiempo de respuesta', cRespuesta],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── PANEL ── */}
      <aside className="w-[360px] shrink-0 border-r border-slate-200 dark:border-navy-700/50 bg-white dark:bg-navy-950 overflow-y-auto flex flex-col">
        <div className="bg-slate-900 dark:bg-navy-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold tracking-wide">Generador de Presupuesto</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Oriental Labs · Equipo de desarrollo</p>
          </div>
          <button onClick={resetForm} title="Limpiar formulario"
            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10">
            <RotateCcw size={12} />
            Limpiar
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">

          <FieldGroup title="Documento">
            <Field label="N° de Presupuesto">
              <input value={numero} onChange={e => setNumero(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Fecha">
              <input value={fecha} onChange={e => setFecha(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Vigencia">
              <input value={vigencia} onChange={e => setVigencia(e.target.value)} className={inputCls} />
            </Field>
          </FieldGroup>

          <FieldGroup title="Partes">
            <Field label="Nombre del Cliente">
              <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej. Muebles Rústicos" className={inputCls} />
            </Field>
            <Field label="Nombre del Proveedor">
              <input value={proveedor} onChange={e => setProveedor(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Descripción del Proveedor">
              <input value={provDesc} onChange={e => setProvDesc(e.target.value)} className={inputCls} />
            </Field>
          </FieldGroup>

          <FieldGroup title="Proyecto">
            <Field label="Descripción del Proyecto">
              <textarea rows={3} value={descProj} onChange={e => setDescProj(e.target.value)}
                placeholder="Describe brevemente el proyecto..." className={`${inputCls} resize-y`} />
              <p className="text-[10px] text-slate-400 dark:text-slate-600 -mt-1">Soporta <strong>**negrita**</strong> y <em>*itálica*</em></p>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={showHoras ? 'Tarifa / hora' : 'Tarifa / hora (ref.)'}>
                <input type="number" min={1} step={1} value={tarifa}
                  onChange={e => setTarifa(parseFloat(e.target.value) || 0)} className={inputCls} />
              </Field>
              <Field label="Moneda">
                <select value={moneda} onChange={e => setMoneda(e.target.value as Moneda)} className={inputCls}>
                  <option value="USD">USD ($)</option>
                  <option value="UYU">UYU ($U)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </Field>
            </div>
            <Field label="Descuento (%)">
              <input type="number" min={0} max={100} step={1} value={descuento}
                onChange={e => setDescuento(parseFloat(e.target.value) || 0)} className={inputCls} />
            </Field>
            {/* Toggles */}
            <div className="flex flex-col gap-2 pt-1">
              <Toggle label="Mostrar columna de horas" checked={showHoras} onChange={toggleHoras} />
              <Toggle label="Sección de firmas" checked={showFirmas} onChange={() => setShowFirmas(v => !v)} />
            </div>
          </FieldGroup>

          <FieldGroup title="Servicios">
            <div className="flex flex-col gap-2.5">
              {items.map((item, idx) => (
                <div key={item.id} className="border border-slate-200 dark:border-navy-700/60 rounded-lg p-3 bg-slate-50 dark:bg-navy-900">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Servicio {idx + 1}</span>
                    <button onClick={() => removeItem(item.id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 text-base leading-none px-1 transition-colors">✕</button>
                  </div>
                  <Field label="Nombre del servicio">
                    <input value={item.svc} onChange={e => updateItem(item.id, 'svc', e.target.value)}
                      placeholder="Ej. Diseño UI/UX" className={inputCls} />
                  </Field>
                  <div className="mt-1.5">
                    <Field label="Descripción">
                      <textarea rows={2} value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)}
                        className={`${inputCls} resize-y`} />
                    </Field>
                  </div>
                  <div className="mt-1.5 w-1/2">
                    {showHoras ? (
                      <Field label="Horas">
                        <input type="number" min={0} step={0.25} value={item.hrs}
                          onChange={e => updateItem(item.id, 'hrs', parseFloat(e.target.value) || 0)} className={inputCls} />
                      </Field>
                    ) : (
                      <Field label={`Precio (${moneda})`}>
                        <input type="number" min={0} step={1} value={item.price}
                          onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className={inputCls} />
                      </Field>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addItem}
                className="w-full py-2.5 border border-dashed border-slate-300 dark:border-navy-600 rounded-lg text-slate-400 dark:text-slate-500 text-xs hover:border-slate-500 dark:hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                + Agregar servicio
              </button>
            </div>
          </FieldGroup>

          <FieldGroup title="Términos y Condiciones">
            <Field label="Forma de pago"><input value={cPago} onChange={e => setCPago(e.target.value)} className={inputCls} /></Field>
            <Field label="Plazo de entrega"><input value={cEntrega} onChange={e => setCEntrega(e.target.value)} className={inputCls} /></Field>
            <Field label="Revisiones incluidas"><input value={cRevisiones} onChange={e => setCRevisiones(e.target.value)} className={inputCls} /></Field>
            <Field label="Soporte post-entrega"><input value={cSoporte} onChange={e => setCSoporte(e.target.value)} className={inputCls} /></Field>
            <Field label="Propiedad intelectual"><input value={cIp} onChange={e => setCIp(e.target.value)} className={inputCls} /></Field>
            <Field label="Tiempo de respuesta"><input value={cRespuesta} onChange={e => setCRespuesta(e.target.value)} className={inputCls} /></Field>
          </FieldGroup>

          <FieldGroup title="Notas adicionales">
            <textarea rows={3} value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Texto libre que aparecerá antes del pie de página..."
              className={`${inputCls} resize-y`} />
            <p className="text-[10px] text-slate-400 dark:text-slate-600 -mt-1">
              {notas.trim() === '' ? 'Dejar vacío para no incluir en el documento. ' : ''}
              Soporta <strong>**negrita**</strong> y <em>*itálica*</em>
            </p>
          </FieldGroup>

          <FieldGroup title="Pie de página">
            <Field label="Email de contacto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
            </Field>
          </FieldGroup>

          <button onClick={handlePrint}
            className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-lg py-3 transition-colors">
            <Printer size={14} />
            Imprimir / Guardar PDF
          </button>
        </div>
      </aside>

      {/* ── PREVIEW ── */}
      <main className="flex-1 bg-slate-200 dark:bg-[#1a1a24] overflow-y-auto flex flex-col items-center py-8 px-8 gap-4">
        <div className="flex items-center justify-between w-full" style={{ maxWidth: '210mm' }}>
          <span className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Vista previa del documento</span>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 rounded-lg px-3 py-1.5 transition-colors">
            <Printer size={12} />
            Guardar PDF
          </button>
        </div>

        {/* Documento A4 */}
        <div style={{ width: '210mm', background: '#fff', boxShadow: '0 2px 24px rgba(0,0,0,0.22)', padding: '10mm 15mm 10mm', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '9pt', color: '#333', lineHeight: 1.5 }}>

          {/* Header */}
          <div style={{ background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', marginBottom: '4mm' }}>
            <div>
              <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#fff', lineHeight: 1.1 }}>{proveedor || 'Oriental Labs'}</div>
              {provDesc && <div style={{ fontSize: '9pt', color: '#bbb', marginTop: 2 }}>{provDesc}</div>}
            </div>
            <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#bbb', lineHeight: 1.7 }}>
              Fecha: {fecha}<br />
              Presupuesto N°: {numero}<br />
              <span style={{ fontStyle: 'italic', fontSize: '8pt', color: '#999' }}>Vigencia: {vigencia}</span>
            </div>
          </div>

          {/* Partes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3mm', marginBottom: '4mm' }}>
            <div style={{ border: '0.8px solid #ccc', padding: '4mm 5mm' }}>
              <div style={{ fontSize: '7pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#888', marginBottom: 3 }}>Cliente</div>
              <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#111', lineHeight: 1.2 }}>{cliente || 'Cliente'}</div>
            </div>
            <div style={{ border: '0.8px solid #ccc', padding: '4mm 5mm' }}>
              <div style={{ fontSize: '7pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#888', marginBottom: 3 }}>Proveedor</div>
              <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#111', lineHeight: 1.2 }}>{proveedor || 'Oriental Labs'}</div>
              {provDesc && <div style={{ fontSize: '8pt', color: '#888', marginTop: 1 }}>{provDesc}</div>}
            </div>
          </div>

          {/* Descripción */}
          {descProj && (
            <div style={{ marginBottom: '3.5mm' }}>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#111', marginBottom: '2mm', paddingBottom: '1.5mm', borderBottom: '0.5px solid #ccc' }}>Descripción del Proyecto</div>
              <p style={{ fontSize: '9pt', color: '#444', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: mdToHtml(descProj) }} />
            </div>
          )}

          {/* Tabla */}
          <div style={{ marginBottom: '3.5mm' }}>
            <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#111', marginBottom: '2mm', paddingBottom: '1.5mm', borderBottom: '0.5px solid #ccc' }}>Desglose de Servicios</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
              <thead>
                <tr style={{ background: '#111', color: '#fff' }}>
                  <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 'bold', fontSize: '8pt', width: showHoras ? '22%' : '28%' }}>SERVICIO</th>
                  <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 'bold', fontSize: '8pt', width: showHoras ? '44%' : '57%' }}>DESCRIPCIÓN</th>
                  {showHoras && <>
                    <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '8pt', width: '9%' }}>HORAS</th>
                    <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold', fontSize: '8pt', width: '11%' }}>TARIFA/H</th>
                  </>}
                  <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold', fontSize: '8pt', width: showHoras ? '14%' : '15%' }}>{showHoras ? 'TOTAL' : 'PRECIO'}</th>
                </tr>
              </thead>
              <tbody>
                {validItems.map((item, idx) => (
                  <tr key={item.id} style={{ background: idx % 2 === 0 ? '#f2f2f2' : '#fff' }}>
                    <td style={{ padding: '5px 4px', fontWeight: 'bold', color: '#111', fontSize: '8.5pt', whiteSpace: 'nowrap' }}>{item.svc}</td>
                    <td style={{ padding: '5px 4px', fontSize: '8pt', color: '#777', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: mdToHtml(item.desc) }} />
                    {showHoras && <>
                      <td style={{ padding: '5px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{fmtHrs(item.hrs)}</td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(tarifa)}</td>
                    </>}
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 'bold', color: '#111', whiteSpace: 'nowrap' }}>
                      {showHoras ? fmt(item.hrs * tarifa) : fmt(item.price || 0)}
                    </td>
                  </tr>
                ))}
                {/* Subtotal row */}
                {(showHoras || descuento > 0) && (
                  <tr style={{ borderTop: '0.5px solid #ccc', background: '#fff' }}>
                    {showHoras
                      ? <><td colSpan={2} style={{ padding: '5px 4px', fontSize: '8.5pt', color: '#888', fontStyle: 'italic' }}>Total: {fmtHrs(totalHrs)} horas</td>
                          <td colSpan={2} style={{ padding: '5px 4px', textAlign: 'right', fontSize: '8.5pt', color: '#888' }}>Subtotal</td></>
                      : <td colSpan={2} style={{ padding: '5px 4px', textAlign: 'right', fontSize: '8.5pt', color: '#888' }}>Subtotal</td>
                    }
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '8.5pt', color: '#888' }}>{fmt(subtotal)}</td>
                  </tr>
                )}
                {/* Descuento */}
                {descuento > 0 && (
                  <tr style={{ background: '#fff' }}>
                    <td colSpan={showHoras ? 4 : 2} style={{ padding: '5px 4px', textAlign: 'right', fontSize: '8.5pt', color: '#888', fontStyle: 'italic' }}>Descuento ({descuento}%)</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontSize: '8.5pt', color: '#c00', fontStyle: 'italic', whiteSpace: 'nowrap' }}>-{fmt(descImporte)}</td>
                  </tr>
                )}
                {/* Total */}
                <tr style={{ background: '#111' }}>
                  <td colSpan={showHoras ? 4 : 2} style={{ padding: '8px 4px', color: '#fff', fontWeight: 'bold', textAlign: 'right', fontSize: '10pt' }}>TOTAL DEL PROYECTO</td>
                  <td style={{ padding: '8px 4px', color: '#fff', fontWeight: 'bold', textAlign: 'right', fontSize: '13pt', whiteSpace: 'nowrap' }}>{fmt(total)} {moneda}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Condiciones */}
          {conditions.length > 0 && (
            <div style={{ marginBottom: '3.5mm' }}>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#111', marginBottom: '2mm', paddingBottom: '1.5mm', borderBottom: '0.5px solid #ccc' }}>Términos y Condiciones</div>
              <div style={{ border: '0.8px solid #ccc', padding: '4mm 5mm' }}>
                {conditions.map(([k, v], i) => (
                  <p key={i} style={{ marginBottom: i < conditions.length - 1 ? 4 : 0, fontSize: '8.5pt', color: '#444', lineHeight: 1.5 }}>
                    <b>{k}:</b> {v}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Firmas */}
          {showFirmas && (
            <div style={{ marginBottom: '3.5mm' }}>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#111', marginBottom: '2mm', paddingBottom: '1.5mm', borderBottom: '0.5px solid #ccc' }}>Aceptación del Presupuesto</div>
              <p style={{ fontSize: '8pt', color: '#888', marginBottom: '4mm' }}>Al firmar, ambas partes aceptan los servicios, costos y condiciones descritos en este documento.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm' }}>
                {[{ name: cliente || 'Cliente', role: 'Cliente — firma y fecha' }, { name: proveedor || 'Oriental Labs', role: 'Proveedor — firma' }].map(({ name, role }) => (
                  <div key={role} style={{ textAlign: 'center' }}>
                    <div style={{ height: '10mm' }} />
                    <div style={{ borderTop: '0.8px solid #111', paddingTop: 4 }}>
                      <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#111' }}>{name}</div>
                      <div style={{ fontSize: '7.5pt', color: '#888' }}>{role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {notas.trim() && (
            <div style={{ marginBottom: '3.5mm' }}>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#111', marginBottom: '2mm', paddingBottom: '1.5mm', borderBottom: '0.5px solid #ccc' }}>Notas</div>
              <p style={{ fontSize: '9pt', color: '#444', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: mdToHtml(notas) }} />
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '0.3px solid #ccc', marginTop: '3mm', paddingTop: '2mm', textAlign: 'center', fontSize: '7.5pt', color: '#888' }}>
            {proveedor || 'Oriental Labs'} · {email} · Presupuesto válido por {vigencia} a partir de la fecha de emisión
          </div>
        </div>
      </main>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</label>
      <button type="button" onClick={onChange}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-slate-800 dark:bg-white' : 'bg-slate-300 dark:bg-navy-700'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-navy-950 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1.5 border-b border-slate-100 dark:border-navy-800">{title}</div>
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

const inputCls =
  'w-full border border-slate-200 dark:border-navy-700/60 rounded bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 text-[12px] px-2.5 py-1.5 outline-none focus:border-slate-400 dark:focus:border-electric-400 transition-colors font-[inherit]';
