'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else if (pathname === '/admin') {
      router.push('/');
    } else {
      router.back();
    }
  };

  return (
    <button
      id="arrow-back"
      onClick={handleBack}
      className="hover:cursor-pointer"
      aria-label="Tilbake"
    >
      <ArrowLongLeftIcon className="size-6" />
    </button>
  );
}
