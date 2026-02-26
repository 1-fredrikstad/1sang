'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Figma-exported icon components
import { HomeIcon, SongsIcon, AddIcon, FavoritesIcon, SettingsIcon } from './icons/Icons';

type NavItem = {
  id: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

//TODO: add actual href when more pages are implemented
const navItems: NavItem[] = [
  { id: 'home', href: '/', Icon: HomeIcon },
  { id: 'songs', href: '/songs', Icon: SongsIcon },
  { id: 'add', href: '/add', Icon: AddIcon },
  { id: 'favorites', href: '/favorites', Icon: FavoritesIcon },
  { id: 'settings', href: '/settings', Icon: SettingsIcon },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 bg-[#69869F] pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {navItems.map(({ id, href, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={id}
              href={href}
              className="relative flex items-center justify-center py-4 transition-opacity duration-200"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`h-6 w-6 text-white transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
              />
              {isActive && <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-white" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
