import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/users/route';

function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';

    global.fetch = vi.fn();
  });

  test('returns users list successfully', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, name: 'Alice' }], 200));

    const req = new Request('http://localhost/api/users?limit=10');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      data: [{ id: 1, name: 'Alice' }],
    });
  });

  test('returns 500 when env variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const req = new Request('http://localhost/api/users');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Missing Supabase env variables');
  });

  test('returns error when supabase fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

    const req = new Request('http://localhost/api/users');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
  });

  test('respects limit query param', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1 }], 200));

    const req = new Request('http://localhost/api/users?limit=5');

    await GET(req);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=5');
  });
});
