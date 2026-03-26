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
import Link from 'next/link';
import { Playlist } from '@/src/lib/db';

type PlaylistSettingsMenuProps = {
  playlist: Playlist;
  canEdit?: boolean;
  editUrl?: string;
};

export default function PlaylistSettingsMenu({
  playlist,
  canEdit,
  editUrl,
}: PlaylistSettingsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2">
          <EllipsisVerticalIcon className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-full bg-list-bg">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Om</DropdownMenuLabel>
          {playlist.created_at && (
            <DropdownMenuItem>
              <div>Opprettet {new Date(playlist.created_at).toLocaleDateString('no-NO')}</div>
            </DropdownMenuItem>
          )}
          {playlist.expires_at && (
            <DropdownMenuItem>
              <div>Utløper {new Date(playlist.expires_at).toLocaleDateString('no-NO')}</div>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Instillinger</DropdownMenuLabel>

          {canEdit && editUrl && (
            <DropdownMenuItem asChild>
              <Link href={editUrl} className="flex items-center gap-2">
                <PencilIcon className="h-4 w-4" /> Rediger spilleliste
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
