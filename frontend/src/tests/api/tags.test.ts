import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE, PATCH } from '@/app/api/tags/route';

function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('tags API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

    global.fetch = vi.fn();
  });

  describe('GET', () => {
    test('returns tags list', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, name: 'rock' }], 200));

      const req = new Request('http://localhost/api/tags?limit=10');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual([{ id: 1, name: 'rock' }]);
    });

    test('returns error when supabase fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost/api/tags');

      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  describe('POST', () => {
    test('creates tag successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, name: 'rock' }], 201));

      const req = new Request('http://localhost/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name: 'rock' }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual([{ id: 1, name: 'rock' }]);
    });

    test('returns 400 when name missing', async () => {
      const req = new Request('http://localhost/api/tags', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
    });

    test('returns 500 when insert fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name: 'rock' }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  describe('DELETE', () => {
    test('deletes tag successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, name: 'rock' }], 200));

      const req = new Request('http://localhost/api/tags', {
        method: 'DELETE',
        body: JSON.stringify({ id: 1 }),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual({ id: 1, name: 'rock' });
    });

    test('returns 404 when nothing deleted', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([], 200));

      const req = new Request('http://localhost/api/tags', {
        method: 'DELETE',
        body: JSON.stringify({ id: 1 }),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.ok).toBe(false);
    });

    test('returns 400 when id missing', async () => {
      const req = new Request('http://localhost/api/tags', {
        method: 'DELETE',
        body: JSON.stringify({}),
      });

      const res = await DELETE(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
    });
  });

  describe('PATCH', () => {
    test('updates tag successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, name: 'jazz' }], 200));

      const req = new Request('http://localhost/api/tags', {
        method: 'PATCH',
        body: JSON.stringify({ id: 1, name: 'jazz' }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual({ id: 1, name: 'jazz' });
    });

    test('returns 400 when id missing', async () => {
      const req = new Request('http://localhost/api/tags', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'jazz' }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
    });

    test('returns 400 when name missing', async () => {
      const req = new Request('http://localhost/api/tags', {
        method: 'PATCH',
        body: JSON.stringify({ id: 1 }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
    });

    test('returns 500 when update fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const req = new Request('http://localhost/api/tags', {
        method: 'PATCH',
        body: JSON.stringify({ id: 1, name: 'jazz' }),
      });

      const res = await PATCH(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });
});
