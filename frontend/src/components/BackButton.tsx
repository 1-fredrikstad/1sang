'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (pathname === '/admin') {
      router.push('/');
    } else {
      router.back();
    }
  };

  return (
    <button id="arrow-back" onClick={handleBack} className="hover:cursor-pointer">
      <ArrowLeftIcon className="size-6" />
      <span className="hidden md:block mt-1">Tilbake</span>
    </button>
  );
}
