'use client';

import { useEffect } from 'react';
import { useThemeMode } from '../context/ThemeProvider';
import { HeaderColor } from '../types/theme';
import { useForm } from 'react-hook-form';

type FormValues = {
  headerColor: HeaderColor;
};

const HEADERCOLOR_OPTIONS: { label: string; value: HeaderColor }[] = [
  { label: 'Dark', value: 'dark_gray' },
  { label: 'Småspeider', value: 'light_yellow' },
  { label: 'Bever', value: 'brown' },
  { label: 'Stifinner', value: 'dark_blue' },
  { label: 'Vandrer', value: 'light_green' },
  { label: 'Rover', value: 'pink' },
  { label: 'Leder', value: 'turquoise' },
];

export default function HeaderColorForm() {
  const { headerColor, setHeaderColor } = useThemeMode();
  const { register, watch } = useForm<FormValues>({
    defaultValues: { headerColor },
  });

  const selectedColor = watch('headerColor');

  useEffect(() => {
    if (selectedColor && selectedColor !== headerColor) {
      setHeaderColor(selectedColor);
    }
  }, [selectedColor, headerColor, setHeaderColor]);

  return (
    <main className="flex justify-center w-full">
      <details className=" w-full max-w-3xs">
        <summary className="flex justify-between cursor-pointer list-none p-2">
          <span>Tema</span>
          <span className="[details[open]_&]:rotate-180">▾</span>
        </summary>

        <form className="flex flex-col gap-2">
          {HEADERCOLOR_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex gap-2 text-base">
              <input
                type="radio"
                value={value}
                {...register('headerColor')}
                className="accent-current"
              />
              <span>{label}</span>
            </label>
          ))}
        </form>
      </details>
    </main>
  );
}
