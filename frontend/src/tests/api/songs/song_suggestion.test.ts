import { describe, expect, test, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/song_suggestions/route';

describe('POST /api/song_suggestions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
  });

  test('returns 400 when validation fails', async () => {
    const req = new Request('http://localhost/api/song_suggestions', {
      method: 'POST',
      body: JSON.stringify({
        title: '',
        melody: '',
        author: '',
        chorus: '',
        verses: ['Et vers med mer enn 20 tegn, ok!'],
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  test('returns 201 for valid input', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => null,
        })
      )
    );

    const req = new Request('http://localhost/api/song_suggestions', {
      method: 'POST',
      body: JSON.stringify({
        title: 'My Song',
        melody: '',
        author: '',
        chorus: '',
        verses: ['Et vers med minst 20 tegn.'],
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);
  });
});
