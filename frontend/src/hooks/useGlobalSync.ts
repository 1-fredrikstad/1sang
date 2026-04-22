'use client';

import { useEffect } from 'react';
import { syncService } from '../lib/syncService';

export default function useGlobalSync() {
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      try {
        await syncService.initialSync();
      } catch (err) {
        console.error('Initial sync failed:', err);
      }

      if (cancelled) return;

      stop = syncService.startAutoSync();
    };

    void start();

    return () => {
      cancelled = true;
      if (stop) stop();
    };
  }, []);
}
