import { Song } from '@/src/lib/db';
import { savePlaylist } from '@/src/lib/playlists/savePlaylists';
import { vi, describe, expect, test } from 'vitest';

describe('savePlaylist', () => {
  test('saves private playlist locally and returns private type', async () => {
    const result = await savePlaylist({
      title: 'Test',
      password: '',
      songsInPlaylist: [{ id: '1', title: 'Test song' }] as Song[],
      isPublic: false,
      duration: 604800,
    });

    expect(result.type).toBe('private');
    expect(result.localId).toBeDefined();
  });

  test('creates public playlist and returns serverId', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ok: true,
            data: { id: 'server-123' },
          }),
        })
        .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    );

    const result = await savePlaylist({
      title: 'Test',
      password: '123',
      songsInPlaylist: [{ id: '1', title: 'Test song' }] as Song[],
      isPublic: true,
      duration: 604800,
    });

    expect(result.type).toBe('public');
    expect(result.serverId).toBe('server-123');
  });
});
