import { db } from '../db';
import { createClient } from '../supabase/client';

const supabase = createClient();

export async function syncLocalToServer() {
  // Get all unsynced public playlists
  const unsynced = await db.playlists.filter((p) => p.is_public && !p.synced).toArray();

  for (const playlist of unsynced) {
    try {
      // Create playlist on server
      const expires_at = playlist.expires_at || new Date(Date.now() + 604800 * 1000).toISOString();

      // Insert playlist
      const res = await supabase
        .from('playlists')
        .insert({
          title: playlist.title,
          playlist_password: playlist.playlist_password,
          is_public: true,
          expires_at,
        })
        .select();

      if (res.error || !res.data || !res.data[0]?.id)
        throw res.error || new Error('Failed to create server playlist');

      const serverId = res.data[0].id;

      // Add playlist items
      const songsinPlaylist = await db.playlist_items
        .where('playlist_id')
        .equals(playlist.id)
        .sortBy('position');

      for (const song of songsinPlaylist) {
        const addRes = await supabase.from('playlist_items').insert({
          playlist_id: serverId,
          song_id: song.song_id,
          position: song.position,
        });

        if (addRes.error) {
          console.error('Kunne ikke legge til sang:', song.song_id, addRes.error);
        }
      }

      // Mark local playlist as synced
      await db.playlists.update(playlist.id, { server_id: serverId, synced: true });
    } catch (err) {
      console.error('Sync feilet for lokal spilleliste', playlist.id, err);
      // Keep as unsynced → retry later
    }
  }
}

export async function syncServerToLocal() {
  // Fetch server playlists
  const { data, error } = await supabase.from('playlists').select('*').eq('is_public', true);
  if (error || !data) {
    console.error('Kunne ikke hente spillelister fra server', error);
    return;
  }

  for (const p of data) {
    const exists = await db.playlists.where('server_id').equals(p.id).first();

    if (exists) {
      await db.playlists.update(exists.id, {
        title: p.title,
        expires_at: p.expires_at,
        synced: true,
      });
    } else {
      // Add new server playlist to IndexedDB
      const localId = crypto.randomUUID();

      await db.playlists.add({
        id: localId,
        server_id: p.id,
        synced: true,
        title: p.title,
        playlist_password: '', // Can't store user password
        created_at: p.created_at,
        is_public: true,
        expires_at: p.expires_at,
      });

      // Optionally fetch playlist items
      const { data: items, error: itemsError } = await supabase
        .from('playlist_items')
        .select('*')
        .eq('playlist_id', p.id);

      if (items && !itemsError) {
        for (const item of items) {
          await db.playlist_items.add({
            playlist_id: localId,
            song_id: item.song_id,
            position: item.position,
          });
        }
      }
    }
  }
}

// Sync when user is online
export async function syncPlaylists() {
  await syncLocalToServer();
  await syncServerToLocal();
}
