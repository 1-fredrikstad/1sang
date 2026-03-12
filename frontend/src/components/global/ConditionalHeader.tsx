'use client';

import { usePathname } from 'next/navigation';
import Header from '@/src/components/global/Header';
import { useAuth } from '@/src/context/AuthContext';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on /login
  if (pathname === '/admin' && !user) return null;

  return <Header />;
}
