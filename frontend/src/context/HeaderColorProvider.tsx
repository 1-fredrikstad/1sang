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

export function HeaderColorProvider({
  children,
  initialColor,
}: {
  children: React.ReactNode;
  initialColor?: HeaderColor;
}) {
  const mounted = useMounted();
  const [headerOverride, setHeaderOverride] = useState<HeaderColor | undefined>(() => initialColor);
  const { resolvedTheme } = useTheme();

  // Derived header color
  const headerColor =
    headerOverride ?? initialColor ?? (resolvedTheme === 'dark' ? 'dark_gray' : 'light_yellow');

  // --- Update DOM ---
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      if (headerColor) {
        document.documentElement.setAttribute('data-theme', headerColor);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      const timer = setTimeout(() => {
        document.documentElement.classList.add('theme-ready');
      }, 50);

      return () => clearTimeout(timer);
    }
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
