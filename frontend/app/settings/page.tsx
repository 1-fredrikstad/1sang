'use client';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import Spinner from '@/src/components/login/Spinner';
import SwitchThemeButton from '@/src/components/SwitchHeaderColorButton';
import ThemeToggleButton from '@/src/components/ThemeToggleButton';

export default function Settings() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/settings';
  };

  if (isLoading) {
    return (
      <section>
        <Spinner />
        <p className="mt-2 text-center">Laster innloggingsinfo...</p>;
      </section>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center gap-2 mt-20">
      <ThemeToggleButton />
      <SwitchThemeButton />
      {user ? (
        <>
          <p className="text-lg">Logget inn som:</p>
          <p>
            <b>{user.name}</b>
          </p>

          <button
            onClick={handleLogout}
            className="p-3 mt-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
          >
            Logg out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="p-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Logg inn som Admin
        </Link>
      )}
    </main>
  );
}
