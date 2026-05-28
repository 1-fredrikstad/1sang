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
import { capitalizeFirst } from '@/src/lib/utils/capitalizeFormat';
import MobileTooltip from '../MobileTooltip';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

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
  song_number?: number | null;
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
  onSaveDraft?: (data: Partial<Inputs>) => Promise<void> | void;
  saveDraftLabel?: string;
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
  onSaveDraft,
  saveDraftLabel = 'Lagre utkast',
}: SongFormProps) {
  /**
   * React Hook Form setup:
   * - central state manager for all form fields
   * - avoids local state duplication
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    control,
    reset,
    setValue,
    clearErrors,
    getValues,
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
      song_number: initialValues.song_number ?? null,
    });
  }, [initialValues, reset]);

  /**
   * Reactive field subscriptions (UI-only derived values)
   * useWatch ensures component re-renders when values change.
   */
  const chorusValue = useWatch({ control, name: 'chorus' }) || '';
  const chorusCharCount = chorusValue.length;

  const watchVerses = useWatch({ control, name: 'verses' }) || [];

  // Checks whether there exists a verse with content
  const hasAnyVerseContent = watchVerses.some((v) => v && v.trim().length > 0);

  /**
   * Chorus UI toggle (local UI state, not persisted field)
   * Controls whether chorus input exists in the form.
   */
  const [hasChorus, setHasChorus] = useState(!!initialValues?.chorus);

  const selectedTags = useWatch({ control, name: 'tags' }) ?? [];

  /**
   * Chords toggle stored in form state (boolean)
   */
  const hasChords = useWatch({
    control,
    name: 'has_chords',
    defaultValue: false,
  });

  /**
   * Turns off has_chords where there is no verse
   */
  useEffect(() => {
    if (!hasAnyVerseContent && hasChords) {
      setValue('has_chords', false);
    }
  }, [hasAnyVerseContent, hasChords, setValue]);

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
            {...register('title', {
              ...getFieldValidation('title'),
              setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
            })}
            placeholder="Når dagen begynnner en knute jeg gjør"
            onBlur={(e) => setValue('title', capitalizeFirst(e.target.value))}
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
            {...register('author', {
              ...getFieldValidation('author'),
              setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
            })}
            placeholder="Hans Møller Gasmann"
            onBlur={(e) => setValue('author', capitalizeFirst(e.target.value))}
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
            {...register('melody', {
              ...getFieldValidation('melody'),
              setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
            })}
            placeholder="Turallerei"
            onBlur={(e) => setValue('melody', capitalizeFirst(e.target.value))}
            className="focus-visible:ring-1 text-sm"
          />
          {errors.melody && <FieldError errors={[errors.melody]} />}
        </Field>

        {/* Links */}
        <Field data-invalid={!!errors.spotify_youtube}>
          <FieldLabel htmlFor="add-form-song-link">
            <span className="flex items-center gap-2">
              Spotify/YouTube-lenke
              <MobileTooltip
                trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
              >
                Her kan du legge inn en lenke til melodi på Spotify eller Youtube
              </MobileTooltip>
            </span>
          </FieldLabel>
          <Input
            id="form-add-song-link"
            aria-invalid={!!errors.spotify_youtube}
            {...register('spotify_youtube', getFieldValidation('spotify_youtube'))}
            placeholder="https://youtube.com/"
            className="focus-visible:ring-1 text-sm"
          />
          {errors.spotify_youtube && <FieldError errors={[errors.spotify_youtube]} />}
        </Field>

        {/* Song number (admin only) */}
        {showTags && (
          <Field>
            <FieldLabel htmlFor="form-add-song-number">Sangnummer</FieldLabel>
            <Input
              id="form-add-song-number"
              type="number"
              min={1}
              {...register('song_number', {
                setValueAs: (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
              })}
              placeholder="Valgfritt – kun for trykt versjon"
              className="focus-visible:ring-1 text-sm"
            />
          </Field>
        )}

        {/* Tags */}
        {showTags && (
          <Field className="w-full">
            <FieldLabel htmlFor="form-add-song-tags">
              <span className="flex items-center gap-2">
                Tags
                <MobileTooltip
                  trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
                >
                  Tags gjør at du kan si hva slags type sang dette er
                </MobileTooltip>
              </span>
            </FieldLabel>
            <TagSelect value={selectedTags} onChange={(tags) => setValue('tags', tags)} />
          </Field>
        )}
      </FieldGroup>

      {/* Verses */}
      <Field data-invalid={typeof errors.verses === 'string'}>
        <FieldLabel>Vers*</FieldLabel>
        {watchVerses.map((verse, i) => {
          const charCount = verse?.length || 0;

          return (
            <SectionInput
              key={i}
              label={`Vers ${i + 1}`}
              register={register(`verses.${i}`, {
                ...getFieldValidation('verses'),
                setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
              })}
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
          {typeof errors.verses === 'string' && (
            <FieldError errors={[{ message: errors.verses }]} />
          )}
        </div>
      </Field>

      {/* Chorus */}
      <Field data-invalid={!!errors.chorus} className="mt-4">
        <FieldLabel>Refreng</FieldLabel>
        {hasChorus ? (
          <SectionInput
            register={register('chorus', {
              ...getFieldValidation('chorus'),
              setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
            })}
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
      <Field className="flex flex-row my-4">
        <FieldLabel>
          <span className="flex items-center gap-2">
            Legg til akkorder
            <MobileTooltip trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}>
              Du kan bare legge til akkorder etter du har lagt til et vers
            </MobileTooltip>
          </span>
        </FieldLabel>
        <Switch
          size="lg"
          checked={hasChords}
          onCheckedChange={(val) => setValue('has_chords', val)}
          disabled={!hasAnyVerseContent}
          className="cursor-pointer"
        />
      </Field>

      {hasChords && <ChordPreview sections={chordSections} />}

      {/* Submit and reset */}
      <div className="flex gap-4 mt-4 flex-wrap">
        <SubmitButton submitLabel={submitLabel} disabled={isSubmitting} />
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSaveDraft(getValues())}
            className="cursor-pointer"
          >
            {saveDraftLabel}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => reset()} className="cursor-pointer">
          Nullstill
        </Button>
      </div>

      {/* Sticky save bar — shown when form has unsaved changes */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 bg-background/90 backdrop-blur border-t border-border shadow-lg">
          <SubmitButton submitLabel={submitLabel} disabled={isSubmitting} />
        </div>
      )}
    </form>
  );
}
