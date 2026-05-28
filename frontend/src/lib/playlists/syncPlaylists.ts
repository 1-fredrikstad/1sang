import { db } from '@/src/lib/db';
import { createClient } from '../supabase/client';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

export async function syncServerToLocal() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  // Fetch all public playlists
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  if (error || !data || data.length === 0) {
    if (error) console.error('Kunne ikke hente spillelister fra server', error);
    return;
  }

  // Fetch ALL playlist_items in one query instead of one per playlist (avoids N+1)
  const serverIds = data.map((p) => p.id);
  const { data: allItems, error: itemsError } = await supabase
    .from('playlist_items')
    .select('*')
    .in('playlist_id', serverIds);

  if (itemsError) {
    console.error('Kunne ikke hente playlist_items', itemsError);
    return;
  }

  // Group items by server playlist_id for O(1) lookup below
  type RawItem = { playlist_id: string; song_id: string; position: number };
  const itemsByServerId = (allItems ?? []).reduce(
    (acc, item: RawItem) => {
      (acc[item.playlist_id] ??= []).push(item);
      return acc;
    },
    {} as Record<string, RawItem[]>
  );

  for (const p of data) {
    try {
      const existing = await db.playlists.where('server_id').equals(p.id).first();
      let localId = existing?.id;

      if (existing) {
        await db.playlists.update(existing.id, {
          title: p.title,
          expires_at: p.expires_at,
          synced: 1,
        });
      } else {
        localId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : uuidv4();

        await db.playlists.add({
          id: localId,
          server_id: p.id,
          synced: 1,
          title: p.title,
          playlist_password: '',
          created_at: p.created_at,
          is_public: true,
          expires_at: p.expires_at,
        });
      }

      const items: RawItem[] = itemsByServerId[p.id] ?? [];

      await db.playlist_items.where('playlist_id').equals(localId!).delete();

      if (items.length > 0) {
        await db.playlist_items.bulkAdd(
          items.map((item) => ({
            playlist_id: localId!,
            song_id: item.song_id,
            position: item.position,
          }))
        );
      }
    } catch (err) {
      console.error('Server → local sync failed for playlist', p.id, err);
    }
  }
}

// Sync when user is online
export async function syncPlaylists() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  await syncServerToLocal();
}
