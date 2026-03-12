'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { useAuth } from '@/src/context/AuthContext';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on /login
  if (pathname === '/admin' && !user) return null;

  return <Navbar />;
}
