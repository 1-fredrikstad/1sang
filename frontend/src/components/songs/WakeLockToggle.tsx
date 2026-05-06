'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useWakeLock } from '@/src/hooks/useWakeLock';
import ls from 'localstorage-slim';

// key used to persist the toggle state in local storage
const WAKE_LOCK_KEY = 'wakeLockEnabled';

export default function WakeLockToggle() {
  // initialize state from localStorage (client-side only)
  // if nothing is stored yet, default to false (opt-out)
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!ls.get(WAKE_LOCK_KEY);
  });

  // persist state on change - toggle survives navigation and reloads
  useEffect(() => {
    ls.set(WAKE_LOCK_KEY, enabled);
  }, [enabled]);

  // activate wakeLock based on state
  useWakeLock(enabled);

  // hide toggle if wake lock API is not supported on that browser
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  if (!supported) return null;

  return (
    <div className="flex flex-row justify-between">
      <label htmlFor="wake-lock">Unngå at skjermen går i dvale</label>
      <Switch
        size="lg"
        id="wake-lock"
        className="cursor-pointer"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
    </div>
  );
}
