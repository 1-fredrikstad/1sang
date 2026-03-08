'use client';

// TODO: Comment in code when API logic is merged

import { songSuggestionSchema, TEXT_PATTERN } from '@/src/lib/validation/songSuggestionSchema';
import { useEffect } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';

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

// Validation rules

const titleValidation = {
  required: 'Du må skrive inn tittel',
  maxLength: {
    value: songSuggestionSchema.title.maxLength,
    message: 'Tittel kan maks være 40 tegn',
  },
  pattern: {
    value: TEXT_PATTERN,
    message: 'Tittelen inneholder ugyldige tegn',
  },
};

const authorValidation = {
  maxLength: {
    value: songSuggestionSchema.author.maxLength,
    message: 'Låtskriver kan maks være 40 tegn',
  },
  pattern: {
    value: TEXT_PATTERN,
    message: 'Låtskriver inneholder ugyldige tegn',
  },
};

const melodyValidation = {
  maxLength: {
    value: songSuggestionSchema.melody.maxLength,
    message: 'Melodi kan maks være 40 tegn',
  },
  pattern: {
    value: TEXT_PATTERN,
    message: 'Melodi inneholder ugyldige tegn',
  },
};

const lyricsValidation = {
  required: 'Du må skrive inn sangtekst',
  minLength: {
    value: songSuggestionSchema.lyrics.minLength,
    message: 'Sangteksten må være minst 20 tegn',
  },
  maxLength: {
    value: songSuggestionSchema.lyrics.maxLength,
    message: 'Sangteksten kan maks være 3000 tegn',
  },
  pattern: {
    value: TEXT_PATTERN,
    message: 'Sangteksten inneholder ugyldige tegn',
  },
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

  // const [isSubmitting, setIsSubmitting] = useState(false);
  const lyricsValue = useWatch({ control, name: 'lyrics' }) || '';
  // const notify = () => toast('Sang lagt inn');

  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await onSubmit(data);
      // notify();
      toast(toastSuccessMessage);

      // setIsSubmitting(true);
      //   const res = await fetch('/api/songs', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(data),
      //   });
      //   if (res.ok) alert('Sang lagt til');

      // if(!res.ok) {
      // const errorData = await res.json();
      // throw new Error(errorData.message || 'Serverfeil');
      //}
    } catch (error) {
      console.error(error);
      toast.error('Noe gikk galt');
    }
    // finally {
    //     setIsSubmitting(false)
    // }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col m-8 gap-1 max-w-2xl md:mx-auto"
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
          {...register('title', titleValidation)}
          className=" mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
        ></input>

        {/* Author */}
        <label>Låtskriver</label>
        <input
          {...register('author', authorValidation)}
          className="mb-5 p-1 outline outline-[#E6E4E2]  rounded-xs"
        />

        {/* Melody */}
        <label>Melodi</label>
        <input
          {...register('melody', melodyValidation)}
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
          {...register('lyrics', lyricsValidation)}
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
          // disabled={isSubmitting}
          className="disabled:opacity-50 self-center font-bold py-2 px-4 rounded-xs cursor-pointer"
        >
          {submitLabel}
        </button>
      </form>

      {/* Toast */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
