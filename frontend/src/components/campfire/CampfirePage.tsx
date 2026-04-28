'use client';

import Campfire from '@/src/components/campfire/Campfire';
import Link from 'next/link';

interface CampfirePageProps {
  message?: string;
}

export default function CampfirePage({
  message = 'Og tent et bål for å holde deg varm',
}: CampfirePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Campfire message={message} />
      <Link href="/" className="mt-4 underline opacity-80 hover:opacity-100">
        Gå til hjemsiden
      </Link>
    </div>
  );
}
