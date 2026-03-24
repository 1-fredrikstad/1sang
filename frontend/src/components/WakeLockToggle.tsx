'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useWakeLock } from '@/src/hooks/useWakeLock';

export default function WakeLockToggle() {
  const [enabled, setEnabled] = useState(true);

  useWakeLock(enabled);

  // hide toggle if wake lock API is not supported on that browser
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="wake-lock" className="text-sm opacity-80">
        Unngå at skjermen går i dvale
      </label>

      <Switch
        id="wake-lock"
        className="cursor-pointer"
        checked={enabled}
        onCheckedChange={setEnabled}
      />
    </div>
  );
}
