'use client';

import { useThemeMode } from '../context/ThemeProvider';
import { SunIcon, MoonIcon } from './icons/Icons';

export default function ThemeToggleButton() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <button
      onClick={toggleMode}
      className="px-4 py-2 rounded bg-background text-foreground flex items-center gap-2"
    >
      {mode === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
      {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
