'use client';
import { useRouter } from 'next/navigation';
import LoginPage from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';

export default function Admin() {
  const { user, isAdmin, isSuperuser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get('error');

  // Only redirect when admin status is confirmed, not just for any logged-in user
  useEffect(() => {
    if (isAdmin || isSuperuser) {
      router.replace('/admin/dashboard');
    }
  }, [isAdmin, isSuperuser, router]);

  if (isAdmin || isSuperuser) return <Spinner message="Omdirigerer til admin" />;

  if (error === 'invalid-user') {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 mb-4">Kontoen finnes ikke lenger</p>
        <LoginPage />
      </div>
    );
  }

  return <LoginPage />;
}
