'use client';

import { useEffect } from 'react';
import { syncService } from '../lib/syncService';

export default function useGlobalSync() {
  useEffect(() => {
    const stop = syncService.startAutoSync();
    return stop;
  }, []);
}
