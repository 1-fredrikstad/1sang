'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';

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
      <span className="hidden md:block">Tilbake</span>
      <ArrowLongLeftIcon className="size-6" aria-label="Tilbake" />
    </button>
  );
}
