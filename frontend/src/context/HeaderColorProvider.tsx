'use client';

import { useState, useContext, useLayoutEffect, createContext } from 'react';
import { setCookie, deleteCookie } from 'cookies-next/client';
import type { HeaderColor } from '../types/theme';
import { useTheme } from 'next-themes';

type Context = {
  headerColor: HeaderColor | undefined;
  setHeaderColor: (color: HeaderColor | null) => void;
};

const HeaderColorContext = createContext<Context | null>(null);

export function HeaderColorProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  // Read initial header override from cookie on first render
  const [headerOverride, setHeaderOverride] = useState<HeaderColor | undefined>(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)headerColor=([^;]+)/);
      if (match) return match[1] as HeaderColor;
    }
    return undefined;
  });

  // Resolve final header color (cookie override > theme fallback)
  const headerColor =
    headerOverride ??
    (resolvedTheme === 'dark'
      ? 'dark_gray'
      : resolvedTheme === 'light'
        ? 'light_yellow'
        : undefined);

  // Apply header color + CSS readiness classes as early as possible
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    if (headerColor) {
      document.documentElement.setAttribute('data-theme', headerColor);
    }

    document.documentElement.classList.add('theme-ready');

    const timer = setTimeout(() => {
      document.documentElement.classList.add('animations-ready');
    }, 100);

    return () => clearTimeout(timer);
  }, [headerColor]);

  // Update cookie + state when user selects a new header color
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

// Safe hook for consuming header color context
export function useHeaderColor() {
  const ctx = useContext(HeaderColorContext);
  if (!ctx) throw new Error('useHeaderColor must be used inside HeaderColorProvider');
  return ctx;
}
