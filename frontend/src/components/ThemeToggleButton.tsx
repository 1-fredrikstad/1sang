'use client';

import { Switch } from '@/components/ui/theme-switch';
import { useTheme } from 'next-themes';
import { SunIcon } from '@heroicons/react/24/outline';
import { MoonIcon } from '@heroicons/react/24/outline';
import { useMounted } from '../hooks/useMounted';

export default function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <section className="flex flex-row justify-between">
      <label className="whitespace-nowrap">
        {isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
      </label>
      <Switch
        size="lg"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        thumbContent={
          isDark ? (
            <MoonIcon className="text-white p-0.5 opacity-90" />
          ) : (
            <SunIcon className=" text-black p-0.5 opacity-90" />
          )
        }
      />
    </section>
  );
}
