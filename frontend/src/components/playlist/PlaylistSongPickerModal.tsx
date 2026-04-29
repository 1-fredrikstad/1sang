// PlaylistSongPickerModal
// Modal used to add/remove songs from a playlist

'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Song } from '@/src/lib/db';
import { Button } from '@/components/ui/button';
import SongList from '../playlist/SongList';
import { useSongPicker } from '@/src/hooks/useSongPicker';
import { SearchField } from '../SearchField';
import { useState } from 'react';

export default function PlaylistSongPickerModal({
  songs,
  open,
  onOpenChange,
  songsInPlaylist,
  setSongsInPlaylist,
}: {
  songs: Song[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songsInPlaylist: Song[];
  setSongsInPlaylist: (songs: Song[]) => void;
}) {
  // local copy so changes can be discarded when closing modal
  const [localSongs, setLocalSongs] = useState<Song[]>(() =>
    songsInPlaylist ? [...songsInPlaylist] : []
  );

  // shared song picker logic (search, selection, filtering)
  const songPicker = useSongPicker(songs, localSongs, setLocalSongs, open);

  const {
    search,
    setSearch,
    filteredSongs,
    isSongAdded,
    toggleSong,
    clearAll,
    selectAll,
    allSelected,
    noneSelected,
    selectedCount,
  } = songPicker;

  // sync local state when modal is opened/closed
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setLocalSongs(songsInPlaylist ? [...songsInPlaylist] : []);
    }

    onOpenChange(nextOpen);
  };

  // save selection back to parent state
  const handleSave = () => {
    setSongsInPlaylist(localSongs);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl flex flex-col gap-3 h-[90vh]">
        {/* modal header */}
        <DialogHeader>
          <DialogTitle>Velg sanger</DialogTitle>
          <DialogDescription>Legg til i spillelisten:</DialogDescription>
        </DialogHeader>

        {/* search + bulk actions */}
        <div className="flex flex-col border-b pb-3">
          <SearchField value={search} onChange={setSearch} />

          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              {/* select all songs */}
              <Button
                size="sm"
                variant="secondary"
                onClick={selectAll}
                disabled={allSelected}
                className="cursor-pointer"
              >
                Velg alle
              </Button>

              {/* clear selection */}
              <Button
                size="sm"
                variant="secondary"
                onClick={clearAll}
                disabled={noneSelected}
                className="cursor-pointer"
              >
                Fjern alle
              </Button>
            </div>

            {/* selected count */}
            <span className="text-xs text-muted-foreground">{selectedCount} valgt</span>
          </div>
        </div>

        {/* song list */}
        <div className="flex-1 overflow-y-auto pr-2 mt-1">
          <SongList
            songs={filteredSongs}
            isLoading={false}
            error={null}
            onToggleSong={toggleSong}
            isAdded={isSongAdded}
          />
        </div>

        {/* footer actions */}
        <DialogFooter className="flex flex-row justify-end">
          {/* close without saving */}
          <DialogClose asChild>
            <Button variant="destructive" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
          </DialogClose>

          {/* save selection */}
          <Button onClick={handleSave} disabled={selectedCount === 0}>
            {songsInPlaylist.length === 0
              ? `Legg til sanger (${selectedCount})`
              : `Lagre endringer (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
