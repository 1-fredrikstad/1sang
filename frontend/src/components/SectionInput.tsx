'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { InputGroup, InputGroupTextarea } from '@/components/ui/input-group';
import { UseFormRegisterReturn } from 'react-hook-form';

export type SectionInputProps = {
  label?: string;
  register: UseFormRegisterReturn;
  error?: string;
  removable?: boolean;
  onRemove?: () => void;
  rows?: number;
  removeText: string;
  charCount: number;
  limit: number;
};

export default function SectionInput({
  label,
  register,
  error,
  removable,
  onRemove,
  rows = 4,
  removeText,
  charCount,
  limit,
}: SectionInputProps) {
  // Highlight character counter when close to limit
  const isNearLimit = charCount > limit - 100;

  return (
    <Field data-invalid={!!error}>
      {/* Optional label */}
      {label && <FieldLabel className="text-sm text-gray-400">{label}</FieldLabel>}

      {/* Textarea input wrapper */}
      <InputGroup>
        <InputGroupTextarea
          {...register}
          rows={rows}
          aria-invalid={!!error}
          className="focus-visible:ring-1 text-sm"
        />

        {/* Character counter */}
        <span
          className={`absolute bottom-1 right-2 text-sm ${
            isNearLimit ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {charCount} / {limit}
        </span>
      </InputGroup>

      {/* Validation error */}
      {error && <FieldError errors={[{ message: error }]} />}

      {/* Optional remove button */}
      {removable && onRemove && (
        <div className="flex flex-row">
          <Button
            type="button"
            variant="destructive"
            onClick={onRemove}
            className="text-sm mt-1 text-red-500 cursor-pointer"
          >
            Slett {removeText}
          </Button>
        </div>
      )}
    </Field>
  );
}
