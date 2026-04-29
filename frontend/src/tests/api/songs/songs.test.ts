import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/songs/route';
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

describe('songs API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

    global.fetch = vi.fn();
  });

  test('GET returns songs list', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 1, title: 'Song' }], 200));

    const req = new Request('http://localhost/api/songs?limit=10');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual([{ id: 1, title: 'Song' }]);
  });

  test('GET returns error when supabase fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

    const req = new Request('http://localhost/api/songs');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
  });

  test('POST creates song as admin', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: true,
    } as never);

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(createResponse([{ id: 'song-1' }], 201)) // insert song
      .mockResolvedValueOnce(createResponse([{ song_id: 'song-1' }], 201)); // song_tags

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'test song',
        tags: ['a', 'b'],
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.destination).toBe('songs');
  });

  test('POST creates song suggestion when not admin', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: false,
    } as never);

    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ id: 'suggest-1' }], 201));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        title: 'test song',
        tags: [],
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.destination).toBe('song_suggestions');
  });

  test('POST returns 500 if insert returns empty array', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: true,
    } as never);

    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([], 200));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        title: 'test',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
  });

  test('POST returns error when supabase insert fails', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: true,
    } as never);

    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        title: 'test',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
  });
});
