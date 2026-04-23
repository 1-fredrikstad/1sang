'use client';
import LogoutButton from './LogoutButton';
import { Spinner } from '@/components/ui/spinner';
import { useSongs, useSongSuggestions } from '@/src/hooks/useData';
import { SuggestionsCollapsible } from '../suggestions/SuggestionsCollapsible';
import { useAuth } from '@/src/context/AuthContext';
import UserRoleManager, { type AdminUser } from './UserRoleManager';
import ExportLatexModal from '../latex/ExportLatexModal';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateLatex } from '../latex/GenerateLatex';
import TagManager from './TagManager';
import { createClient } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminContent() {
  const { data: suggestions, isLoading: suggestionsLoading } = useSongSuggestions();
  const { user, isAdmin, isSuperuser } = useAuth();

  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const { data: songs, isLoading: songsLoading } = useSongs({
    maxAgeMins: 5,
  });

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return {};

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const authHeaders = await getAuthHeaders();

      const res = await fetch('/api/admin/users', {
        headers: authHeaders,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Kunne ikke hente brukere');
      }

      setUsers(json.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperuser) {
      loadUsers();
    }
  }, [isSuperuser, loadUsers]);

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

      <section className="flex flex-row justify-between items-center">
        <p>Trykk på knappen for å eksportere sanger til LaTeX</p>
        <Button
          variant="secondary"
          onClick={() => setOpen(true)}
          className="text-md cursor-pointer"
        >
          Eksporter
        </Button>
        <ExportLatexModal
          open={open}
          onOpenChange={setOpen}
          songs={songs || []}
          generateLatex={generateLatex}
        />
      </section>

      <article className="allow-animation mt-5">
        {isAdmin && <SuggestionsCollapsible suggestions={suggestions || []} />}
      </article>

      <section className="flex flex-col items-center mt-5">
        {isSuperuser && (
          <UserRoleManager users={users} loading={usersLoading} onReload={loadUsers} />
        )}
      </section>

      <article className="allow-animation mt-5">
        <TagManager />
      </article>
    </main>
  );
}
