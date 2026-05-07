import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, PATCH, DELETE } from '@/app/api/playlists/[id]/route';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

vi.mock('@/src/lib/supabase/isAdmin', () => ({
  checkAdminAccess: vi.fn(),
}));

const createResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('playlist/[id] route', () => {
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

  const makeReq = (body?: unknown): Request =>
    new Request('http://localhost', {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });

  const params = { params: Promise.resolve({ id: 'p1' }) };

  describe('GET', () => {
    test('returns playlist detail', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createResponse([{ id: 'p1', title: 'Test' }], 200)
      );

      const res = await GET(new Request('http://localhost'), params);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({
        ok: true,
        data: { id: 'p1', title: 'Test' },
      });
    });

    test('returns 500 when supabase fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

      const res = await GET(new Request('http://localhost'), params);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  describe('PATCH', () => {
    test('admin update path', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: true,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ success: true }, 200));

      const req = new Request('http://localhost', {
        method: 'PATCH',
        body: JSON.stringify({
          title: 'ny tittel',
          is_public: true,
        }),
      });

      const res = await PATCH(req, params);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('non-admin update path', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: false,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ success: true }, 200));

      const req = makeReq({
        title: 'tittel',
        password: '1234',
        is_public: false,
      });

      const res = await PATCH(req, params);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('returns 500 on RPC failure', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: true,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ error: 'fail' }, 500));

      const req = makeReq({ title: 'x' });

      const res = await PATCH(req, params);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
    });
  });

  describe('DELETE', () => {
    test('admin delete', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: true,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ success: true }, 200));

      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({}),
      });

      const res = await DELETE(req, params);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });

    test('user delete with password', async () => {
      vi.mocked(checkAdminAccess).mockResolvedValue({
        isAdmin: false,
      } as never);

      vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ success: true }, 200));

      const req = new Request('http://localhost', {
        method: 'DELETE',
        body: JSON.stringify({ password: '1234' }),
      });

      const res = await DELETE(req, params);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
    });
  });
});
