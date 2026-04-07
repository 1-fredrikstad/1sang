'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVerticalIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Playlist, db } from '@/src/lib/db';

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

  const handleEdit = async () => {
    if (isAdmin || !playlist.is_public) {
      router.push(editUrl ?? `/playlists/${playlist.id}/edit`);
      return;
    }

    const storedPassword = sessionStorage.getItem(`playlist-password-${playlist.id}`);

    if (storedPassword) {
      router.push(editUrl ?? `/playlists/${playlist.id}/edit`);
      return;
    }

    const password = prompt('Skriv passord for å redigere spillelisten');
    if (!password) return;

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
    router.push(editUrl ?? `/playlists/${playlist.id}/edit`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2" type="button">
          <EllipsisVerticalIcon className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-full dark:bg-list-bg">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Innstillinger</DropdownMenuLabel>

          <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2 cursor-pointer">
            <PencilIcon className="h-4 w-4" />
            Rediger spilleliste
          </DropdownMenuItem>
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
  );
}
