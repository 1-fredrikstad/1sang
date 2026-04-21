'use client';

import { getFieldValidation } from '@/src/lib/validation/songSuggestionSchema';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TagSelect from '../TagSelect';
import SubmitButton from '../SubmitButton';
import { Button } from '@/components/ui/button';
import SectionInput from '../SectionInput';
import ChordPreview from '../chords/ChordPreview';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

/**
 * Form data structure used both for:
 * - React Hook Form state
 * - API payload Supabase
 */
type Inputs = {
  title: string;
  melody: string;
  author: string;
  chorus: string;
  verses: string[];
  tags?: Tag[];
  spotify_youtube: string;
  has_chords: boolean;
};

/**
 * Props for SongForm component
 * Supports both create and edit modes via `initialValues`
 */
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

// Max length of verses and chorus
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
  /**
   * React Hook Form setup:
   * - central state manager for all form fields
   * - avoids local state duplication
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      has_chords: initialValues?.has_chords ?? false,
      ...initialValues,
    },
  });

  /**
   * Reactive field subscriptions (UI-only derived values)
   * useWatch ensures component re-renders when values change.
   */
  const chorusValue = useWatch({ control, name: 'chorus' }) || '';
  const chorusCharCount = chorusValue.length;

  const watchVerses = useWatch({ control, name: 'verses' }) || [];

  /**
   * Chorus UI toggle (local UI state, not persisted field)
   * Controls whether chorus input exists in the form.
   */
  const [hasChorus, setHasChorus] = useState(!!initialValues?.chorus);

  /**
   * Chords toggle stored in form state (boolean)
   */
  const hasChords = useWatch({
    control,
    name: 'has_chords',
    defaultValue: false,
  });

  const selectedTags = useWatch({ control, name: 'tags' }) ?? [];

  /**
   * Hydrate form when editing existing song.
   * React Hook Form does NOT update defaultValues after mount,
   * so reset() is required when initialValues arrives async.
   */
  useEffect(() => {
    if (!initialValues) return;

    reset({
      title: initialValues.title ?? '',
      melody: initialValues.melody ?? '',
      author: initialValues.author ?? '',
      chorus: initialValues.chorus ?? '',
      verses: initialValues.verses?.length ? initialValues.verses : [''],
      spotify_youtube: initialValues.spotify_youtube ?? '',
      tags: initialValues.tags ?? [],
      has_chords: initialValues.has_chords ?? false,
    });
  }, [initialValues, reset]);

  /**
   * Submit handler:
   * - merges form data + derived tag IDs
   * - sends to API
   * - handles success/error UI feedback
   */
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

  /**
   * Data structure used by ChordPreview.
   * Combines verses + optional chorus section.
   */
  const chordSections = [
    ...watchVerses.map((verse, i) => ({
      label: `Vers ${i + 1}`,
      value: verse || '',
      onChange: (val: string) => setValue(`verses.${i}`, val),
    })),
    ...(hasChorus
      ? [
          {
            label: 'Refreng',
            value: chorusValue,
            onChange: (val: string) => setValue('chorus', val),
          },
        ]
      : []),
  ];

  return (
    <form
      id="form-add-song"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col m-2 mx-auto gap-1 max-w-2xl"
    >
      <h1>{heading}</h1>

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
        {showTags && (
          <Field className="w-full">
            <FieldLabel htmlFor="form-add-song-tags">Tags</FieldLabel>
            <TagSelect value={selectedTags} onChange={(tags) => setValue('tags', tags)} />
          </Field>
        )}
      </FieldGroup>

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
        <div className="flex flex-row">
          <Button
            type="button"
            onClick={() => setValue('verses', [...watchVerses, ''])}
            className="cursor-pointer hover:bg-btn-hover"
          >
            + Legg til vers
          </Button>
          {errors.verses && <FieldError errors={[errors.verses]} />}
        </div>
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
              setValue('chorus', '');
              clearErrors('chorus');
              setHasChorus(false);
            }}
            removeText="refreng"
            charCount={chorusCharCount}
            limit={MAX_CHORUS_LENGTH}
          ></SectionInput>
        ) : (
          <div className="flex flex-row">
            <Button
              type="button"
              onClick={() => {
                setHasChorus(true);
              }}
              className="cursor-pointer hover:bg-btn-hover"
            >
              + Legg til refreng
            </Button>
          </div>
        )}
      </Field>

      {/* Chord-toggle */}
      <div className="flex items-center gap-3 mt-2">
        <Switch
          size="lg"
          checked={hasChords}
          onCheckedChange={(val) => setValue('has_chords', val)}
          className="cursor-pointer"
        />
        <label className="text-sm">Legg til akkorder</label>
      </div>

      {hasChords && <ChordPreview sections={chordSections} />}

      {/* Submit and reset */}
      <div className="mt-4 flex flex-row gap-4">
        <SubmitButton submitLabel={submitLabel} disabled={isSubmitting} />
        <Button type="button" variant="outline" onClick={() => reset()} className="cursor-pointer">
          Reset
        </Button>
      </div>
    </form>
  );
}
