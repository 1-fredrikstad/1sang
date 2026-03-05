'use client';

import { useState, useContext, useEffect, createContext } from 'react';
import Cookies from 'js-cookie';
import type { ColorHeader } from '../types/theme';

type Mode = 'light' | 'dark';

type ThemeContextType = {
  mode: Mode;
  toggleMode: () => void;
  colorHeader: ColorHeader;
  setHeaderColor: (color: ColorHeader | null) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Detect system preference initially
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Manual override stored in cookie
  const [manualHeaderColor, setManualHeaderColor] = useState<ColorHeader | null>(() => {
    return (Cookies.get('headerTheme') as ColorHeader) ?? null;
  });

  // Derived header color
  const colorHeader: ColorHeader =
    manualHeaderColor ?? (mode === 'dark' ? 'dark_gray' : 'light_yellow');

  // apply dark class when mode changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  // apply header theme when it changes
  useEffect(() => {
    document.documentElement.dataset.theme = colorHeader;
  }, [colorHeader]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  function toggleMode() {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function setHeaderColor(color: ColorHeader | null) {
    // if (color === null) {
    //   Cookies.remove('headerTheme');
    //   setManualHeaderColor(null);
    //   return;
    // }
    if (color != null) {
      Cookies.set('headerTheme', color, { expires: 7, path: '/' });
      setManualHeaderColor(color);
    }
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, colorHeader, setHeaderColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper hook
export function useThemeMode() {
  const context = useContext(ThemeContext); //usecontext is the way to read it

  if (!context) throw new Error('useThemeMode must be used inside ThemeProvider');
  return context;
}
