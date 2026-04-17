'use client';

import { useEffect } from 'react';
import { useHeaderColor } from '../context/HeaderColorProvider';
import { HeaderColor, HEADERCOLOR_OPTIONS } from '../types/theme';
import { useForm, useWatch } from 'react-hook-form';
import { useMounted } from '../hooks/useMounted';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { useState } from 'react';

type FormValues = {
  headerColor: HeaderColor;
};

export default function HeaderColorForm() {
  const { headerColor, setHeaderColor } = useHeaderColor();
  const mounted = useMounted();

  const [open, setOpen] = useState(false);

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
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="group w-full flex items-center justify-between cursor-pointer">
          <span>Fargetema</span>
          <ChevronDownIcon className="h-5 w-5 transition-transform duration-500 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <div className="m-1 mt-2 mr-0">
          <form className="flex flex-col gap-1 mt-1">
            {HEADERCOLOR_OPTIONS.map((option) => {
              const { label, value, colorVar } = option;

              const isSelected = selectedColor === value;

              return (
                <>
                  <label
                    key={`header-color-${value}`}
                    className="p-1 pl-0 cursor-pointer rounded-xs flex justify-start gap-2 transition-colors"
                  >
                    {/* Color preview dot */}
                    <span
                      className="inline-block w-5 h-5 rounded-full"
                      style={{ backgroundColor: colorVar }}
                    />
                    <input
                      type="radio"
                      value={value}
                      {...register('headerColor', {
                        onChange: (e) => setHeaderColor(e.target.value as HeaderColor),
                      })}
                      className="sr-only"
                    />
                    <span className="inline-block relative">
                      {label}
                      <span
                        className="absolute block left-0 bottom-0 h-0.5 transition-all duration-300"
                        style={{
                          width: isSelected ? '100%' : '0',
                          backgroundColor: colorVar,
                        }}
                      />
                    </span>
                  </label>
                </>
              );
            })}
          </form>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
