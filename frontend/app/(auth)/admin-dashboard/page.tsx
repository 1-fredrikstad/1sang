import { getCurrentUserRole } from '@/src/lib/actions/auth';
import { redirect } from 'next/navigation';
import AdminContent from '@/src/components/admin/AdminContent';

export default async function AdminDashboard() {
  const { role, isUser } = await getCurrentUserRole();

  if (!isUser) {
    redirect('/admin?error=invalid-user');
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <>
        <p className="mb-2">Ingen tilgang</p>
        <p className="text-sm opacity-70">Logg ut og prøv med en annen bruker.</p>
      </>
    );
  }

  return <AdminContent />;
}
