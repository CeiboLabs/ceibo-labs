import { notFound } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { CotizacionEditor } from '@/components/admin/cotizaciones/CotizacionEditor';
import { getCotizacion, getCotizacionConfig } from '@/lib/cotizaciones/db';

export const metadata = { title: 'Editar cotización' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarCotizacionPage({ params }: Props) {
  const { id } = await params;
  const [cotizacion, config] = await Promise.all([
    getCotizacion(id),
    getCotizacionConfig(),
  ]);

  if (!cotizacion) notFound();

  const empresa = {
    nombre: config.empresa_nombre,
    email:  config.empresa_email,
    rut:    config.empresa_rut,
  };

  return (
    <>
      <AdminNav />
      <CotizacionEditor
        cotizacion={cotizacion}
        empresa={empresa}
        catalogo={config.catalogo}
      />
    </>
  );
}
