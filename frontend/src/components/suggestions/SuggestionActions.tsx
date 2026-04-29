'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogPortal,
} from '@/components/ui/alert-dialog';
import { Trash2Icon } from 'lucide-react';
import { db } from '@/src/lib/db';
import { approveSuggestion, deleteSuggestion } from '@/src/lib/actions/songSuggestions';
import { useState } from 'react';
import { toast } from 'sonner';
import { syncService } from '@/src/lib/syncService';

interface Props {
  id: string;
}

export function SuggestionActions({ id }: Props) {
  const router = useRouter();

  // Tracks which action is currently in progress (prevents double submits)
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  // Approves a song suggestion and syncs local cache with server state
  async function approve() {
    setLoading('approve');

    try {
      await approveSuggestion(id);

      // After approval, clear and refresh relevant local IndexedDB caches
      if (typeof window !== 'undefined') {
        await db.song_suggestions.clear();
        await syncService.syncTable('song_tags', { forceFresh: true });
        await syncService.syncTable('songs', { forceFresh: true });
      }

      toast.success('Sang lagt til!');

      // Small delay before redirect to allow UI feedback
      setTimeout(() => router.push('/admin'), 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      toast.error(message || 'Kunne ikke godkjenne');
    } finally {
      setLoading(null);
    }
  }

  // Rejects a suggestion and removes it from both server and local cache
  async function reject() {
    setLoading('reject');

    try {
      await deleteSuggestion(id);

      // Remove locally cached suggestion if present
      if (typeof window !== 'undefined' && db) {
        await db.song_suggestions.delete(id);
      }

      toast.success('Sangforslag avvist og slettet');

      setTimeout(() => router.push('/admin'), 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      toast(message || 'Kunne ikke avvise');
    } finally {
      setLoading(null);
    }
  }

  return (
    <ButtonGroup className="flex flex-row items-center">
      {/* Approve action (no confirmation dialog) */}
      <Button
        variant="outline"
        onClick={approve}
        disabled={loading !== null}
        className="hover:text-green-500 cursor-pointer"
      >
        Godkjenn
      </Button>

      {/* Reject action requires confirmation dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            disabled={loading !== null}
            className="hover:text-red-500 cursor-pointer"
          >
            Avvis
          </Button>
        </AlertDialogTrigger>

        <AlertDialogPortal>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              {/* Warning icon header */}
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>

              <AlertDialogTitle>Avvis sangforslag?</AlertDialogTitle>

              <AlertDialogDescription>
                Dette sletter sangforslaget permament.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Avbryt</AlertDialogCancel>

              {/* Confirm destructive action */}
              <AlertDialogAction variant="destructive" onClick={reject}>
                Avvis og slett
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </ButtonGroup>
  );
}
