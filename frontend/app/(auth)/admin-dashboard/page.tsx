import { getCurrentUserRole } from '@/src/lib/actions/auth';
import { redirect } from 'next/navigation';
import AdminContent from '@/src/components/admin/AdminContent';

export default async function AdminDashboard() {
  const { role, isUser } = await getCurrentUserRole();

  if (!isUser) {
    redirect('/admin');
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="text-center mt-15 text-red-500">Ingen tilgang</div>;
  }

  return <AdminContent />;
}
