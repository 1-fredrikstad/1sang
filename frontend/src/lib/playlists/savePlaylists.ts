import { PlaylistInputs } from '@/src/types/playlistInputs';
import { db, PlaylistItem } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { SavePlaylistResult } from '@/src/types/savePlaylists';

export async function savePlaylist(data: PlaylistInputs): Promise<SavePlaylistResult> {
  const isUpdate = !!data.id;
  // ID for IndexedDB
  const localId: string = isUpdate
    ? data.id!
    : typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : uuidv4(); // fallback for insecure connections (such as http)

  // Calculate expiration (only relevant if public)
  const expires_at = data.isPublic
    ? new Date(Date.now() + (data.duration || 604800) * 1000).toISOString()
    : null;

  // Build playlist object for IndexedDB
  const playlistObj: {
    id: string;
    server_id: string;
    synced: number;
    title: string;
    playlist_password: string;
    created_at?: string;
    updated_at: string;
    is_public: boolean;
    expires_at: string | null;
  } = {
    id: localId,
    server_id: '', // Only exists if the playlist is public and synced to backend
    synced: 0,
    title: data.title,
    playlist_password: data.password ?? '',
    created_at: isUpdate ? undefined : new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: data.isPublic,
    expires_at,
  };

  if (isUpdate) {
    await db.playlists.update(localId, playlistObj);
    await db.playlist_items.where({ playlist_id: localId }).delete();
  } else {
    // Always save playlist to IndexedDB (local)
    await db.playlists.add(playlistObj);
  }

  // Add songs to playlist in IndexedDB (save songs offline)
  const playlistItems: PlaylistItem[] = data.songsInPlaylist.map((song, index) => ({
    playlist_id: localId,
    song_id: song.id,
    position: index,
  }));

  await db.playlist_items.bulkAdd(playlistItems);

  // If not public - return (only local)
  if (!data.isPublic) {
    return { type: 'private', localId };
  }

  // PUBLIC PLAYLIST -> send to database
  let serverId: string | undefined;

  try {
    // Create or update playlist in backend
    const action = !isUpdate ? 'update' : 'create';
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        playlist_id: data.id,
        title: data.title,
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
    return {
      type: 'pending',
      localId,
      error: error instanceof Error ? error.message : 'Sync feilet',
    };
  }
}
