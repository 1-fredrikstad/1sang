'use client';
import BackButton from '@/src/components/BackButton';
import GoogleLoginButton from '@/src/components/login/GoogleLoginButton';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/src/context/AuthContext';
import Image from 'next/image';

export default function LoginPage() {
  const { user } = useAuth();

  if (user) {
    return <Spinner message="Laster inn" />; // Show spinner while checking or redirecting
  }

  return (
    <main className="flex min-h-[80vh] justify-center items-center relative">
      <div className={`absolute left-4 ${user ? 'top-24' : 'top-4'}`}>
        <BackButton />
      </div>
      <section className="grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/favicon/favicon.svg"
            alt="logo"
            width={175}
            height={200}
            className="h-29 w-auto"
            priority
          />
          <h1>Admin innlogging</h1>
          <GoogleLoginButton />
        </div>
      </section>
    </main>
  );
}
