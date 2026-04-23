'use client';

import { useSongs } from '@/src/hooks/useData';
import { HomePage } from './HomePage';

export function SongDataDisplay() {
  const {
    data: songs,
    isLoading,
    error,
  } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  return <HomePage songs={songs} isLoading={isLoading} error={error} />;
}
