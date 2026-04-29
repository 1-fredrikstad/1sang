'use client';

import { useEffect, useRef } from 'react';

// Hook to prevent device screen from sleeping using the Wake Lock API
export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    // Request wake lock (keeps screen awake)
    const acquire = async () => {
      try {
        if (!mounted) return;
        if (!('wakeLock' in navigator)) return;
        if (document.visibilityState !== 'visible') return;
        if (wakeLockRef.current && !wakeLockRef.current.released) return;

        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.error('Wake lock request failed:', err);
      }
    };

    // Release wake lock when no longer needed
    const release = async () => {
      try {
        if (wakeLockRef.current && !wakeLockRef.current.released) {
          await wakeLockRef.current.release();
        }
      } catch {}
      wakeLockRef.current = null;
    };

    // Re-acquire or release depending on tab visibility
    const onVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await acquire();
      } else {
        await release();
      }
    };

    // Initial request
    acquire();

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      release();
    };
  }, [enabled]);
}
