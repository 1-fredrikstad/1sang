import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '@/app/api/playlists/route';
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

describe('playlists API', () => {
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

  // -------------------------
  // GET
  // -------------------------
  describe('GET playlists', () => {
    test('returns list when no id is provided', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, title: 'A' }], 200));

      const req = new Request('http://localhost/api/playlists');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual([{ id: 1, title: 'A' }]);
    });

    test('returns playlist detail when id is provided', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createResponse({ id: 1, title: 'Detail' }, 200)
      );

      const req = new Request('http://localhost/api/playlists?id=123');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('returns 500 on supabase error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost/api/playlists');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  // -------------------------
  // POST
  // -------------------------
  describe('POST playlists', () => {
    test('create playlist', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ id: 1 }, 200));

      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          action: 'create',
          title: 'hello',
          password: '123',
          is_public: true,
          expires_at: null,
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('add item as non-admin', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: false,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ ok: true }, 200));

      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          action: 'add_item',
          playlist_id: 'p1',
          song_id: 's1',
          password: '123',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('remove item as admin', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: true,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ ok: true }, 200));

      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          action: 'remove_item',
          playlist_id: 'p1',
          song_id: 's1',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('delete playlist fails', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: false,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ error: 'fail' }, 500));

      const req = new Request('http://localhost', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({
          action: 'delete',
          playlist_id: 'p1',
          password: '123',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });

    test('invalid action returns 400', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          action: 'unknown',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe('Invalid action');
    });
  });
});
