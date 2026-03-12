import { AdminNav } from '@/components/admin/AdminNav';
import { PresupuestosClient } from '@/components/admin/PresupuestosClient';

export const metadata = { title: 'Presupuestos' };

export default function AdminPresupuestosPage() {
  return (
    <>
      <AdminNav />
      <PresupuestosClient />
    </>
  );
}
