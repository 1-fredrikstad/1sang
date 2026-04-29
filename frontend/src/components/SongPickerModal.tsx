// SongPickerModal
// Common modal used for PlaylistSongPickerModal and ExportLatexModal

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
import SongList from './playlist/SongList';
import { useSongPicker } from '@/src/hooks/useSongPicker';
import { SearchField } from './SearchField';
import { useState } from 'react';
import { toast } from 'sonner';

type SongPickerModalProps = {
  songs: Song[];
  initialSongs?: Song[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSave?: (selectedSongs: Song[]) => void;
  saveButtonLabel?: string | ((selectedCount: number) => string);
  showToastOnSave?: boolean;
  toastMessages?: {
    one?: string;
    all?: string;
    some?: (count: number) => string;
  };
  defaultTab?: 'all' | 'selected';
};

export default function SongPickerModal({
  songs,
  initialSongs,
  open,
  onOpenChange,
  title,
  description,
  onSave,
  saveButtonLabel,
  showToastOnSave = false,
  toastMessages,
  defaultTab,
}: SongPickerModalProps) {
  const [selectedSongs, setSelectedSongs] = useState<Song[]>(initialSongs ?? []);

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

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSelectedSongs(initialSongs ?? []);
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    if (!onSave) return;

    onSave(selectedSongs);

    // For exporting latex
    if (showToastOnSave && toastMessages) {
      const message =
        selectedCount === 1
          ? toastMessages.one || `Eksporterte 1 sang`
          : selectedCount === songs.length
            ? toastMessages.all || `Eksporterte alle sanger`
            : toastMessages.some?.(selectedCount) || `Eksporterte ${selectedCount} sanger`;

      toast.success(message);
    }

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl flex flex-col gap-3 h-[90vh]">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Toolbar - search + bulk actions */}
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
            defaultTab={defaultTab}
          />
        </div>

        {/* Footer actions*/}
        <DialogFooter className="flex flex-row justify-end">
          <DialogClose asChild>
            <Button variant="destructive" onClick={handleCancel}>
              Avbryt
            </Button>
          </DialogClose>

          <Button onClick={handleSave} disabled={selectedCount === 0}>
            {typeof saveButtonLabel === 'function'
              ? saveButtonLabel(selectedCount)
              : saveButtonLabel || `Lagre (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
