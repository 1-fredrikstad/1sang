'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon,
  MusicalNoteIcon,
  PlusIcon,
  StarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '@/src/context/AuthContext';
import SongOrPlaylistBox from '../SongOrPlaylistBox';

type NavItem = {
  id: string;
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { id: 'home', href: '/', label: 'Hjem', Icon: HomeIcon },
  { id: 'playlists', href: '/playlists', label: 'Spillelister', Icon: MusicalNoteIcon },
  { id: 'add', href: '/add', label: 'Opprett', Icon: PlusIcon },
  { id: 'favorites', href: '/favorites', label: 'Favoritter', Icon: StarIcon },
  { id: 'settings', href: '/settings', label: 'Innstillinger', Icon: Cog6ToothIcon },
];

// Navigation component
export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const [showSongOrPlaylistBox, setShowSongOrPlaylistBox] = useState(false);
  const songChoice = isAdmin ? 'Publiser sang' : 'Send inn sangforslag';

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
          fixed inset-x-0 bottom-0 z-50 
          bg-background
          shadow-[0_-1px_3px_rgba(0,0,0,0.12)]
          dark:shadow-[0_-1px_4px_rgba(255,255,255,0.12)]
          pb-[env(safe-area-inset-bottom)] md:pb-0
        "
        aria-label="Bottom navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {navItems.map(({ id, href, label, Icon }) => {
            const isAdd = id === 'add';
            const isActive = isAdd
              ? showSongOrPlaylistBox
              : href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);

            return (
              // Link for each navItem
              <Link
                key={id}
                href={href}
                onClick={(e) => handleNavClick(e, isAdd)}
                className="relative flex flex-col items-center justify-center py-2 transition-opacity duration-200"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`h-7 w-7 text-foreground transition-all duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  } hover:opacity-100`}
                />

                <span
                  className={`text-[10px] mt-1 transition-all ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  {label}
                </span>

                {/* Black text at full opacity if link is active */}
                {isActive && (
                  <span className="absolute bottom-2 h-0.5 w-6 rounded-full bg-foreground" />
                )}
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
