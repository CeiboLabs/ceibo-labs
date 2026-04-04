import { notFound } from 'next/navigation';
import { getCotizacionByToken, getCotizacionConfig } from '@/lib/cotizaciones/db';
import { QuoteDocument } from '@/components/cotizaciones/QuoteDocument';
import { AcceptButton } from './AcceptButton';
import { PrintButton } from './PrintButton';
import { QuoteScaler } from './QuoteScaler';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const cot = await getCotizacionByToken(id);
  if (!cot) return { title: 'Cotización no encontrada' };
  return { title: `Presupuesto ${cot.numero} — Ceibo Labs`, robots: 'noindex' };
}

export default async function PublicQuotePage({ params }: Props) {
  const { id } = await params;
  const [cotizacion, config] = await Promise.all([
    getCotizacionByToken(id),
    getCotizacionConfig(),
  ]);

  if (!cotizacion) return notFound();

  const empresa = {
    nombre: config.empresa_nombre,
    email:  config.empresa_email,
    rut:    config.empresa_rut,
  };

  const isDecided = cotizacion.estado === 'aceptada' || cotizacion.estado === 'rechazada';

  return (
    <>
      {/* Print CSS: hides action bar when printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
        @page { size: A4 portrait; margin: 10mm 15mm; }
      `}</style>

      {/* ── Action bar ── */}
      <div className="no-print sticky top-0 z-10 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-700/50 shadow-sm">
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Presupuesto {cotizacion.numero}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {empresa.nombre} · Para: {cotizacion.cliente_nombre || 'Cliente'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PrintButton />
            {!isDecided && (
              <AcceptButton cotizacionId={cotizacion.id} />
            )}
            {cotizacion.estado === 'aceptada' && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1.5 font-medium">
                ✓ Presupuesto aceptado
              </span>
            )}
            {cotizacion.estado === 'rechazada' && (
              <span className="inline-flex items-center text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5">
                Presupuesto rechazado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Document ── */}
      <div className="bg-slate-100 dark:bg-[#1a1a24] min-h-screen py-6 px-4 print:p-0 print:bg-white">
        <div className="mx-auto max-w-[210mm]">
          <QuoteScaler>
            <div style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.15)' }} className="print:shadow-none">
              <QuoteDocument cotizacion={cotizacion} empresa={empresa} />
            </div>
          </QuoteScaler>
        </div>
      </div>
    </>
  );
}
