'use client';

import Switch from '@mui/material/Switch';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from 'next-themes';
import { useMounted } from '../hooks/useMounted';

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = theme === 'dark';

  if (!mounted) return null;

  return (
    <div className="flex justify-center gap-2 w-full">
      <section className=" w-full max-w-3xs justify-between flex items-center">
        <span className="whitespace-nowrap">
          {isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
        </span>
        <Switch
          onChange={() => setTheme(isDark ? 'light' : 'dark')}
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
    </div>
  );
}
