'use client';
import HeaderColorForm from '@/src/components/HeaderColorForm';
import ThemeToggleButton from '@/src/components/ThemeToggleButton';
import WakeLockToggle from '@/src/components/songs/WakeLockToggle';
import { useAuth } from '@/src/context/AuthContext';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import Link from 'next/link';

export default function Settings() {
  const { isAdmin } = useAuth();
  const isOnline = useOnlineStatus();

  return (
    <main>
      <h1>Innstillinger</h1>
      <ul className="flex flex-col">
        <li className="settings-list-item">
          <WakeLockToggle />
        </li>
        <li className="settings-list-item">
          <ThemeToggleButton />
        </li>

        <li className="hover:bg-secondary/60 active:bg-none settings-list-item">
          <HeaderColorForm />
        </li>

        <Link href="/campfire" className="hover:bg-secondary/60 settings-list-item">
          Gå en tur i skogen?
        </Link>

        {isAdmin && isOnline && (
          <Link href="/admin/dashboard" className="hover:bg-secondary/60 settings-list-item">
            Til admin-dashboard
          </Link>
        )}
      </ul>
    </main>
  );
}
