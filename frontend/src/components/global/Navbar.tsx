'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon as HomeOutline,
  MusicalNoteIcon as MusicOutline,
  PlusIcon as PlusOutline,
  StarIcon as StarOutline,
  Cog6ToothIcon as CogOutline,
} from '@heroicons/react/24/outline';

import {
  HomeIcon as HomeSolid,
  MusicalNoteIcon as MusicSolid,
  PlusIcon as PlusSolid,
  StarIcon as StarSolid,
  Cog6ToothIcon as CogSolid,
} from '@heroicons/react/24/solid';

import { useAuth } from '@/src/context/AuthContext';
import SongOrPlaylistBox from '../SongOrPlaylistBox';
import { useSongSuggestions } from '@/src/hooks/useData';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

type NavItem = {
  id: string;
  href: string;
  label: string;
  IconOutline: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  IconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// Bottom navigation configuration
const navItems: NavItem[] = [
  { id: 'home', href: '/', label: 'Hjem', IconOutline: HomeOutline, IconSolid: HomeSolid },
  {
    id: 'playlists',
    href: '/playlists',
    label: 'Spillelister',
    IconOutline: MusicOutline,
    IconSolid: MusicSolid,
  },
  { id: 'add', href: '/add', label: 'Opprett', IconOutline: PlusOutline, IconSolid: PlusSolid },
  {
    id: 'favorites',
    href: '/favorites',
    label: 'Favoritter',
    IconOutline: StarOutline,
    IconSolid: StarSolid,
  },
  {
    id: 'settings',
    href: '/settings',
    label: 'Innstillinger',
    IconOutline: CogOutline,
    IconSolid: CogSolid,
  },
];

// Navigation component
export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const isOnline = useOnlineStatus();

  // Fetch all song suggestions
  const { data: suggestions } = useSongSuggestions();
  // Determine whether there are pending suggestions
  const hasSuggestions = (suggestions?.length ?? 0) > 0;
  // If admin + suggestions -> show a dot on settings
  const showSuggestionDot = isAdmin && hasSuggestions;

  // Visibility of "add song/playlist" modal
  const [showSongOrPlaylistBox, setShowSongOrPlaylistBox] = useState(false);

  // Label changes depending on user role
  const songChoice = isAdmin ? 'Publiser sang' : 'Send inn sangforslag';

  // Handle navigation clicks
  const handleNavClick = (e: React.MouseEvent, isAdd: boolean) => {
    if (isAdd) {
      e.preventDefault();
      setShowSongOrPlaylistBox((prev) => !prev);
    } else {
      setShowSongOrPlaylistBox(false);
    }
  };

  return (
    <>
      <nav
        className="
          sticky bottom-0 z-50 
          bg-background
          shadow-[0_-1px_3px_rgba(0,0,0,0.12)]
          dark:shadow-[0_-1px_4px_rgba(255,255,255,0.12)]
          pb-[env(safe-area-inset-bottom)] md:pb-0
        "
        aria-label="Bottom navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {navItems.map(({ id, href, label, IconOutline, IconSolid }) => {
            const isAdd = id === 'add';

            // Determine active tab state
            const isActive = isAdd
              ? showSongOrPlaylistBox
              : href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);

            // Switch icon style based on active state
            const Icon = isActive ? IconSolid : IconOutline;

            return (
              // Link for each navItem
              <Link
                key={id}
                href={href}
                onClick={(e) => handleNavClick(e, isAdd)}
                className="group relative flex flex-col items-center justify-center py-2 transition-opacity duration-200"
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icon wrapper used for positioning notification dot */}
                <div className="relative">
                  <Icon
                    className={`h-7 w-7 text-foreground transition-all duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    } group-hover:opacity-100`}
                  />
                  {/* If suggestions and admin and online -> show red dot on settings (cog) */}
                  {id === 'settings' && showSuggestionDot && isOnline && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background translate-x-1/3 -translate-y-1/3" />
                  )}
                </div>

                {/* Label under icon */}
                <span
                  className={`text-[10px] mt-1 transition-all ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  } group-hover:opacity-100`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Show SongOrPlaylistBox if add button is active */}
      {showSongOrPlaylistBox && (
        <SongOrPlaylistBox
          songChoice={songChoice}
          onClose={() => setShowSongOrPlaylistBox(false)}
        />
      )}
    </>
  );
}
