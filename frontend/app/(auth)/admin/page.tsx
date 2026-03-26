'use client';
import { useRouter } from 'next/navigation';
import LoginPage from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get('error');

  useEffect(() => {
    if (user) {
      router.replace('/admin-dashboard');
    }
  }, [user, router]);

  if (authLoading || user)
    return <Spinner message={user ? 'Omdirigerer til admin' : 'Laster inn'} />;

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
