'use client';

import { getFieldValidation } from '@/src/lib/validation/songSuggestionSchema';
// import { useEffect } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { toast } from 'react-toastify';
import TagSelect from './TagSelect';

type Tag = {
  id: string;
  name: string;
};

import SubmitButton from './SubmitButton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Inputs = {
  title: string;
  melody: string;
  author: string;
  lyrics: string;
  tags?: Tag[];
  spotify_youtube: string;
};

type SongFormProps = {
  heading: string;
  submitLabel: string;
  initialValues?: Partial<Inputs>;
  showTags?: boolean;
  onSubmit: (data: Omit<Inputs, 'tags'> & { tags?: string[] }) => Promise<void> | void;
  toastSuccessMessage?: string;
};

const MAX_LYRICS_LENGTH = 3000;

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
      spotify_youtube: '',
      tags: [],
      ...initialValues,
    },
  });

  const router = useRouter();

  // useEffect(() => {
  //   if (initialValues) {
  //     reset({
  //       title: initialValues.title ?? '',
  //       melody: initialValues.melody ?? '',
  //       author: initialValues.author ?? '',
  //       lyrics: initialValues.lyrics ?? '',
  //       spotify_youtube: initialValues.spotify_youtube ?? '',
  //       tags: initialValues.tags ?? [],
  //     });
  //   }
  // }, [initialValues, reset]);

  const lyricsValue = useWatch({ control, name: 'lyrics' }) || '';
  const charCount = lyricsValue.length;
  const isNearLimit = charCount > 2900;

  const selectedTags = useWatch({ control, name: 'tags' }) ?? [];

  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const payload = {
        ...data,
        tags: selectedTags.map((t) => t.id),
      };

      await onSubmit(payload);

      toast.success(toastSuccessMessage);
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt');
    }
  };

  return (
    <form
      id="form-add-song"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col m-8 mb-4 gap-1 max-w-2xl md:mx-auto"
    >
      <h1 className=" text-xl mb-2">{heading}</h1>

      <FieldGroup>
        {/* Title */}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="form-add-song-title">Tittel*</FieldLabel>
          <Input
            id="form-add-song-title"
            aria-invalid={!!errors.title}
            {...register('title', getFieldValidation('title'))}
            className="focus-visible:ring-1 text-sm"
          />
          {errors.title && <FieldError errors={[errors.title]} />}
        </Field>

        {/* Author */}
        <Field data-invalid={!!errors.author}>
          <FieldLabel htmlFor="form-add-song-author">Låtskriver</FieldLabel>
          <Input
            id="form-add-song-author"
            aria-invalid={!!errors.author}
            {...register('author', getFieldValidation('author'))}
            className="focus-visible:ring-1 text-sm"
          />
          {errors.author && <FieldError errors={[errors.author]} />}
        </Field>

        {/* Melody */}
        <Field data-invalid={!!errors.melody}>
          <FieldLabel htmlFor="form-add-song-melody">Melodi</FieldLabel>
          <Input
            id="form-add-song-melody"
            aria-invalid={!!errors.melody}
            {...register('melody', getFieldValidation('melody'))}
            className="focus-visible:ring-1 text-sm"
          />
          {errors.melody && <FieldError errors={[errors.melody]} />}
        </Field>

        {/* Lyrics */}
        <Field data-invalid={!!errors.lyrics}>
          <FieldLabel htmlFor="form-add-song-lyrics">Sangtekst*</FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="form-add-song-lyrics"
              aria-invalid={!!errors.lyrics}
              rows={6}
              {...register('lyrics', getFieldValidation('lyrics'))}
              className="focus-visible:ring-1 text-sm"
            />
            <InputGroupAddon align="block-end">
              <InputGroupText
                className={`text-sm text-right mr-2 tabular-nums ${
                  isNearLimit ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {charCount} / {MAX_LYRICS_LENGTH}
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {errors.lyrics && <FieldError errors={[errors.lyrics]} />}
        </Field>

        {/* Links */}
        <Field data-invalid={!!errors.spotify_youtube}>
          <FieldLabel htmlFor="add-form-song-link">Spotify/YouTube-lenke</FieldLabel>
          <Input
            id="form-add-song-link"
            aria-invalid={!!errors.spotify_youtube}
            {...register('spotify_youtube', getFieldValidation('spotify_youtube'))}
            className="focus-visible:ring-1 text-sm"
          />
          {errors.spotify_youtube && <FieldError errors={[errors.spotify_youtube]} />}
        </Field>

        {/* Tags */}
        <Field className="w-56">
          <FieldLabel htmlFor="form-add-song-tags">Tags</FieldLabel>
          {showTags && (
            <TagSelect value={selectedTags} onChange={(tags) => setValue('tags', tags)} />
          )}
        </Field>
      </FieldGroup>

      {/* Submit and reset */}
      <div className="mt-4 flex flex-row gap-4">
        <SubmitButton submitLabel={submitLabel} />
        <Button type="button" variant="outline" onClick={() => reset()} className="cursor-pointer">
          Reset
        </Button>
      </div>
    </form>
  );
}
