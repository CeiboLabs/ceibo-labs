'use client';

import type { Cotizacion } from '@/types/cotizacion';

interface Props {
  cotizacion: Cotizacion;
  empresa: {
    nombre: string;
    email: string;
    rut?: string | null;
  };
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtMoney(n: number, moneda: 'UYU' | 'USD') {
  if (moneda === 'UYU')
    return '$U\u00a0' + Math.round(n).toLocaleString('es-UY');
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const d = new Date(iso);
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function fmtHrs(h: number) {
  return (h % 1 === 0 ? h.toFixed(0) : h.toString()) + ' h';
}

// ── Document (all inline styles for print compatibility) ──────────────────────
export function QuoteDocument({ cotizacion, empresa }: Props) {
  const {
    numero, created_at, moneda, tarifa_hora, items, notas,
    descuento, mult, subtotal, total, plazo_estimado, condiciones,
    cliente_nombre, answers,
  } = cotizacion;

  const fmt = (n: number) => fmtMoney(n, moneda);
  const validItems = items.filter(i => i.svc);

  const recargo     = subtotal * (mult - 1);
  const descImporte = (subtotal + recargo) * (descuento / 100);
  const multPct     = Math.round((mult - 1) * 100);

  const conditions = [
    ['Forma de pago',         condiciones.pago],
    ['Plazo de entrega',      condiciones.entrega],
    ['Revisiones',            condiciones.revisiones],
    ['Soporte',               condiciones.soporte],
    ['Propiedad intelectual', condiciones.ip],
    ['Tiempo de respuesta',   condiciones.respuesta],
  ].filter(([, v]) => v) as [string, string][];

  // Inline style objects
  const s = {
    doc: {
      width: '210mm', margin: '0 auto', padding: '10mm 15mm',
      fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '9pt',
      color: '#333', lineHeight: 1.5, background: '#fff',
    } as React.CSSProperties,
    header: {
      background: '#111', color: '#fff', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 16px', marginBottom: '4mm',
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '10pt', fontWeight: 'bold', color: '#111',
      marginBottom: '2mm', paddingBottom: '1.5mm', borderBottom: '0.5px solid #ccc',
    } as React.CSSProperties,
    table: {
      width: '100%', borderCollapse: 'collapse' as const, fontSize: '8.5pt',
    } as React.CSSProperties,
    th: (width: string, align: 'left'|'right'|'center' = 'left') => ({
      padding: '6px 4px', textAlign: align, fontWeight: 'bold',
      fontSize: '8pt', width, background: '#111', color: '#fff',
    } as React.CSSProperties),
    td: (align: 'left'|'right'|'center' = 'left', extra?: React.CSSProperties) => ({
      padding: '5px 4px', verticalAlign: 'middle' as const, textAlign: align, ...extra,
    } as React.CSSProperties),
  };

  return (
    <div style={s.doc}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#fff', lineHeight: 1.1 }}>
            {empresa.nombre}
          </div>
          <div style={{ fontSize: '9pt', color: '#bbb', marginTop: 2 }}>
            Agencia de desarrollo de software
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#bbb', lineHeight: 1.7 }}>
          Fecha: {fmtDate(created_at)}<br />
          Presupuesto N°: {numero}<br />
          <span style={{ fontStyle: 'italic', fontSize: '8pt', color: '#999' }}>
            Vigencia: 30 días
          </span>
        </div>
      </div>

      {/* ── Parties ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3mm', marginBottom: '4mm' }}>
        {[
          { label: 'Cliente',   name: cliente_nombre || 'Cliente',  detail: null },
          { label: 'Proveedor', name: empresa.nombre, detail: empresa.rut ? `RUT: ${empresa.rut}` : null },
        ].map(({ label, name, detail }) => (
          <div key={label} style={{ border: '0.8px solid #ccc', padding: '4mm 5mm' }}>
            <div style={{ fontSize: '7pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#888', marginBottom: 3 }}>
              {label}
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#111', lineHeight: 1.2 }}>
              {name}
            </div>
            {detail && (
              <div style={{ fontSize: '8pt', color: '#888', marginTop: 1 }}>{detail}</div>
            )}
          </div>
        ))}
      </div>

      {/* ── Project description ── */}
      {answers?.descripcion && (
        <div style={{ marginBottom: '4mm' }}>
          <div style={s.sectionTitle}>Descripción del Proyecto</div>
          <p style={{ fontSize: '9pt', color: '#333', lineHeight: 1.6, margin: 0 }}>
            {answers.descripcion}
          </p>
        </div>
      )}


      {/* ── Services table ── */}
      <div style={{ marginBottom: '3.5mm' }}>
        <div style={s.sectionTitle}>Desglose de Servicios</div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th('22%')}>SERVICIO</th>
              <th style={s.th('43%')}>DESCRIPCIÓN</th>
              <th style={s.th('9%', 'center')}>HORAS</th>
              <th style={s.th('12%', 'right')}>TARIFA/H</th>
              <th style={s.th('14%', 'right')}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {validItems.map((item, idx) => (
              <tr key={item.id} style={{ background: idx % 2 === 0 ? '#f2f2f2' : '#fff' }}>
                <td style={s.td('left', { fontWeight: 'bold', color: '#111', fontSize: '8.5pt', whiteSpace: 'nowrap' })}>
                  {item.svc}
                </td>
                <td style={s.td('left', { fontSize: '8pt', color: '#777', lineHeight: 1.4 })}>
                  {item.desc}
                </td>
                <td style={s.td('center', { whiteSpace: 'nowrap' })}>{fmtHrs(item.hrs)}</td>
                <td style={s.td('right', { whiteSpace: 'nowrap' })}>{fmt(tarifa_hora)}</td>
                <td style={s.td('right', { fontWeight: 'bold', color: '#111', whiteSpace: 'nowrap' })}>
                  {fmt(item.precio)}
                </td>
              </tr>
            ))}

            {/* Subtotal */}
            <tr style={{ borderTop: '0.5px solid #ccc', background: '#fff' }}>
              <td colSpan={3} style={s.td('left', { fontSize: '8.5pt', color: '#888', fontStyle: 'italic' })}>
                Total: {fmtHrs(validItems.reduce((s, i) => s + i.hrs, 0))} horas
              </td>
              <td style={s.td('right', { fontSize: '8.5pt', color: '#888' })}>Subtotal</td>
              <td style={s.td('right', { fontSize: '8.5pt', color: '#888' })}>{fmt(subtotal)}</td>
            </tr>

            {mult > 1 && (
              <tr style={{ background: '#fff' }}>
                <td colSpan={4} style={s.td('right', { fontSize: '8.5pt', color: '#888', fontStyle: 'italic' })}>
                  Recargo aplicado (+{multPct}%)
                </td>
                <td style={s.td('right', { fontSize: '8.5pt', color: '#c60', fontStyle: 'italic', whiteSpace: 'nowrap' })}>
                  +{fmt(recargo)}
                </td>
              </tr>
            )}

            {descuento > 0 && (
              <tr style={{ background: '#fff' }}>
                <td colSpan={4} style={s.td('right', { fontSize: '8.5pt', color: '#888', fontStyle: 'italic' })}>
                  Descuento ({descuento}%)
                </td>
                <td style={s.td('right', { fontSize: '8.5pt', color: '#c00', fontStyle: 'italic', whiteSpace: 'nowrap' })}>
                  -{fmt(descImporte)}
                </td>
              </tr>
            )}

            {/* Total */}
            <tr style={{ background: '#111' }}>
              <td colSpan={4} style={{ padding: '8px 4px', color: '#fff', fontWeight: 'bold', textAlign: 'right', fontSize: '10pt' }}>
                TOTAL DEL PROYECTO
              </td>
              <td style={{ padding: '8px 4px', color: '#fff', fontWeight: 'bold', textAlign: 'right', fontSize: '13pt', whiteSpace: 'nowrap' }}>
                {fmt(total)} {moneda}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Plazo ── */}
      <div style={{ marginBottom: '3.5mm', fontSize: '9pt', color: '#444' }}>
        <span style={{ fontWeight: 'bold', color: '#111' }}>Plazo estimado de entrega:</span>{' '}
        {plazo_estimado}
      </div>

      {/* ── Conditions ── */}
      {conditions.length > 0 && (
        <div style={{ marginBottom: '3.5mm' }}>
          <div style={s.sectionTitle}>Términos y Condiciones</div>
          <div style={{ border: '0.8px solid #ccc', padding: '4mm 5mm' }}>
            {conditions.map(([k, v], i) => (
              <p key={k} style={{ marginBottom: i < conditions.length - 1 ? 4 : 0, fontSize: '8.5pt', color: '#444', lineHeight: 1.5 }}>
                <b>{k}:</b> {v}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Signatures ── */}
      {condiciones.show_firmas && (
        <div style={{ marginBottom: '3.5mm' }}>
          <div style={s.sectionTitle}>Aceptación del Presupuesto</div>
          <p style={{ fontSize: '8pt', color: '#888', marginBottom: '4mm' }}>
            Al firmar, ambas partes aceptan los servicios, costos y condiciones descritos en este documento.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm' }}>
            {[
              { name: cliente_nombre || 'Cliente', role: 'Cliente — firma y fecha' },
              { name: empresa.nombre,              role: 'Proveedor — firma' },
            ].map(({ name, role }) => (
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

      {/* ── Notes ── */}
      {notas.trim() && (
        <div style={{ marginBottom: '3.5mm' }}>
          <div style={s.sectionTitle}>Notas</div>
          <p style={{ fontSize: '9pt', color: '#444', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {notas}
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ borderTop: '0.3px solid #ccc', marginTop: '3mm', paddingTop: '2mm', textAlign: 'center', fontSize: '7.5pt', color: '#888' }}>
        {empresa.nombre} · {empresa.email} · Presupuesto válido por 30 días a partir de la fecha de emisión
      </div>

    </div>
  );
}
