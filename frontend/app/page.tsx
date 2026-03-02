'use client';

import { Suspense } from 'react';
import { HomePage } from './pages/HomePage';
import { useSongs } from '@/src/hooks/useData';
-function SongDataDisplay() {
  const {
    data: songs,
    isLoading,
    error,
  } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!songs) return <div>Laster data...</div>;
};
export default function Page() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <HomePage />
    </Suspense>
  );
}
