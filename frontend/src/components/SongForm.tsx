'use client';

// TODO: Comment in code when API logic is merged

import { getFieldValidation } from '@/src/lib/validation/songSuggestionSchema';
import { useEffect } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import TagSelect from './TagSelect';

type Tag = {
  id: string;
  name: string;
};
import SubmitButton from './SubmitButton';

type Inputs = {
  title: string;
  melody: string;
  author: string;
  lyrics: string;
  tags?: Tag[];
};

type SongFormProps = {
  heading: string;
  submitLabel: string;
  initialValues?: Partial<Inputs>;
  showTags?: boolean;
  onSubmit: (data: Omit<Inputs, 'tags'> & { tags?: string[] }) => Promise<void> | void;
  toastSuccessMessage?: string;
};

export default function SongForm({
  heading,
  submitLabel,
  initialValues,
  showTags,
  onSubmit,
  toastSuccessMessage = 'Lagret',
}: SongFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm<Inputs>({
    defaultValues: {
      title: '',
      melody: '',
      author: '',
      lyrics: '',
      tags: [],
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
        tags: initialValues.tags ?? [],
      });
    }
  }, [initialValues, reset]);

  const lyricsValue = useWatch({ control, name: 'lyrics' }) || '';
  const selectedTags = useWatch({ control, name: 'tags' }) ?? [];
  // const notify = () => toast('Sang lagt inn');

  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const payload = {
        ...data,
        tags: selectedTags.map((t) => t.id),
      };

      await onSubmit(payload);

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
          <label htmlFor="title">Tittel*</label>
          {errors.title && (
            <span className="text-red-500 italic ml-2">{errors.title.message}</span>
          )}{' '}
        </span>
        <input
          id="title"
          {...register('title', getFieldValidation('title'))}
          className=" mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
        ></input>

        {/* Author */}
        <label htmlFor="author">Låtskriver</label>
        <input
          id="author"
          {...register('author', getFieldValidation('author'))}
          className="mb-5 p-1 outline outline-[#E6E4E2]  rounded-xs"
        />

        {/* Melody */}
        <label htmlFor="melody">Melodi</label>
        <input
          id="melody"
          {...register('melody', getFieldValidation('melody'))}
          className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
        ></input>

        {/* Lyrics */}
        <span>
          <label htmlFor="lyrics">Sangtekst*</label>
          {errors.lyrics && (
            <span className="text-red-500 italic ml-2">{errors.lyrics.message}</span>
          )}
        </span>
        <textarea
          id="lyrics"
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
        {/* Tags */}
        {showTags && <TagSelect value={selectedTags} onChange={(tags) => setValue('tags', tags)} />}

        {/* Submit */}
        <SubmitButton submitLabel={submitLabel} />
      </form>
    </>
  );
}
