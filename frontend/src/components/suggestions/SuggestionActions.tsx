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

interface Props {
  id: string;
}

export function SuggestionActions({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  async function approve() {
    setLoading('approve');
    try {
      await approveSuggestion(id);
      if (typeof window !== 'undefined') {
        await db.song_suggestions.clear(); // removes the old cached row
      }
      toast.success('Sang lagt til!');
      setTimeout(() => router.push('/admin'), 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      toast.error(message || 'Kunne ikke godkjenne');
    }
  }

  async function reject() {
    setLoading('reject');
    try {
      await deleteSuggestion(id);

      if (typeof window !== 'undefined' && db) {
        await db.song_suggestions.delete(id);
      }
      toast.success('Sangforslag avvist og slettet');
      setTimeout(() => router.push('/admin'), 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      toast(message || 'Kunne ikke avvise');
    }
  }

  return (
    <ButtonGroup className="flex flex-row items-center">
      <Button
        variant="outline"
        onClick={approve}
        disabled={loading !== null}
        className="hover:text-green-500 cursor-pointer"
      >
        Godkjenn
      </Button>

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
