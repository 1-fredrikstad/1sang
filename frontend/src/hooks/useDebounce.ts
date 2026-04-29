'use client';

import { useEffect, useState } from 'react';

// Returns a debounced version of a value, updated after a delay
export function useDebounce<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Update value only after delay has passed without changes
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear previous timer if value changes before delay completes
    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
