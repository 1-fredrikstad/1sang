'use client';

import { getFieldValidation } from '@/src/lib/validation/songSuggestionSchema';
// import { useEffect } from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TagSelect from '../TagSelect';
import SubmitButton from '../SubmitButton';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import SectionInput from '../SectionInput';
import { useState } from 'react';

type Inputs = {
  title: string;
  melody: string;
  author: string;
  chorus: string;
  verses: string[];
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

type Tag = {
  id: string;
  name: string;
};

const MAX_VERSE_LENGTH = 1000;
const MAX_CHORUS_LENGTH = 500;

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
    clearErrors,
  } = useForm<Inputs>({
    defaultValues: {
      title: '',
      melody: '',
      author: '',
      chorus: '',
      verses: initialValues?.verses?.length ? initialValues.verses : [''],
      spotify_youtube: '',
      tags: [],
      ...initialValues,
    },
  });

  const router = useRouter();

  const chorusValue = useWatch({ control, name: 'chorus' }) || '';
  const chorusCharCount = chorusValue.length;

  const watchVerses = useWatch({ control, name: 'verses' }) || [];
  const [hasChorus, sethasChorus] = useState(false);

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

        {/* Verses */}
        <Field>
          <FieldLabel>Vers*</FieldLabel>
          {watchVerses.map((verse, i) => {
            const charCount = verse?.length || 0;

            return (
              <SectionInput
                key={i}
                label={`Vers ${i + 1}`}
                register={register(`verses.${i}`, getFieldValidation('verses'))}
                error={errors.verses && errors.verses[i]?.message}
                removable={i > 0}
                onRemove={() => {
                  const updated = [...watchVerses];
                  updated.splice(i, 1);
                  setValue('verses', updated);
                  clearErrors(`verses.${i}`);
                }}
                removeText="vers"
                charCount={charCount}
                limit={MAX_VERSE_LENGTH}
              ></SectionInput>
            );
          })}

          <Button
            type="button"
            onClick={() => setValue('verses', [...watchVerses, ''])}
            className="cursor-pointer hover:bg-btn-hover"
          >
            + Legg til vers
          </Button>
          {errors.verses && <FieldError errors={[errors.verses]} />}
        </Field>

        {/* Chorus */}
        <Field data-invalid={!!errors.chorus}>
          <FieldLabel>Refreng</FieldLabel>
          {hasChorus ? (
            <SectionInput
              register={register('chorus', getFieldValidation('chorus'))}
              error={errors.chorus?.message}
              removable
              onRemove={() => {
                sethasChorus(false);
                setValue('chorus', '');
                clearErrors('chorus');
              }}
              removeText="refreng"
              charCount={chorusCharCount}
              limit={MAX_CHORUS_LENGTH}
            ></SectionInput>
          ) : (
            <Button
              type="button"
              onClick={() => {
                sethasChorus(true);
              }}
              className="cursor-pointer hover:bg-btn-hover"
            >
              + Legg til refreng
            </Button>
          )}
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
