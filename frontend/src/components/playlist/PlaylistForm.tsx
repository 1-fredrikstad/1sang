'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { getPlaylistFieldValidation } from '@/src/lib/validation/playlistSchema';
import { PlaylistInputs } from '@/src/types/playlistInputs';
import SongList from './SongList';
import { useSongs } from '@/src/hooks/useData';
import { Song } from '@/src/lib/db';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Switch } from '@/components/ui/switch';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import MobileTooltip from '../MobileTooltip';
import SubmitButton from '../SubmitButton';
import { useWatch } from 'react-hook-form';
import { usePathname } from 'next/navigation';

type PlaylistFormProps = {
  onSubmit: SubmitHandler<PlaylistInputs>;
};

const STORAGE_KEY = 'playlistForm';

export default function PlaylistForm({ onSubmit }: PlaylistFormProps) {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  const pathname = usePathname();

  const defaultValues: PlaylistInputs = saved
    ? JSON.parse(saved)
    : {
        title: '',
        password: '',
        songsInPlaylist: [],
        duration: 604800,
        isPublic: false,
      };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PlaylistInputs>({
    defaultValues,
  });

  const values = useWatch({ control });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(STORAGE_KEY); // Clear on page reload or tab close
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Only clear storage if the pathname changed (navigating away)
      if (typeof window !== 'undefined' && pathname !== window.location.pathname) {
        localStorage.removeItem(STORAGE_KEY);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  // Track toasts to prevent multiple toasts to show up at the same time
  const TOAST_ID = 'playlist-toast';

  // Watch songsInPlaylist to get instant UI updates
  const songsInPlaylist = useWatch({ name: 'songsInPlaylist', control });
  // Watch value of public
  const isPublic = useWatch({ name: 'isPublic', control });
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

        if (toast.isActive(TOAST_ID)) {
          toast.update(TOAST_ID, {
            render: 'Sang fjernet',
            type: 'error',
          });
        } else {
          toast.error('Sang fjernet', { toastId: TOAST_ID });
        }
      } else {
        setValue('songsInPlaylist', [...songsInPlaylist, song]);
        if (toast.isActive(TOAST_ID)) {
          toast.update(TOAST_ID, {
            render: 'Sang lagt til',
            type: 'success',
          });
        } else {
          toast.success('Sang lagt til', { toastId: TOAST_ID });
        }
      }
    },
    [songsInPlaylist, setValue]
  );

  const handleFormSubmit: SubmitHandler<PlaylistInputs> = async (data) => {
    await onSubmit(data);
    // Reset the form to initial default values
    reset({
      title: '',
      password: '',
      songsInPlaylist: [],
      duration: 604800,
      isPublic: false,
    });

    // Remove saved form from localStorage
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col m-8 mb-4 gap-1 max-w-2xl md:mx-auto"
    >
      <h1 className="text-xl mb-2">Lag ny spilleliste</h1>

      {/* Title */}
      <span>
        <label htmlFor="title">Tittel*</label>
        {errors.title && (
          <span className="text-red-500 italic ml-2">{errors.title.message}</span>
        )}{' '}
      </span>
      <input
        id="title"
        {...register('title', getPlaylistFieldValidation('title'))}
        className="mb-5 p-1 outline outline-[#E6E4E2] rounded-xs"
        type="text"
      ></input>

      {/* Password */}
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
      ></input>

      {/* List of songs to add to playlist */}
      <SongList
        songs={songs}
        isLoading={isLoading}
        error={error}
        onToggleSong={toggleSong}
        isAdded={isSongAdded}
      />

      {/* Public playlist or not */}
      <span className="inline-flex items-center gap-2 mb-6">
        <p>Offentlig spilleliste:</p>
        <Switch checked={isPublic} onCheckedChange={(value) => setValue('isPublic', value)} />
      </span>

      {isPublic && (
        <section className="mb-4">
          {/* Dutation - how long the playlist will exist if public */}
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
        </section>
      )}

      {/* Submit button */}
      <SubmitButton submitLabel="Opprett spilleliste" />
    </form>
  );
}
