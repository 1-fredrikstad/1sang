'use client';

import { useThemeMode } from '../context/ThemeProvider';
import { ColorHeader } from '../types/theme';
import { useForm } from 'react-hook-form';

type FormValues = {
  colorHeader: ColorHeader;
};

const COLORHEADER_OPTIONS: { label: string; value: ColorHeader }[] = [
  { label: 'Dark', value: 'dark_gray' },
  { label: 'Småspeider', value: 'light_yellow' },
  { label: 'Bever', value: 'brown' },
  { label: 'Stifinner', value: 'dark_blue' },
  { label: 'Vandrer', value: 'light_green' },
  { label: 'Rover', value: 'pink' },
  { label: 'Leder', value: 'turquoise' },
];

export default function ChangeColorHeaderForm() {
  const { colorHeader, setHeaderColor } = useThemeMode();
  const { register, watch } = useForm<FormValues>({
    defaultValues: { colorHeader },
  });

  const selectedColor = watch('colorHeader');
  if (selectedColor && selectedColor !== colorHeader) {
    setHeaderColor(selectedColor);
  }

  return (
    <main className="flex justify-center w-full">
      <details className=" w-full max-w-3xs">
        <summary className="flex justify-between cursor-pointer list-none p-2">
          <span>Tema</span>
          <span className="[details[open]_&]:rotate-180">▾</span>
        </summary>

        <form className="flex flex-col gap-2">
          {COLORHEADER_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex gap-2 text-base">
              <input
                type="radio"
                value={value}
                {...register('colorHeader')}
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
