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
    router.push('/');
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col m-8 mb-4 gap-1 max-w-2xl md:mx-auto"
    >
      <h1 className="text-xl mb-2">
        {mode === 'edit' ? 'Rediger spilleliste' : 'Lag ny spilleliste'}
      </h1>

      {/* Title */}
      <span>
        <label htmlFor="title">Tittel*</label>
        {errors.title && <span className="text-red-500 italic ml-2">{errors.title.message}</span>}
      </span>
      <input
        id="title"
        type="text"
        {...register('title', getPlaylistFieldValidation('title'))}
        className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
      />

      {/* Password / New Password */}
      {mode === 'create' ? (
        <>
          <span>
            <label htmlFor="password">Passord* (NB! Husk for å redigere/slette spillelister)</label>
            {errors.password && (
              <span className="text-red-500 italic ml-2">{errors.password.message}</span>
            )}
          </span>
          <input
            id="password"
            {...register('password', getPlaylistFieldValidation('password'))}
            className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
          />
        </>
      ) : (
        <>
          <span>
            <label htmlFor="newPassword">Nytt passord (valgfritt)</label>
            {errors.newPassword && (
              <span className="text-red-500 italic ml-2">{errors.newPassword.message}</span>
            )}
          </span>
          <input
            id="newPassword"
            {...register('newPassword')}
            className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
          />
        </>
      )}

      {/* Songs */}
      <SongList
        songs={songs}
        isLoading={isLoading}
        error={error}
        onToggleSong={toggleSong}
        isAdded={isSongAdded}
      />

      {/* Public toggle */}
      <span className="inline-flex items-center gap-2 mb-6">
        <p>Offentlig spilleliste:</p>
        <Switch checked={isPublic} onCheckedChange={(value) => setValue('isPublic', value)} />
      </span>

      {/* Duration (only create + public) */}
      {mode === 'create' && isPublic && (
        <section className="mb-4">
          <label htmlFor="duration" className="block mb-2">
            <span className="flex items-center gap-2">
              Varighet
              <MobileTooltip
                trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}
              >
                Hvor lenge spillelisten skal eksistere før den slettes automatisk
              </MobileTooltip>
            </span>
          </label>

          <select
            id="duration"
            {...register('duration', { valueAsNumber: true })}
            className="mt-2 mb-6 p-3 rounded-sm outline-1 hover:cursor-pointer"
            defaultValue={604800}
          >
            <option value={604800}>7 dager</option>
            <option value={2592000}>30 dager</option>
            <option value={7776000}>90 dager</option>
          </select>
        </section>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="disabled:opacity-50 self-center font-bold py-2 px-4 rounded-sm cursor-pointer bg-secondary"
      >
        {mode === 'edit' ? 'Lagre endringer' : 'Opprett spilleliste'}
      </button>
    </form>
  );
}
