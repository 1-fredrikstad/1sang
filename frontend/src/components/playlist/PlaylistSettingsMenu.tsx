'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EllipsisVerticalIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Playlist } from '@/src/lib/db';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

type PlaylistSettingsMenuProps = {
  playlist: Playlist;
  editUrl?: string;
  isAdmin?: boolean;
};

export default function PlaylistSettingsMenu({
  playlist,
  editUrl,
  isAdmin = false,
}: PlaylistSettingsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const isOnline = useOnlineStatus();

  const handleEdit = async () => {
    if (isAdmin || !playlist.is_public) {
      router.push(editUrl ?? `/playlists/playlist/edit?id=${playlist.id}`);
      return;
    }

    const storedPassword = sessionStorage.getItem(`playlist-password-${playlist.id}`);

    if (storedPassword) {
      router.push(editUrl ?? `/playlists/playlist/edit?id=${playlist.id}`);
      return;
    }

    setOpen(true);
  };

  const handleVerify = async () => {
    if (!password.trim()) return;

    const res = await fetch('/api/playlists/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playlist_id: playlist.id,
        password,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.ok || !json?.data) {
      toast.error('Feil passord');
      return;
    }

    sessionStorage.setItem(`playlist-password-${playlist.id}`, password);
    setPassword('');
    setOpen(false);
    router.push(editUrl ?? `/playlists/playlist/edit?id=${playlist.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2" type="button">
            <EllipsisVerticalIcon className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-full dark:bg-list-bg">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Innstillinger</DropdownMenuLabel>
            {isOnline ? (
              <DropdownMenuItem
                onClick={handleEdit}
                className="flex items-center gap-2 cursor-pointer"
              >
                <PencilIcon className="h-4 w-4" />
                Rediger spilleliste
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="flex items-center gap-2 opacity-40">
                <PencilIcon className="h-4 w-4" />
                Rediger spilleliste
                <span className="text-xs ml-auto">Offline</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Om</DropdownMenuLabel>

            {playlist.created_at && (
              <DropdownMenuItem disabled className="data-disabled:opacity-100">
                <div>Opprettet {new Date(playlist.created_at).toLocaleDateString('no-NO')}</div>
              </DropdownMenuItem>
            )}

            {playlist.expires_at && (
              <DropdownMenuItem disabled className="data-disabled:opacity-100">
                <div>Utløper {new Date(playlist.expires_at).toLocaleDateString('no-NO')}</div>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Oppgi passord</AlertDialogTitle>
            <AlertDialogDescription>
              Du må oppgi passord for å redigere denne spillelisten.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passord"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />

          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer" onClick={() => setPassword('')}>
              Avbryt
            </AlertDialogCancel>
            <AlertDialogAction
              className="hover:cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                void handleVerify();
              }}
              disabled={!password.trim()}
            >
              Bekreft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
