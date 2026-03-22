'use client';
import { useRouter } from 'next/navigation';
import LoginPage from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function Admin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/admin-dashboard');
    }
  }, [user, router]);

  if (isLoading) return <Spinner message="Laster inn" />;

  if (!user) {
    return <LoginPage />;
  }

  return <Spinner message="Laster adminside" />; // Show spinner while checking or redirecting
}
