'use client';

import { getFieldValidation } from '@/src/lib/validation/songSuggestionSchema';
import { useEffect } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

type Inputs = {
  title: string;
  melody: string;
  author: string;
  lyrics: string;
};

type SongFormProps = {
  heading: string;
  submitLabel: string;
  initialValues?: Partial<Inputs>;
  onSubmit: (data: Inputs) => Promise<void> | void;
  toastSuccessMessage?: string;
};

export default function SongForm({
  heading,
  submitLabel,
  initialValues,
  onSubmit,
  toastSuccessMessage = 'Lagret',
}: SongFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<Inputs>({
    defaultValues: {
      title: '',
      melody: '',
      author: '',
      lyrics: '',
      ...initialValues,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        title: initialValues.title ?? '',
        melody: initialValues.melody ?? '',
        author: initialValues.author ?? '',
        lyrics: initialValues.lyrics ?? '',
      });
    }
  }, [initialValues, reset]);

  const lyricsValue = useWatch({ control, name: 'lyrics' }) || '';

  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await onSubmit(data);
      toast.success(toastSuccessMessage);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col m-8 mb-4 gap-1 max-w-2xl md:mx-auto"
      >
        <h1 className=" text-xl mb-2">{heading}</h1>

        {/* Title */}
        <span>
          <label>Tittel*</label>
          {errors.title && (
            <span className="text-red-500 italic ml-2">{errors.title.message}</span>
          )}{' '}
        </span>
        <input
          {...register('title', getFieldValidation('title'))}
          className=" mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
        ></input>

        {/* Author */}
        <label>Låtskriver</label>
        <input
          {...register('author', getFieldValidation('author'))}
          className="mb-5 p-1 outline outline-[#E6E4E2]  rounded-xs"
        />

        {/* Melody */}
        <label>Melodi</label>
        <input
          {...register('melody', getFieldValidation('melody'))}
          className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
        ></input>

        {/* Lyrics */}
        <span>
          <label>Sangtekst*</label>
          {errors.lyrics && (
            <span className="text-red-500 italic ml-2">{errors.lyrics.message}</span>
          )}
        </span>
        <textarea
          {...register('lyrics', getFieldValidation('lyrics'))}
          className="p-1 outline outline-[#E6E4E2] rounded-sm h-70 resize-y text-left"
        ></textarea>
        <div
          className={`text-sm text-right mr-2 ${
            lyricsValue.length > 2900 ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {lyricsValue.length} / 3000
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="disabled:opacity-50 self-center font-bold py-2 px-4 rounded-xs cursor-pointer"
        >
          {submitLabel}
        </button>
      </form>
    </>
  );
}
