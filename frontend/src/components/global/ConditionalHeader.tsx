'use client';

import { usePathname } from 'next/navigation';
import Header from '@/src/components/global/Header';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Hide on /login
  if (pathname === '/login') return null;

  return <Header />;
}
