'use client';

import { useState, useContext, useEffect, createContext } from 'react';
import { setCookie, deleteCookie } from 'cookies-next/client';
import type { HeaderColor } from '../types/theme';
import { useMounted } from '../hooks/useMounted';
import { useTheme } from 'next-themes';

type Context = {
  headerColor: HeaderColor | undefined;
  setHeaderColor: (color: HeaderColor | null) => void;
};

const HeaderColorContext = createContext<Context | null>(null);

export function HeaderColorProvider({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  const [headerOverride, setHeaderOverride] = useState<HeaderColor | undefined>(() => {
    // Read cookie client-side immediately
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)headerColor=([^;]+)/);
      if (match) return match[1] as HeaderColor;
    }
    return undefined;
  });

  // Derived header color
  const headerColor =
    headerOverride ??
    (resolvedTheme === 'dark'
      ? 'dark_gray'
      : resolvedTheme === 'light'
        ? 'light_yellow'
        : undefined);

  // --- Correct DOM immediately on mount from the live cookie value---
  useEffect(() => {
    if (!mounted || headerColor === undefined) return;

    document.documentElement.setAttribute('data-theme', headerColor);

    // const timer = setTimeout(() => {
    //   document.documentElement.classList.add('theme-ready');
    // }, 50);

    // return () => clearTimeout(timer);

    document.documentElement.classList.add('theme-ready');
  }, [headerColor, mounted]);

  function setHeaderColor(color: HeaderColor | null) {
    if (color === null) {
      deleteCookie('headerColor');
      setHeaderOverride(undefined);
      return;
    }

    setCookie('headerColor', color, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    setHeaderOverride(color);
  }

  return (
    <HeaderColorContext.Provider value={{ headerColor, setHeaderColor }}>
      {children}
    </HeaderColorContext.Provider>
  );
}

// Hook to use context safely
export function useHeaderColor() {
  const ctx = useContext(HeaderColorContext);
  if (!ctx) throw new Error('useHeaderColor must be used inside HeaderColorProvider');
  return ctx;
}
