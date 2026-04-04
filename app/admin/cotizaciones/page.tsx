import { AdminNav } from '@/components/admin/AdminNav';
import { CotizacionesList } from '@/components/admin/cotizaciones/CotizacionesList';
import { getCotizaciones } from '@/lib/cotizaciones/db';

export const metadata = { title: 'Cotizaciones' };

export default async function CotizacionesPage() {
  const cotizaciones = await getCotizaciones();
  return (
    <>
      <AdminNav />
      <CotizacionesList initialData={cotizaciones} />
    </>
  );
}
