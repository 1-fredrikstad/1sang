import { PlaylistInputs } from '@/src/types/playlistInputs';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { capitalizeFirst } from '@/src/lib/utils/capitalizeFormat';

export async function savePlaylist(data: PlaylistInputs) {
  const normalizedTitle = capitalizeFirst(data.title);

  // ID for IndexedDB
  const localId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : uuidv4(); // fallback for insecure connections (such as http)

  // Calculate expiration (only relevant if public)
  const expires_at = data.isPublic
    ? new Date(Date.now() + (data.duration || 604800) * 1000).toISOString()
    : null;

  // Always save playlist to IndexedDB (local)
  await db.playlists.add({
    id: localId,
    server_id: undefined, // Only exists if the playlist is public and synced to backend
    synced: 0,
    title: normalizedTitle,
    playlist_password: data.password,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: data.isPublic,
    expires_at,
  });

  // Add songs to playlist in IndexedDB (save songs offline)
  await db.playlist_items.bulkAdd(
    data.songsInPlaylist.map((song, index) => ({
      playlist_id: localId,
      song_id: song.id,
      position: index,
    }))
  );

  // If not public - return (only local)
  if (!data.isPublic) {
    return { type: 'private', localId };
  }

  // PUBLIC PLAYLIST -> send to database
  let serverId: string | undefined;

  try {
    // Create playlist in backend
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        title: normalizedTitle,
        password: data.password,
        is_public: true,
        expires_at,
      }),
    });

    const body = await res.json();
    if (!res.ok || !body.ok || !body.data?.id) throw new Error('Kunne ikke lage spilleliste');

    serverId = body.data?.id;
    if (!serverId) throw new Error('Ingen playlist ID returnert');

    // Add songs to backend playlist
    for (const song of data.songsInPlaylist) {
      const addRes = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_item',
          playlist_id: serverId,
          song_id: song.id,
          password: data.password,
        }),
      });

      const addBody = await addRes.json();
      if (!addBody.ok) {
        console.error('Kunne ikke legge til sang:', song.title, addBody.error);
      }
    }

    // Sync success -> store server_id locally
    await db.playlists.update(localId, {
      server_id: serverId,
      synced: 1,
      updated_at: new Date().toISOString(),
    });

    return { type: 'public', localId, serverId };
  } catch (error) {
    // If error and a playlist was created, delete it from backend (only public playlists)
    if (serverId) {
      await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          playlist_id: serverId,
          password: data.password,
        }),
      });
    }

    // Remove the local entry
    await db.playlist_items.where('playlist_id').equals(localId).delete();
    await db.playlists.delete(localId);

    throw error;
  }
}
