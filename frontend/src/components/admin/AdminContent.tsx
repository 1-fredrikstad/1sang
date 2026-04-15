'use client';
import LogoutButton from './LogoutButton';
import { Spinner } from '@/components/ui/spinner';
import { useSongs, useSongSuggestions } from '@/src/hooks/useData';
import { SuggestionsCollapsible } from '../suggestions/SuggestionsCollapsible';
import { useAuth } from '@/src/context/AuthContext';
import ExportLatexModal from '../latex/ExportLatexModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminContent() {
  const { data: suggestions, isLoading: suggestionsLoading } = useSongSuggestions();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const { data: songs, isLoading: songsLoading } = useSongs({
    maxAgeMins: 5,
  });

  if (suggestionsLoading) {
    return <Spinner message="Laster inn admin" />;
  }

  if (songsLoading) {
    return <Spinner message="Laster inn sanger" />;
  }

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p>Du er ikke logget inn</p>
      </div>
    );
  }

  return (
    <main className="mb-5 flex flex-col justify-between">
      <div className="flex flex-row justify-between mb-10">
        <div>
          <p>Logget inn som:</p>
          <b>{user.name || 'admin'}</b>
        </div>
        <LogoutButton />
      </div>

      <section className="flex flex-row justify-between">
        <p>Trykk på knappen for å eksportere sanger til LaTeX</p>
        <Button
          variant="secondary"
          onClick={() => setOpen(true)}
          className="text-md cursor-pointer"
        >
          Eksporter
        </Button>
        <ExportLatexModal open={open} onOpenChange={setOpen} songs={songs || []} />
      </section>

      <article className="allow-animation mt-5">
        <SuggestionsCollapsible suggestions={suggestions || []} />
      </article>

      <section className="flex flex-col items-center mt-5"></section>
    </main>
  );
}
