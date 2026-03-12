'use client';
import GoogleLoginButton from '@/src/components/login/GoogleLoginButton';
import Spinner from '@/src/components/login/Spinner';
import { useAuth } from '@/src/context/AuthContext';
import Image from 'next/image';

export default function LoginPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || user) {
    return <Spinner />; // Show spinner while checking or redirecting
  }

  return (
    <section className="grid place-items-center relative">
      <main className="flex flex-col items-center gap-4">
        <Image
          src="/favicon/favicon.svg"
          alt="logo"
          width={175}
          height={200}
          className="h-29 w-auto"
          priority
        />
        <h1 className="text-3xl font-bold mb-2">Admin innlogging</h1>
        <GoogleLoginButton />
      </main>
    </section>
  );
}
