'use client';

import { useState, useContext, useEffect, createContext } from 'react';
import Cookies from 'js-cookie';
import type { ColorHeader } from '../types/theme';

type Mode = 'light_mode' | 'dark_mode';

type ThemeContextType = {
  mode: Mode;
  toggleMode: () => void;
  colorHeader: ColorHeader;
  setHeaderColor: (color: ColorHeader) => void;
};

// Context object - a global shared react state that avoids prop drilling
const ThemeContext = createContext<ThemeContextType | null>(null);

// Provider object - component that wraps app. owns and distributes state
export function ThemeProvider({
  children,
  initialMode,
}: {
  children: React.ReactNode;
  initialMode: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const [colorHeader, setColorHeaderState] = useState<ColorHeader>(() => {
    const cookie = Cookies.get('headerTheme') as ColorHeader | undefined;
    const initial = cookie ?? (initialMode === 'dark_mode' ? 'dark_gray' : 'light_yellow');

    // Apply immediately
    if (typeof window !== 'undefined') {
      document.documentElement.dataset.theme = initial;
    }

    return initial;
  });

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.theme = colorHeader;

    Cookies.set('theme', mode, { expires: 7, path: '/' });
    Cookies.set('headerTheme', colorHeader, { expires: 7, path: '/' });
  }, [mode, colorHeader]);

  function toggleMode() {
    setMode((prev) => (prev === 'dark_mode' ? 'light_mode' : 'dark_mode'));
  }

  const setHeaderColor = (color: ColorHeader) => {
    setColorHeaderState(color);
  };

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
