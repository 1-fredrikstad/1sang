'use client';
import { useRouter } from 'next/navigation';
import LoginPage from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';
import Spinner from '@/src/components/login/Spinner';

export default function Admin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/admin-dashboard');
    }
  }, [user, router]);

  if (isLoading) return <div>Laster...</div>;

  if (!user) {
    return <LoginPage />;
  }

  return <Spinner />; // Show spinner while checking or redirecting
}
