import { db } from '@/src/lib/db';
import { createClient } from '../supabase/client';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

export async function syncServerToLocal() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  // Fetch server playlists
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false }); // List starts with newest
  if (error || !data) {
    console.error('Kunne ikke hente spillelister fra server', error);
    return;
  }

  for (const p of data) {
    try {
      // If playlists already exists in IndexedDB - skip
      const existing = await db.playlists.where('server_id').equals(p.id).first();

      let localId = existing?.id;

      if (existing) {
        // update existing
        await db.playlists.update(existing.id, {
          title: p.title,
          expires_at: p.expires_at,
          synced: 1,
        });
      } else {
        // Add new server playlist to IndexedDB
        localId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : uuidv4(); // fallback for insecure connections

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

      // Fetch playlist_items from supabase
      const { data: items, error: itemsError } = await supabase
        .from('playlist_items')
        .select('*')
        .eq('playlist_id', p.id);

      if (itemsError || !items) continue;

      // Write new playlist to IndexedDB
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
    } catch (error) {
      console.error('Server → local sync failed for playlist', p.id, error);
    }
  }
}

// Sync when user is online
export async function syncPlaylists() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  await syncServerToLocal();
}
