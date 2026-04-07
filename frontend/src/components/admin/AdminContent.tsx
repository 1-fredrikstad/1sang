'use client';
import LogoutButton from './LogoutButton';
import { Spinner } from '@/components/ui/spinner';
import { useSongSuggestions } from '@/src/hooks/useData';
import { SuggestionsCollapsible } from '../suggestions/SuggestionsCollapsible';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminContent() {
  const { data: suggestions, isLoading: suggestionsLoading } = useSongSuggestions();
  const { user } = useAuth();

  if (suggestionsLoading) {
    return <Spinner message="Laster inn admin" />;
  }

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p>Du er ikke logget inn</p>
      </div>
    );
  }

  return (
    <main className="mb-5 flex flex-col justify-between max-w-5xl mx-auto">
      <div className="flex flex-row justify-between">
        <div>
          <p>Logget inn som:</p>
          <b>{user.name || 'admin'}</b>
        </div>
        <LogoutButton />
      </div>
      <article className="allow-animation mt-5">
        <SuggestionsCollapsible suggestions={suggestions || []} />
      </article>

      <section className="flex flex-col items-center mt-5"></section>
    </main>
  );
}
