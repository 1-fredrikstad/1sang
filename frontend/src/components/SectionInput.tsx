'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { InputGroup, InputGroupTextarea } from '@/components/ui/input-group';
import { UseFormRegisterReturn } from 'react-hook-form';

type SectionInputProps = {
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
  const isNearLimit = charCount > limit - 100;

  return (
    <Field data-invalid={!!error}>
      {label && <FieldLabel className="text-sm text-gray-400">{label}</FieldLabel>}
      <InputGroup>
        <InputGroupTextarea {...register} rows={rows} className="focus-visible:ring-1 text-sm" />
        <span
          className={`absolute bottom-1 right-2 text-sm ${
            isNearLimit ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          {charCount} / {limit}
        </span>
      </InputGroup>
      {error && <FieldError errors={[{ message: error }]} />}
      {removable && onRemove && (
        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
          className="text-sm mt-1 text-red-500 cursor-pointer"
        >
          Slett {removeText}
        </Button>
      )}
    </Field>
  );
}
