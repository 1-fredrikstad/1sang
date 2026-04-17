import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../app/api/users/me/route';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

vi.mock('@/src/lib/supabase/isAdmin', () => ({
  checkAdminAccess: vi.fn(),
}));

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
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: true,
      userId: 'user-123',
      role: 'admin',
    });

    const req = new Request('http://localhost/api/users/me', {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(checkAdminAccess).toHaveBeenCalledWith('test-token');
    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      isAdmin: true,
    });
  });

  test('returns 500 when an error occurs', async () => {
    vi.mocked(checkAdminAccess).mockRejectedValue(new Error('failed'));

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

  test('returns isAdmin false for regular user', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: false,
      userId: 'user-123',
      role: 'regular',
    });

    const req = new Request('http://localhost/api/users/me', {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(checkAdminAccess).toHaveBeenCalledWith('test-token');
    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      isAdmin: false,
    });
  });

  test('returns isAdmin true for admin user', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: true,
      userId: 'user-123',
      role: 'admin',
    });

    const req = new Request('http://localhost/api/users/me', {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(checkAdminAccess).toHaveBeenCalledWith('test-token');
    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      isAdmin: true,
    });
  });

  test('returns isAdmin true for superuser', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: true,
      userId: 'user-123',
      role: 'superuser',
    });

    const req = new Request('http://localhost/api/users/me', {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(checkAdminAccess).toHaveBeenCalledWith('test-token');
    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      isAdmin: true,
    });
  });
});
