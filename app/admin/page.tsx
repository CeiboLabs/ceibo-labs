import { AdminDashboard } from './AdminDashboard';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata = { title: 'Posts' };

export default function AdminPage() {
  return (
    <>
      <AdminNav />
      <AdminDashboard />
    </>
  );
}
