'use client';

import HeaderColorForm from '@/src/components/HeaderColorForm';
import ThemeToggleButton from '@/src/components/ThemeToggleButton';
import WakeLockToggle from '@/src/components/songs/WakeLockToggle';
import { useAuth } from '@/src/context/AuthContext';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { useSongSuggestions } from '@/src/hooks/useData';
import Link from 'next/link';

export default function Settings() {
  const { isAdmin } = useAuth();
  const isOnline = useOnlineStatus();

  // Fetch all song suggestions
  const { data: suggestions } = useSongSuggestions();
  // Determine whether there are pending suggestions
  const hasSuggestions = (suggestions?.length ?? 0) > 0;
  // If admin + suggestions -> show a dot on settings
  const showSuggestionDot = isAdmin && hasSuggestions;

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
          <Link
            href="/admin/dashboard"
            className="hover:bg-secondary/60 settings-list-item relative"
          >
            Til admin-dashboard
            {showSuggestionDot && (
              <span className="absolute bottom-7 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background translate-x-1/3 -translate-y-1/3" />
            )}
          </Link>
        )}
      </ul>
    </main>
  );
}
