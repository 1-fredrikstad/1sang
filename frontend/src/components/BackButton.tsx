'use client';

import { useRouter } from 'next/navigation';
import { ArrowLongLeftIcon } from '@heroicons/react/24/solid';

export default function BackButton({ fallback, href }: { fallback?: string; href?: string }) {
  const router = useRouter();

  const handleBack = () => {
    // If href provided, use it
    if (href) {
      router.push(href);
      // If fallback url provided, use it
    } else if (fallback) {
      router.replace(fallback);
      return;
      // else, go back
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
      <ArrowLongLeftIcon className="size-8" />
    </button>
  );
}
