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

type NavItem = {
  id: string;
  href: string;
  label: string;
  IconOutline: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  IconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

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
            const isActive = isAdd
              ? showSongOrPlaylistBox
              : href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);
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
                <Icon
                  className={`h-7 w-7 text-foreground transition-all duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  } group-hover:opacity-100`}
                />

                <span
                  className={`text-[10px] mt-1 transition-all ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  } group-hover:opacity-100`}
                >
                  {label}
                </span>

                {/* Black text at full opacity if link is active */}
                {/* {isActive && (
                  <span className="absolute bottom-2 h-0.5 w-6 rounded-full bg-foreground" />
                )} */}
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
