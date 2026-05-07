import NoAccess from '@/src/components/admin/NoAccess';
import { getCurrentUserRole } from '@/src/lib/actions/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { role, isUser } = await getCurrentUserRole();

  // If not logged in, reroute to login page
  if (!isUser) {
    redirect('/admin');
  }

  // If not admin or superuser, no access
  if (role !== 'admin' && role !== 'superuser') {
    return <NoAccess />;
  }

  return <>{children}</>;
}
