import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../app/api/users/me/route';
import { checkUser } from '@/src/lib/supabase/isUser';

vi.mock('@/src/lib/supabase/isUser');

describe('GET /api/users/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns that admin is false if no token', async () => {
    const req = new Request('http://localhost/api/users/me');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      isUser: false,
    });
  });

  test('returns admin status when token is provided', async () => {
    vi.mocked(checkUser).mockResolvedValue({
      isUser: true,
      userId: undefined,
    });

    const req = new Request('http://localhost/api/users/me', {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(checkUser).toHaveBeenCalledWith('test-token');
    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      isUser: true,
    });
  });

  test('returns 500 when an error occurs', async () => {
    vi.mocked(checkUser).mockRejectedValue(new Error('failed'));

    const req = new Request('http://localhost/api/users/me', {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('failed');
  });
});
