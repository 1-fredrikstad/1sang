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
      {/* Prevent screen sleep while using app */}
      <ul className="flex flex-col">
        <li className="settings-list-item">
          <WakeLockToggle />
        </li>

        {/* Light/dark mode toggle */}
        <li className="settings-list-item">
          <ThemeToggleButton />
        </li>

        {/* UI customization (header color selection) */}
        <li className="hover:bg-secondary/60 active:bg-none settings-list-item">
          <HeaderColorForm />
        </li>

        {/* Navigation shortcut to offline "campfire" mode */}
        <Link href="/campfire" className="hover:bg-secondary/60 settings-list-item">
          Gå en tur i skogen?
        </Link>

        {/* Admin-only navigation (only shown when online + admin verified) */}
        {isAdmin && isOnline && (
          <Link href="/admin/dashboard" className="hover:bg-secondary/60 settings-list-item">
            Til admin-dashboard
          </Link>
        )}
      </ul>
    </main>
  );
}
