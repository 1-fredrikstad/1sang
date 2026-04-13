'use client';

import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { getPlaylistFieldValidation } from '@/src/lib/validation/playlistSchema';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import SongList from './SongList';
import { useSongs } from '@/src/hooks/useData';
import { Song } from '@/src/lib/db';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import MobileTooltip from '../MobileTooltip';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
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

  const songsInPlaylist = useWatch({ name: 'songsInPlaylist', control });
  const isPublic = useWatch({ name: 'isPublic', control });

  const {
    data: songs,
    isLoading,
    error,
  } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  const isSongAdded = useCallback(
    (id: string) => songsInPlaylist.some((s) => s.id === id),
    [songsInPlaylist]
  );

  const toggleSong = useCallback(
    (song: Song) => {
      const exists = songsInPlaylist.some((s) => s.id === song.id);

      if (exists) {
        setValue(
          'songsInPlaylist',
          songsInPlaylist.filter((s) => s.id !== song.id)
        );
        toast.error('Sang fjernet');
      } else {
        setValue('songsInPlaylist', [...songsInPlaylist, song]);
        toast.success('Sang lagt til');
      }
    },
    [songsInPlaylist, setValue]
  );

  const handleFormSubmit: SubmitHandler<PlaylistInputs> = async (data) => {
    await onSubmit(data);
    router.push('/playlists');
  };

  return (
    <form
      id="form-add-playlist"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col m-4 gap-1 max-w-2xl"
    >
      <h1 className="text-xl mb-2">
        {mode === 'edit' ? 'Rediger spilleliste' : 'Lag ny spilleliste'}
      </h1>

      <FieldGroup className="mb-5">
        {/* Title */}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="playlist-title">Tittel*</FieldLabel>
          <Input id="playlist-title" {...register('title', getPlaylistFieldValidation('title'))} />
          {errors.title && <FieldError errors={[errors.title]} />}
        </Field>

        {/* Password / New Password */}
        {mode === 'create' ? (
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="playlist-password">Passord*</FieldLabel>
            <FieldDescription>NB: Husk for å redigere/slette spillelister</FieldDescription>
            <Input
              id="playlist-password"
              {...register('password', getPlaylistFieldValidation('password'))}
            />
            {errors.password && <FieldError errors={[errors.password]} />}
          </Field>
        ) : (
          <Field data-invalid={!!errors.newPassword}>
            <FieldLabel htmlFor="playlist-new-password">Nytt passord (valgfritt)</FieldLabel>
            <Input id="playlist-new-password" {...register('newPassword')} />
            {errors.newPassword && <FieldError errors={[errors.newPassword]} />}
          </Field>
        )}

        {/* Songlist */}
        <Field>
          <FieldLabel>Legg til sanger</FieldLabel>
          <SongList
            songs={songs}
            isLoading={isLoading}
            error={error}
            onToggleSong={toggleSong}
            isAdded={isSongAdded}
          />
        </Field>

        {/* Public switch */}
        <Field className="flex flex-row">
          <FieldLabel>Offentlig spilleliste</FieldLabel>
          <Switch checked={isPublic} onCheckedChange={(val) => setValue('isPublic', val)} />
        </Field>

        {/* Duration */}
        {mode === 'create' && isPublic && (
          <Field>
            <FieldLabel>
              <span className="flex items-center gap-2">
                Varighet
                <MobileTooltip
                  trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
                >
                  Hvor lenge spillelisten skal eksistere før den slettes automatisk
                </MobileTooltip>
              </span>
            </FieldLabel>
            <Select
              defaultValue="604800"
              onValueChange={(value) => setValue('duration', Number(value))}
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

      <div className="flex gap-4 mt-4">
        <Button type="submit">{mode === 'edit' ? 'Lagre endringer' : 'Opprett spilleliste'}</Button>
        <Button type="button" variant="outline" onClick={() => reset()}>
          Reset
        </Button>
      </div>
    </form>
  );
}
