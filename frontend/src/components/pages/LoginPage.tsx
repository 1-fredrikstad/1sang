'use client';

import BackButton from '@/src/components/BackButton';
import GoogleLoginButton from '@/src/components/login/GoogleLoginButton';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/src/context/AuthContext';
import Image from 'next/image';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import CampfirePage from '../campfire/CampfirePage';

export default function LoginPage() {
  const { user } = useAuth();

  // Tracks internet connectivity (used to block login when offline)
  const isOnline = useOnlineStatus();

  // If user already exists in auth state, show loading state while redirect/refresh happens
  if (user) {
    return <Spinner message="Laster inn" />;
  }

  // Offline fallback screen
  if (!isOnline) {
    return <CampfirePage message="Du er offline. Koble til internett for å logge inn som admin." />;
  }

  return (
    <main className="flex min-h-[80vh] justify-center items-center relative">
      {/* Back navigation positioned in top-left */}
      <div className={`absolute left-4 ${user ? 'top-24' : 'top-4'}`}>
        <BackButton />
      </div>

      <section className="grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          {/* App logo */}
          <Image
            src="/favicon/favicon.svg"
            alt="logo"
            width={175}
            height={200}
            className="h-29 w-auto"
            priority
            unoptimized
          />

          <h1>Admin innlogging</h1>

          {/* OAuth login button */}
          <GoogleLoginButton />
        </div>
      </section>
    </main>
  );
}
