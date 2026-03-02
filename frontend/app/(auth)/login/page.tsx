'use client';
import BackButton from '@/src/components/BackButton';
import GoogleLoginButton from '@/src/components/login/GoogleLoginButton';
import Spinner from '@/src/components/login/Spinner';
import { useAuth } from '@/src/context/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Login() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/settings');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return <Spinner />; // Show spinner while checking or redirecting
  }

  return (
    <section className="h-screen grid place-items-center relative">
      <span className="absolute top-4 left-4">
        <BackButton />
      </span>
      <main className="flex flex-col items-center gap-4">
        <Image src="/favicon/favicon.svg" alt="logo" width={100} height={100} />
        <h1 className="text-3xl font-bold mb-2">Admin innlogging</h1>
        <GoogleLoginButton />
      </main>
    </section>
  );
}
