'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Figma-exported icon components
import { HomeIcon, SongsIcon, AddIcon, FavoritesIcon, SettingsIcon } from './icons/Icons';

type NavItem = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

//TODO: add href when more pages are implemented
const navItems: NavItem[] = [
  { label: 'Home', href: '/', Icon: HomeIcon },
  { label: 'Songs', href: '', Icon: SongsIcon },
  { label: 'Add', href: '', Icon: AddIcon },
  { label: 'Favorites', href: '', Icon: FavoritesIcon },
  { label: 'Settings', href: '', Icon: SettingsIcon },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="
            fixed inset-x-0 bottom-0 z-50
            bg-[#69869F]
            text-white
            pb-[env(safe-area-inset-bottom)]
        "
      aria-label="Bottom navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {navItems.map(({ label, href, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 py-3 text-xs',
                isActive ? 'text-neutral-900' : 'text-neutral-500'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={clsx('h-6 w-6', isActive ? 'opacity-100' : 'opacity-80')} />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
