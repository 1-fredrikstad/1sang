'use client';

import { Song } from '@/src/lib/db';
import SongPickerModal from '../SongPickerModal';

export default function PlaylistSongPickerModal({
  songs,
  open,
  onOpenChange,
  currentSongsInPlaylist,
  setSongsInPlaylist,
}: {
  songs: Song[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSongsInPlaylist: Song[];
  setSongsInPlaylist: (songs: Song[]) => void;
}) {
  const handleSave = (selectedSongs: Song[]) => {
    setSongsInPlaylist(selectedSongs);
  };

  const isEditing = currentSongsInPlaylist.length > 0;

  return (
    <SongPickerModal
      songs={songs}
      initialSongs={currentSongsInPlaylist}
      open={open}
      onOpenChange={onOpenChange}
      title="Velg sanger"
      description="Legg til i spillelisten:"
      onSave={handleSave}
      defaultTab={isEditing ? 'selected' : 'all'}
      saveButtonLabel={(selectedCount) =>
        isEditing ? `Lagre endringer (${selectedCount})` : `Legg til sanger (${selectedCount})`
      }
    />
  );
}
