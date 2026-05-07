import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GET } from '@/app/api/playlists/[id]/songs/route';

vi.mock('@/src/lib/supabase/isAdmin', () => ({
  checkAdminAccess: vi.fn(),
}));

describe('playlists [id] songs route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.no';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
  });

  test('GET returns song from playlist on valid playlist id', async () => {
    const playlistId = '1234567891011';
    const ctx = { params: Promise.resolve({ id: playlistId }) };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ position: 1, songs: { id: 'song1', title: 'Test song' } }],
    });

    vi.stubGlobal('fetch', mockFetch);

    const res = await GET(new Request(`http://localhost/api/playlists/${playlistId}/songs`), ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(mockFetch).toHaveBeenCalled();
  });

  test('GET returns 400 when playlistId is missing or indvalid', async () => {
    const invalidIds = ['', 'undefined', 'short', '123'];

    for (const badId of invalidIds) {
      const ctx = { params: Promise.resolve({ id: badId }) };

      const res = await GET(new Request(`http://localhost/api/playlists/${badId}/songs`), ctx);

      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error).toBe('Missing or invalid playlist id');
    }
  });

  test('returns Supabase error when API call fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const playlistId = '1234567891011';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Playlist not found' }),
      })
    );

    const ctx = { params: Promise.resolve({ id: playlistId }) };

    const res = await GET(new Request(`http://localhost/api/playlists/${playlistId}/songs`), ctx);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error).toBeDefined();
  });
});
