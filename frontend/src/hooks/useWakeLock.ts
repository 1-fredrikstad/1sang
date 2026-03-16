'use client';

import { useEffect, useRef } from 'react';

// hook to prevent screen from turning off based on the Wake Lock API
// code from: https://stackoverflow.com/questions/76539285/problems-trying-to-prevent-sleeping-of-display-on-my-web-app
export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

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

    const release = async () => {
      try {
        if (wakeLockRef.current && !wakeLockRef.current.released) {
          await wakeLockRef.current.release();
        }
      } catch {}
      wakeLockRef.current = null;
    };

    const onVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await acquire();
      } else {
        await release();
      }
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      release();
    };
  }, [enabled]);
}
