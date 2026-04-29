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
import { toast } from 'sonner';

export default function ExportLatexModal({
  songs,
  open,
  onOpenChange,
  generateLatex,
}: {
  songs: Song[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generateLatex: (songs: Song[], total?: number) => void;
}) {
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);

  // Encapsulates filtering, selection state, and helpers for the song picker UI
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
      <DialogContent className="sm:max-w-xl flex flex-col gap-3 h-[90vh]">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Eksporter til LaTeX</DialogTitle>
          <DialogDescription>Velg hvilke sanger du vil eksportere:</DialogDescription>
        </DialogHeader>

        {/* Search + bulk actions */}
        <div className="flex flex-col border-b pb-3">
          <SearchField value={search} onChange={setSearch} />

          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              {/* Bulk select actions */}
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

            {/* Live selection counter */}
            <span className="text-xs text-muted-foreground">{selectedCount} valgt</span>
          </div>
        </div>

        {/* Scrollable song list */}
        <div className="flex-1 overflow-y-auto pr-2 mt-1">
          <SongList
            songs={filteredSongs}
            isLoading={false}
            error={null}
            onToggleSong={toggleSong}
            isAdded={isSongAdded}
          />
        </div>

        {/* Footer actions */}
        <DialogFooter className="flex flex-row justify-end">
          <DialogClose asChild>
            <Button variant="destructive" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
          </DialogClose>

          <Button
            onClick={() => {
              generateLatex(selectedSongs, songs.length);

              onOpenChange(false);

              // Feedback depends on selection size for better UX clarity
              toast.success(
                selectedCount === 1
                  ? 'Eksporterte 1 sang'
                  : selectedCount === songs.length
                    ? 'Eksporterte alle sanger'
                    : `Eksporterte ${selectedCount} sanger`
              );
            }}
            disabled={selectedCount === 0}
          >
            Eksporter ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
