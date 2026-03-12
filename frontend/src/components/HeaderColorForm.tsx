'use client';

import { useEffect } from 'react';
import { useHeaderColor } from '../context/HeaderColorProvider';
import { HeaderColor, HEADERCOLOR_OPTIONS } from '../types/theme';
import { useForm, useWatch } from 'react-hook-form';
import { useMounted } from '../hooks/useMounted';

type FormValues = {
  headerColor: HeaderColor;
};

export default function HeaderColorForm() {
  const { headerColor, setHeaderColor } = useHeaderColor();
  const mounted = useMounted();

  const { register, control, reset } = useForm<FormValues>({
    defaultValues: { headerColor },
  });

  // Track the current selected color in the form
  const selectedColor = useWatch({
    control,
    name: 'headerColor',
    exact: true,
  });

  useEffect(() => {
    reset({ headerColor });
  }, [headerColor, reset]);

  if (!mounted) return null;

  return (
    <section className="flex justify-center w-full">
      <details className=" w-full max-w-3xs">
        <summary className="flex justify-between cursor-pointer list-none p-2 pl-0">
          <span>Fargetema</span>
          <span className="[details[open]_&]:rotate-180">▾</span>
        </summary>

        <form className="flex flex-col gap-1 mt-1">
          {HEADERCOLOR_OPTIONS.map((option) => {
            const { label, value, colorVar } = option;

            const isSelected = selectedColor === value;

            return (
              <label
                key={`header-color-${value}`}
                className={`p-1 pl-0 cursor-pointer rounded-xs flex justify-between border-b-2 transition-colors ${isSelected ? '' : 'border-transparent'}`}
                style={{ borderColor: colorVar }}
              >
                <input
                  type="radio"
                  value={value}
                  {...register('headerColor', {
                    onChange: (e) => setHeaderColor(e.target.value as HeaderColor),
                  })}
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
    </section>
  );
}
