import { describe, test, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/playlists/verify/route';

function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST verify password', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';

    global.fetch = vi.fn();
  });

  test('returns success', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([{ valid: true }], 200));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        playlist_id: 'p1',
        password: '1234',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  test('returns error when supabase fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse({ message: 'db error' }, 400));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        playlist_id: 'p1',
        password: '1234',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  test('returns 500 on crash', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('fail'));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        playlist_id: 'p1',
        password: '1234',
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Server error');
  });
});
