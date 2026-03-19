'use client';
import { useAuth } from '@/src/context/AuthContext';
import { useSongSuggestions } from '@/src/hooks/useData';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

export default function AdminContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { data: suggestions, isLoading } = useSongSuggestions();

  const handleLogout = async () => {
    await logout();
    router.replace('/admin');
  };

  if (isLoading) return <p className="text-center mt-10">Laster...</p>;

  if (!user) return <div className="text-center mt-10 text-red-600">Ingen tilgang</div>;

  return (
    // <section className="text-center">
    <section className="mx-auto max-w-2xl px-4 py-8 text-center">
      <p className="text-lg">Logget inn som:</p>
      <p className="mt-1 text-xl font-bold">{user.name}</p>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Innkomne forslag</h2>
        {suggestions.length === 0 ? (
          <p className="text-gray-500">Ingen ventende forslag</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <Fragment key={s.id}>
                <Link
                  href={`/admin/suggestions/${s.id}`}
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <h3 className="font-medium">{s.title}</h3>
                  {s.author && <p className="text-sm text-gray-600">av {s.author}</p>}
                </Link>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="p-3 mt-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
      >
        Logg ut
      </button>
    </section>
  );
}
