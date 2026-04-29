import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/playlist_items/route';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

vi.mock('@/src/lib/supabase/isAdmin', () => ({
  checkAdminAccess: vi.fn(),
}));

function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('playlist-items API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';

    global.fetch = vi.fn();

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET playlist-items', () => {
    test('returns data successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, name: 'song' }], 200));

      const req = new Request('http://localhost/api?playlist_id=abc&limit=10');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({
        ok: true,
        data: [{ id: 1, name: 'song' }],
      });
    });

    test('returns 500 when Supabase fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost/api');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });
  describe('POST playlist-items', () => {
    test('calls admin RPC when user is admin', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: true,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ success: true }, 200));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          playlist_id: 'p1',
          song_id: 's1',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('calls normal RPC when not admin', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: false,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ success: true }, 200));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          playlist_id: 'p1',
          song_id: 's1',
          password: '1234',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('returns 500 on RPC failure', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: true,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ error: 'fail' }, 500));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          playlist_id: 'p1',
          song_id: 's1',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  describe('DELETE playlist-items', () => {
    test('removes item successfully (admin)', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: true,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ success: true }, 200));

      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({
          playlist_id: 'p1',
          song_id: 's1',
        }),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('returns 500 when delete fails', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: false,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ error: 'fail' }, 500));

      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({
          playlist_id: 'p1',
          song_id: 's1',
          password: '1234',
        }),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });
});
