'use client';

import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { getPlaylistFieldValidation } from '@/src/lib/validation/playlistSchema';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import { useSongs } from '@/src/hooks/useData';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import MobileTooltip from '../MobileTooltip';
import SubmitButton from '../SubmitButton';
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PlaylistSongPickerModal from './PlaylistSongPickerModal';
import { SongBox } from '../songs/SongBox';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { capitalizeFirst } from '@/src/lib/utils/capitalizeFormat';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

type PlaylistFormProps = {
  onSubmit: SubmitHandler<PlaylistInputs>;
  initialValues?: PlaylistInputs;
  mode?: 'create' | 'edit';
};

export default function PlaylistForm({
  onSubmit,
  initialValues,
  mode = 'create',
}: PlaylistFormProps) {
  // form setup with react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PlaylistInputs>({
    defaultValues: initialValues ?? {
      title: '',
      password: '',
      newPassword: '',
      songsInPlaylist: [],
      duration: 604800,
      isPublic: false,
    },
  });

  // watch public/private toggle
  const isPublic = useWatch({ name: 'isPublic', control });

  // modal state for selecting songs
  const [open, setOpen] = useState(false);

  // password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // online status (used to disable public playlists offline)
  const isOnline = useOnlineStatus();

  // watch selected songs in playlist
  const songsInPlaylist = useWatch({
    name: 'songsInPlaylist',
    control,
  });

  const hasSongs = songsInPlaylist.length > 0;

  // fetch songs for picker modal
  const { data: songs } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  // normalize + submit handler
  const handleFormSubmit: SubmitHandler<PlaylistInputs> = async (data) => {
    const normalized = {
      ...data,
      title: capitalizeFirst(data.title),
    };

    await onSubmit(normalized);
  };

  return (
    <form
      id="form-add-playlist"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col m-4 mx-auto gap-1 max-w-2xl mb-0"
    >
      {/* header */}
      <h1 className="text-xl mb-2">
        {mode === 'edit' ? 'Rediger spilleliste' : 'Lag ny spilleliste'}
      </h1>

      <FieldGroup className="mb-5">
        {/* title input */}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="playlist-title">Tittel*</FieldLabel>
          <Input
            id="playlist-title"
            {...register('title', {
              ...getPlaylistFieldValidation('title'),
              setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
            })}
            onBlur={(e) => setValue('title', capitalizeFirst(e.target.value))}
          />
          {errors.title && <FieldError errors={[errors.title]} />}
        </Field>

        {/* password fields (create vs edit mode) */}
        {mode === 'create' ? (
          <>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="playlist-password">
                <span className="flex items-center gap-2">
                  Lag passord*
                  <MobileTooltip
                    trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
                  >
                    Passord må være mellom 4 og 20 tegn
                  </MobileTooltip>
                </span>
              </FieldLabel>

              <FieldDescription>
                NB! Husk passordet. Det trengs for å redigere eller slette spillelisten senere.
              </FieldDescription>

              {/* password input with toggle visibility */}
              <div className="relative">
                <Input
                  id="playlist-password"
                  {...register('password', {
                    ...getPlaylistFieldValidation('password'),
                    setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
                  })}
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password && <FieldError errors={[errors.password]} />}
            </Field>
          </>
        ) : (
          // edit mode: optional new password
          <Field data-invalid={!!errors.newPassword}>
            <FieldLabel htmlFor="playlist-new-password">Nytt passord (valgfritt)</FieldLabel>

            <div className="relative">
              <Input
                id="playlist-new-password"
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.newPassword && <FieldError errors={[errors.newPassword]} />}
          </Field>
        )}

        {/* song selection section */}
        <Field>
          <FieldLabel>
            <span className="flex items-center gap-2">
              {hasSongs ? `Sanger (${songsInPlaylist.length})` : 'Legg til sanger'}
              <MobileTooltip
                trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
              >
                Minst én sang må velges
              </MobileTooltip>
            </span>
          </FieldLabel>

          {/* preview selected songs */}
          {songsInPlaylist.length > 0 && (
            <ul className="flex flex-col gap-2 mt-2">
              {songsInPlaylist.map((song) => (
                <li key={song.id}>
                  <SongBox song={song} mode="select" hoverVariant="none" />
                </li>
              ))}
            </ul>
          )}

          {/* open song picker modal */}
          <div className="mt-2">
            <Button type="button" onClick={() => setOpen(true)}>
              {hasSongs ? 'Endre sanger' : 'Velg sanger'}
            </Button>
          </div>

          {/* modal for selecting songs */}
          <PlaylistSongPickerModal
            songs={songs ?? []}
            open={open}
            onOpenChange={setOpen}
            songsInPlaylist={songsInPlaylist}
            setSongsInPlaylist={(songs) => setValue('songsInPlaylist', songs)}
          />
        </Field>

        {/* public/private toggle */}
        <Field className="flex flex-row">
          <FieldLabel>
            <span className="flex items-center gap-2">
              Offentlig spilleliste
              <MobileTooltip
                trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
              >
                Offentlig = synlig for andre, privat = kun deg
              </MobileTooltip>
            </span>
          </FieldLabel>

          <Switch
            size="lg"
            checked={isPublic}
            onCheckedChange={(val) => setValue('isPublic', val)}
            disabled={!isOnline || isSubmitting}
            className="cursor-pointer"
          />

          {/* offline warning */}
          {!isOnline && (
            <FieldDescription>
              Du er offline. Koble til internett for å lage offentlige spillelister.
            </FieldDescription>
          )}
        </Field>

        {/* duration only for public playlists */}
        {isPublic && (
          <Field>
            <FieldLabel>
              <span className="flex items-center gap-2">
                Varighet
                <MobileTooltip
                  trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
                >
                  Hvor lenge spillelisten er tilgjengelig før automatisk sletting
                </MobileTooltip>
              </span>
            </FieldLabel>

            <Select
              defaultValue="604800"
              onValueChange={(value) => setValue('duration', Number(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Velg varighet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="604800">7 dager</SelectItem>
                <SelectItem value="2592000">30 dager</SelectItem>
                <SelectItem value="7776000">90 dager</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      </FieldGroup>

      {/* submit/reset actions */}
      <div className="flex gap-4 mt-4">
        <SubmitButton
          submitLabel={mode === 'edit' ? 'Lagre endringer' : 'Opprett spilleliste'}
          disabled={isSubmitting}
        />
        <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
          Nullstill
        </Button>
      </div>
    </form>
  );
}
