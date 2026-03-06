'use client';

import { useState, useContext, useEffect, createContext } from 'react';
import ls from 'localstorage-slim';
import type { HeaderColor } from '../types/theme';

type Mode = 'light' | 'dark';

type ThemeContextType = {
  mode: Mode;
  toggleMode: () => void;
  headerColor: HeaderColor;
  setHeaderColor: (color: HeaderColor | null) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // --- Mode ---

  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'light';

    const stored = ls.get('mode');
    if (stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // --- Header color ---

  const [headerOverride, setHeaderOverride] = useState<HeaderColor | null>(() => {
    if (typeof window === 'undefined') return null;
    return ls.get('headerColor') as HeaderColor | null;
  });

  // Derived header color
  const headerColor = headerOverride ?? (mode === 'dark' ? 'dark_gray' : 'light_yellow');

  // --- Apply on change ---

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    ls.set('theme', mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = headerColor;
  }, [headerColor]);

  // --- Actions ---

  function toggleMode() {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function setHeaderColor(color: HeaderColor | null) {
    // Reset header color in localstorage
    if (color === null) {
      ls.remove('headerColor');
      setHeaderOverride(null);
      return;
    }

    ls.set('headerColor', color);
    setHeaderOverride(color);
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, headerColor, setHeaderColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper hook
export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used inside ThemeProvider');
  return context;
}
