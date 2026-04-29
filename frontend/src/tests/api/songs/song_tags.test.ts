import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/song_tags/route';

function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('song_tags API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';

    global.fetch = vi.fn();
  });

  describe('GET', () => {
    test('returns song tags', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, tag: 'rock' }], 200));

      const req = new Request('http://localhost/api/song_tags?limit=10');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual([{ id: 1, tag: 'rock' }]);
    });

    test('returns error when supabase fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost/api/song_tags');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  describe('POST', () => {
    test('creates song tag', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1 }], 201));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          song_id: 's1',
          tag_id: 't1',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual([{ id: 1 }]);
    });

    test('returns 400 when missing fields', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
    });

    test('returns 500 when supabase fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          song_id: 's1',
          tag_id: 't1',
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  describe('DELETE', () => {
    test('deletes song tag', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1 }], 200));

      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({
          song_id: 's1',
          tag_id: 't1',
        }),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual({ id: 1 });
    });

    test('returns 404 when nothing deleted', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([], 200));

      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({
          song_id: 's1',
          tag_id: 't1',
        }),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.ok).toBe(false);
    });

    test('returns 400 when missing fields', async () => {
      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({}),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
    });

    test('returns 500 when supabase fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({
          song_id: 's1',
          tag_id: 't1',
        }),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });
});
