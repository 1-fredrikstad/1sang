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
import { generateLatex } from './GenerateLatex';
import { useSongPicker } from '@/src/hooks/useSongPicker';
import { SearchField } from '../SearchField';
import { useState } from 'react';

export default function ExportLatexModal({
  songs,
  open,
  onOpenChange,
}: {
  songs: Song[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const songPicker = useSongPicker(songs, selectedSongs, setSelectedSongs, open);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Eksporter til LaTeX</DialogTitle>
          <DialogDescription>Velg hvilke sanger du vil eksportere:</DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-col border-b pb-3">
          <SearchField value={search} onChange={setSearch} />

          <div className="flex justify-between items-center gap-3">
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
        <div className="flex-1 overflow-y-auto pr-2 py-2">
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
            <Button variant="destructive">Avbryt</Button>
          </DialogClose>

          <Button
            onClick={() => generateLatex(selectedSongs, songs.length)}
            disabled={selectedCount === 0}
          >
            Eksporter ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
