import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/admin-auth';
import { LoginScreen } from '../AdminClient';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  if (isAdminSession()) redirect('/admin');
  return <LoginScreen />;
}
