'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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
import { toast } from 'sonner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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

  // controls password dialog visibility
  const [open, setOpen] = useState(false);

  // password input state for protected playlists
  const [password, setPassword] = useState('');

  // online/offline state (disables editing when offline)
  const isOnline = useOnlineStatus();

  // password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Track input to give autofocus
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // handles navigation to edit page
  const handleEdit = async () => {
    // admins or private playlists bypass password check
    if (isAdmin || !playlist.is_public) {
      router.push(editUrl ?? `/playlists/playlist/edit?id=${playlist.id}`);
      return;
    }

    // check if password already stored in session
    const storedPassword = sessionStorage.getItem(`playlist-password-${playlist.id}`);

    if (storedPassword) {
      router.push(editUrl ?? `/playlists/playlist/edit?id=${playlist.id}`);
      return;
    }

    // otherwise open password dialog
    setOpen(true);
  };

  // verifies playlist password before allowing edit access
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

    // invalid password handling
    if (!res.ok || !json?.ok || !json?.data) {
      toast.error('Feil passord');
      return;
    }

    // store password temporarily for session reuse
    sessionStorage.setItem(`playlist-password-${playlist.id}`, password);

    setPassword('');
    setOpen(false);

    // redirect to edit page after successful verification
    router.push(editUrl ?? `/playlists/playlist/edit?id=${playlist.id}`);
  };

  return (
    <>
      {/* dropdown menu trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2" type="button">
            <EllipsisVerticalIcon className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-full dark:bg-list-bg">
          {/* settings section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Innstillinger</DropdownMenuLabel>

            {/* edit option (disabled when offline) */}
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

          {/* info section */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Om</DropdownMenuLabel>

            {/* created date */}
            {playlist.created_at && (
              <DropdownMenuItem disabled className="data-disabled:opacity-100">
                <div>Opprettet {new Date(playlist.created_at).toLocaleDateString('no-NO')}</div>
              </DropdownMenuItem>
            )}

            {/* expiration date */}
            {playlist.expires_at && (
              <DropdownMenuItem disabled className="data-disabled:opacity-100">
                <div>Utløper {new Date(playlist.expires_at).toLocaleDateString('no-NO')}</div>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* password verification dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Oppgi passord</AlertDialogTitle>
            <AlertDialogDescription>
              Du må oppgi passord for å redigere denne spillelisten.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* password input with toggle view password */}
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passord"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleVerify();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

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
