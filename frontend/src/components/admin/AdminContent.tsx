'use client';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminContent() {
  const { user, logout } = useAuth();

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/admin');
  };

  if (!user) return <div>Ingen tilgang</div>;

  return (
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
  );
}
