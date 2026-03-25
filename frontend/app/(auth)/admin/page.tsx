'use client';
import { useRouter } from 'next/navigation';
import LoginPage from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/admin-dashboard');
    }
  }, [user, router]);

  if (authLoading || user)
    return <Spinner message={user ? 'Omdirigerer til admin' : 'Laster inn'} />;

  return <LoginPage />;
}
