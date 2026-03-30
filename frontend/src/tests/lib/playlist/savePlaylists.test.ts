import { Song, db } from '@/src/lib/db';
import { savePlaylist } from '@/src/lib/playlists/savePlaylists';
import { vi, describe, expect, test, beforeEach } from 'vitest';

describe('savePlaylists', () => {
  const song: Song = { id: '1', title: 'Test song', lyrics: 'Lyrics' };

  beforeEach(() => {
    // Mock IndexedDB / Dexie methods
    db.playlists.add = vi.fn().mockResolvedValue(undefined);
    db.playlists.update = vi.fn().mockResolvedValue(undefined);
    db.playlist_items.bulkAdd = vi.fn().mockResolvedValue(undefined);
    db.playlist_items.where = vi.fn().mockReturnValue({
      delete: vi.fn().mockResolvedValue(undefined),
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { id: 'server-123' } }),
    } as Response);
  });

  test('saves private playlist locally and returns private type', async () => {
    const result = await savePlaylist({
      title: 'Test',
      password: '',
      songsInPlaylist: [song] as Song[],
      isPublic: false,
      duration: 604800,
    });

    expect(result.type).toBe('private');
    expect(result.localId).toBeDefined();
  });

  test('creates public playlist and returns serverId', async () => {
    const result = await savePlaylist({
      title: 'Test',
      password: '123',
      songsInPlaylist: [song] as Song[],
      isPublic: true,
      duration: 604800,
    });

    expect(result.type).toBe('public');
    expect(result.serverId).toBe('server-123');
  });
});
