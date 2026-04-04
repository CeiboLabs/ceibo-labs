import { AdminNav } from '@/components/admin/AdminNav';
import { ConfiguracionClient } from '@/components/admin/cotizaciones/ConfiguracionClient';
import { getCotizacionConfig } from '@/lib/cotizaciones/db';

export const metadata = { title: 'Configuración' };

export default async function ConfiguracionPage() {
  const config = await getCotizacionConfig();
  return (
    <>
      <AdminNav />
      <ConfiguracionClient config={config} />
    </>
  );
}
