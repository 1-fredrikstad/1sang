import { useState, useEffect, useRef } from 'react';

export function useDelayedLoading(isLoading: boolean, delay = 200, minDisplayTime = 200) {
  const [showSpinner, setShowSpinner] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    // When loading starts, delay showing spinner to avoid flicker
    if (isLoading) {
      timer = setTimeout(() => {
        setShowSpinner(true);
        startTimeRef.current = Date.now();
      }, delay);
    } else {
      // If spinner was shown, ensure it stays visible for minimum time
      if (startTimeRef.current !== null) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, minDisplayTime - elapsed);

        timer = setTimeout(() => {
          setShowSpinner(false);
          startTimeRef.current = null;
        }, remaining);
      } else {
        // If spinner never appeared, hide immediately
        timer = setTimeout(() => {
          setShowSpinner(false);
        }, 0);
      }
    }

    return () => clearTimeout(timer);
  }, [isLoading, delay, minDisplayTime]);

  return showSpinner;
}
