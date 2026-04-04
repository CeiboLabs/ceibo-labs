import { AdminNav } from '@/components/admin/AdminNav';
import { WizardClient } from '@/components/admin/cotizaciones/WizardClient';

export const metadata = { title: 'Nueva cotización' };

export default function NuevaCotizacionPage() {
  return (
    <>
      <AdminNav />
      <WizardClient />
    </>
  );
}
