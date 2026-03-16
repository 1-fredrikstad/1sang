'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { getPlaylistFieldValidation } from '@/src/lib/validation/playlistSchema';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import SongList from './SongList';
import { useSongs } from '@/src/hooks/useData';
import { Song } from '@/src/lib/db';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { Switch } from '@/components/ui/switch';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import MobileTooltip from '../MobileTooltip';

type PlaylistFormProps = {
  onSubmit: SubmitHandler<PlaylistInputs>;
};

export default function PlaylistForm({ onSubmit }: PlaylistFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlaylistInputs>({
    defaultValues: {
      title: '',
      password: '',
      songsInPlaylist: [],
      duration: 604800,
      isPublic: false,
    },
  });

  // Watch songsInPlaylist to get instant UI updates
  const songsInPlaylist = watch('songsInPlaylist');
  // Watch value of public
  const isPublic = watch('isPublic');

  const {
    data: songs,
    isLoading,
    error,
  } = useSongs({
    maxAgeMins: 5,
    syncOnMount: true,
  });

  // Check if song is added to songsInPlaylist
  const isSongAdded = useCallback(
    (id: string) => songsInPlaylist.some((s) => s.id === id),
    [songsInPlaylist]
  );

  // Add/remove song from songsInPlaylist
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
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col m-8 mb-4 gap-1 max-w-2xl md:mx-auto"
    >
      {/* Title */}
      <span>
        <label>Tittel*</label>
        {errors.title && (
          <span className="text-red-500 italic ml-2">{errors.title.message}</span>
        )}{' '}
      </span>
      <input
        {...register('title', getPlaylistFieldValidation('title'))}
        className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
      ></input>

      {/* Password */}
      <span>
        <label>Passord (NB! Husk for å redigere/slette spillelister)</label>
        {errors.password && (
          <span className="text-red-500 italic ml-2">{errors.password.message}</span>
        )}
      </span>
      <input
        {...register('password', getPlaylistFieldValidation('password'))}
        className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
      ></input>

      {/* List of songs to add to playlist */}
      <SongList
        songs={songs}
        isLoading={isLoading}
        error={error}
        onToggleSong={toggleSong}
        isAdded={isSongAdded}
      />

      {/* Dutation - how long the playlist will exist */}
      <span className="inline-flex items-center gap-2">
        <label>Varighet</label>
        <MobileTooltip trigger={<QuestionMarkCircleIcon className="h-6 w-6 text-foreground" />}>
          Hvor lenge spillelisten skal eksistere før den slettes automatisk
        </MobileTooltip>
      </span>
      <select
        {...register('duration', { valueAsNumber: true })}
        className="mt-2 mb-6 p-3 rounded-sm outline-1 hover:cursor-pointer"
        defaultValue={604800}
      >
        <option value={604800} className="text-black">
          7 dager
        </option>
        <option value={2592000} className="text-black">
          30 dager
        </option>
        <option value={7776000} className="text-black">
          90 dager
        </option>
      </select>

      {/* Public playlist or not */}
      <span className="inline-flex items-center gap-2 mb-6">
        <p>Offentlig spilleliste:</p>
        <Switch checked={isPublic} onCheckedChange={(value) => setValue('isPublic', value)} />
      </span>

      {/* Submit button */}
      <button
        type="submit"
        className="disabled:opacity-50 self-center font-bold py-2 px-4 rounded-sm cursor-pointer bg-secondary"
      >
        Opprett spilleliste
      </button>
    </form>
  );
}
