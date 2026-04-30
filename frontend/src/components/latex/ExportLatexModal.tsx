// PlaylistSongPickerModal
// Modal used to select which songs to export in latex

'use client';

import { Song } from '@/src/lib/db';
import SongPickerModal from '../SongPickerModal';

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
  const handleExport = (selectedSongs: Song[]) => {
    generateLatex(selectedSongs, songs.length);
  };

  return (
    <SongPickerModal
      songs={songs}
      open={open}
      onOpenChange={onOpenChange}
      title="Eksporter til LaTeX"
      description="Velg hvilke sanger du vil eksportere:"
      onSave={handleExport}
      showToastOnSave={true}
      // Feedback depends on selection size for better UX clarity
      toastMessages={{
        one: 'Eksporterte 1 sang',
        all: 'Eksporterte alle sanger',
        some: (count) => `Eksporterte ${count} sanger`,
      }}
      saveButtonLabel={(count) => `Eksporter (${count})`}
    />
  );
}
