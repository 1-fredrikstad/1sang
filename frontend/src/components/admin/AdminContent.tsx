'use client';
import LogoutButton from './LogoutButton';
import { Spinner } from '@/components/ui/spinner';
import { useSongSuggestions } from '@/src/hooks/useData';
import { SuggestionsCollapsible } from '../suggestions/SuggestionsCollapsible';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminContent() {
  const { data: suggestions, isLoading } = useSongSuggestions();
  const { user } = useAuth();

  if (isLoading) return <Spinner message="Laster inn sangforslag" />;

  return (
    <section className="mb-5 flex flex-col justify-between">
      <div className="flex flex-row justify-between">
        <div>
          <p>Logget inn som:</p>
          <b>{user?.name || 'admin'}</b>
        </div>
        <LogoutButton />
      </div>
      <article className="allow-animation mt-5">
        <SuggestionsCollapsible suggestions={suggestions || []} />
      </article>

      <section className="flex flex-col items-center mt-5"></section>
    </section>
  );
}
