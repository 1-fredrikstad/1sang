import { useState, useEffect, useRef } from 'react';

export function useDelayedLoading(isLoading: boolean, delay = 400, minDisplayTime = 900) {
  const [showSpinner, setShowSpinner] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setTimeout(() => {
        setShowSpinner(true);
        startTimeRef.current = Date.now();
      }, delay);
    } else {
      if (startTimeRef.current !== null) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, minDisplayTime - elapsed);

        timer = setTimeout(() => {
          setShowSpinner(false);
          startTimeRef.current = null;
        }, remaining);
      } else {
        timer = setTimeout(() => {
          setShowSpinner(false);
        }, 0);
      }
    }
    return () => clearTimeout(timer);
  }, [isLoading, delay, minDisplayTime]);

  return showSpinner;
}
