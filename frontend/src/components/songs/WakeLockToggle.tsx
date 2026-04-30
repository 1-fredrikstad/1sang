'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useWakeLock } from '@/src/hooks/useWakeLock';

export default function WakeLockToggle() {
  const [enabled, setEnabled] = useState(false);

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
