'use client';
import BackButton from '@/src/components/BackButton';
import Login from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const { user, logout } = useAuth();

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/admin');
  };

  return (
    <main className="flex justify-center items-center h-screen">
      <div className={`absolute left-4 ${user ? 'top-24' : 'top-4'}`}>
        <BackButton />
      </div>

      {user ? (
        <section className="text-center">
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
        </section>
      ) : (
        <Login />
      )}
    </main>
  );
}
