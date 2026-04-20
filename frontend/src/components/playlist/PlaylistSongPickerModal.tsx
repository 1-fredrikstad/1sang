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
  const [localSongs, setLocalSongs] = useState<Song[]>([]);

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

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setLocalSongs(songsInPlaylist);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    setSongsInPlaylist(localSongs);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl flex flex-col gap-3 h-[90vh]">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Velg sanger</DialogTitle>
          <DialogDescription>Legg til i spillelisten:</DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-col border-b pb-3">
          <SearchField value={search} onChange={setSearch} />

          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={selectAll}
                disabled={allSelected}
                className="cursor-pointer"
              >
                Velg alle
              </Button>
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
            <span className="text-xs text-muted-foreground">{selectedCount} valgt</span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-2 mt-1">
          <SongList
            songs={filteredSongs}
            isLoading={false}
            error={null}
            onToggleSong={toggleSong}
            isAdded={isSongAdded}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-row justify-end">
          <DialogClose asChild>
            <Button variant="destructive" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
          </DialogClose>

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
