'use client';

import { useEffect } from 'react';
import { useThemeMode } from '../context/ThemeProvider';
import { HeaderColor, HEADERCOLOR_OPTIONS } from '../types/theme';
import { useForm, useWatch } from 'react-hook-form';

type FormValues = {
  headerColor: HeaderColor;
};

export default function HeaderColorForm() {
  const { headerColor, setHeaderColor } = useThemeMode();
  const { register, control, reset } = useForm<FormValues>({
    defaultValues: { headerColor },
  });

  // Reset form when context headerColor changes
  useEffect(() => {
    reset({ headerColor });
  }, [headerColor, reset]);

  // Track the current selected color in the form
  const selectedColor = useWatch({
    control,
    name: 'headerColor',
  });

  useEffect(() => {
    if (selectedColor && selectedColor !== headerColor) {
      setHeaderColor(selectedColor);
    }
  }, [selectedColor, headerColor, setHeaderColor]);

  return (
    <main className="flex justify-center w-full">
      <details className=" w-full max-w-3xs">
        <summary className="flex justify-between cursor-pointer list-none p-2 pl-0">
          <span>Fargetema</span>
          <span className="[details[open]_&]:rotate-180">▾</span>
        </summary>

        <form className="flex flex-col gap-1 divide-y divide-gray-200/70 dark:divide-gray-600/60 mt-1">
          {HEADERCOLOR_OPTIONS.map(({ label, value, colorVar }) => {
            const isSelected = selectedColor === value;

            return (
              <label
                key={value}
                className={`p-1 pl-0 cursor-pointer rounded-xs flex justify-between`}
                style={{
                  borderBottom: isSelected ? `3px solid ${colorVar}` : undefined,
                }}
              >
                <input
                  type="radio"
                  value={value}
                  {...register('headerColor')}
                  className="sr-only"
                />
                <span>{label}</span>

                {/* Color preview dot */}
                <span
                  className="inline-block w-5 h-5 rounded-full"
                  style={{ backgroundColor: colorVar }}
                />
              </label>
            );
          })}
        </form>
      </details>
    </main>
  );
}
