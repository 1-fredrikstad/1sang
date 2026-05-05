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

  // Builds auth headers using Supabase session (required for admin API routes)
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

  // Fetches all users (only available for superadmin)
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);

      const authHeaders = await getAuthHeaders();

      const res = await fetch('/api/admin/users', {
        headers: authHeaders,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Failed to load users');
      }

      setUsers(json.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load users only if superadmin (avoids unnecessary API calls)
  useEffect(() => {
    if (isSuperuser) {
      loadUsers();
    }
  }, [isSuperuser, loadUsers]);

  // Global loading states
  if (suggestionsLoading) {
    return <Spinner message="Loading admin panel" />;
  }

  if (songsLoading) {
    return <Spinner message="Loading songs" />;
  }

  // Safety fallback if user is not authenticated
  if (!user) {
    return (
      <div className="text-center mt-10">
        <p>Du er ikke logget inn</p>
      </div>
    );
  }

  return (
    <main>
      {/* Top bar: user info + logout */}
      <div className="flex flex-row justify-between mb-6">
        <div>
          <p>Logget inn som:</p>
          <b>{user.name || 'admin'}</b>
        </div>
        <LogoutButton />
      </div>

      <ul className="flex flex-col">
        {/* Admin-only song suggestions review */}
        {isAdmin && (
          <li className="allow-animation settings-list-item">
            <SuggestionsCollapsible suggestions={suggestions || []} />
          </li>
        )}

        {/* Tag management (available to admins) */}
        <li className="allow-animation settings-list-item">
          <TagManager />
        </li>

        {/* Export songs to LaTeX */}
        <li className="settings-list-item flex  justify-between items-center">
          <p>Eksporter sanger til LaTeX</p>

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
        </li>

        {/* Superadmin-only user management */}
        {isSuperuser && (
          <li className="settings-list-item">
            <UserRoleManager users={users} loading={usersLoading} onReload={loadUsers} />
          </li>
        )}
      </ul>
    </main>
  );
}
