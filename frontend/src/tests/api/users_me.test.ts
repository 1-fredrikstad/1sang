import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../app/api/users/me/route';
import { isAdminUser } from '@/src/lib/supabase/isAdminUser';

vi.mock('@/src/lib/supabase/isAdminUser');

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
      isAdmin: false,
    });
  });

  test('returns admin status when token is provided', async () => {
    vi.mocked(isAdminUser).mockResolvedValue({
      isAdmin: true,
      userId: undefined,
    });

    const req = new Request('http://localhost/api/users/me', {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(isAdminUser).toHaveBeenCalledWith('test-token');
    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      isAdmin: true,
    });
  });

  test('returns 500 when an error occurs', async () => {
    vi.mocked(isAdminUser).mockRejectedValue(new Error('failed'));

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
