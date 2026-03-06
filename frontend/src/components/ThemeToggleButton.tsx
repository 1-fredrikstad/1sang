'use client';

import { useThemeMode } from '../context/ThemeProvider';
import Switch from '@mui/material/Switch';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function ThemeToggleButton() {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <main className="flex justify-center gap-2 w-full">
      <section className=" w-full max-w-3xs justify-between flex items-center">
        <span className="whitespace-nowrap">
          {isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
        </span>
        <Switch
          onChange={toggleMode}
          checked={isDark}
          icon={
            <LightModeIcon
              fontSize="small"
              style={{
                color: 'white',
                backgroundColor: '#d8d8d8',
                borderRadius: '50%',
                padding: '3px',
              }}
            />
          }
          checkedIcon={
            <DarkModeIcon
              fontSize="small"
              style={{
                color: '#161616',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '3px',
              }}
            />
          }
          color={'default'}
        />
      </section>
    </main>
  );
}
