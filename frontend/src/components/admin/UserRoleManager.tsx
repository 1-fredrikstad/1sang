'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { createClient } from '@/src/lib/supabase/client';

export type AdminUser = {
  user_id: string;
  name: string | null;
  email: string | null;
  role: 'regular' | 'admin' | 'superuser';
  created_at?: string | null;
};

type UserRoleManagerProps = {
  users: AdminUser[];
  loading: boolean;
  onReload: () => Promise<void>;
};

export default function UserRoleManager({ users, loading, onReload }: UserRoleManagerProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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

  const updateRole = async (targetUserId: string, role: 'regular' | 'admin') => {
    try {
      setUpdatingUserId(targetUserId);
      const authHeaders = await getAuthHeaders();

      const res = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          targetUserId,
          role,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || 'Kunne ikke oppdatere rolle');
      }

      toast.success(role === 'admin' ? 'Bruker gjort til admin' : 'Admin fjernet');
      await onReload();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Noe gikk galt');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="w-full">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <div className="group w-full flex items-center justify-between cursor-pointer">
            <span>Brukerroller</span>
            <ChevronDownIcon className="h-5 w-5 allow-animation transition-transform duration-500 group-data-[state=open]:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden collapsible-content data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
          <div className="px-0 pb-4 mt-2 pt-1 allow-animation">
            {loading ? (
              <div className="opacity-80 overflow-hidden">Laster brukere...</div>
            ) : users.length === 0 ? (
              <div className="opacity-80 overflow-hidden">Ingen brukere funnet</div>
            ) : (
              <ul className="space-y-2 mx-1">
                {users.map((user) => (
                  <li key={user.user_id}>
                    <div className="group w-full py-4 pr-4 pl-4 rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm allow-animation transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.name || 'Uten navn'}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email || 'Ingen e-post'}
                          </p>
                          <p className="text-sm mt-1">
                            Rolle:{' '}
                            {user.role === 'regular'
                              ? 'Vanlig bruker'
                              : user.role === 'admin'
                                ? 'Admin'
                                : 'Superbruker'}
                          </p>
                          {user.created_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Opprettet:{' '}
                              {new Date(user.created_at).toLocaleDateString('no-NO', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          {user.role === 'regular' && (
                            <Button
                              onClick={() => updateRole(user.user_id, 'admin')}
                              disabled={updatingUserId === user.user_id}
                              className="cursor-pointer"
                            >
                              Gjør admin
                            </Button>
                          )}

                          {user.role === 'admin' && (
                            <Button
                              variant="outline"
                              onClick={() => updateRole(user.user_id, 'regular')}
                              disabled={updatingUserId === user.user_id}
                              className="cursor-pointer"
                            >
                              Fjern admin
                            </Button>
                          )}

                          {user.role === 'superuser' && (
                            <span className="text-sm text-muted-foreground self-center">
                              Superbruker
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
