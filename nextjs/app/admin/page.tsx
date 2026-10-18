import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/admin-auth';
import AdminDashboard from './AdminClient';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  if (!isAdminSession()) redirect('/admin/login');
  return <AdminDashboard />;
}
