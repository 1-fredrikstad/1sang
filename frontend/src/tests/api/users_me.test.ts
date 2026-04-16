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

  test('returns empty auth state if no token', async () => {
    const req = new Request('http://localhost/api/users/me');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      userId: null,
      role: null,
      isAdmin: false,
      isSuperuser: false,
    });
  });

  test('returns admin status when token is provided', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'user-123',
      role: 'admin',
      isAdmin: true,
      isSuperuser: false,
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
      userId: 'user-123',
      role: 'admin',
      isAdmin: true,
      isSuperuser: false,
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

  test('returns regular user status', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'user-123',
      role: 'regular',
      isAdmin: false,
      isSuperuser: false,
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
      userId: 'user-123',
      role: 'regular',
      isAdmin: false,
      isSuperuser: false,
    });
  });

  test('returns admin user status', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'user-123',
      role: 'admin',
      isAdmin: true,
      isSuperuser: false,
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
      userId: 'user-123',
      role: 'admin',
      isAdmin: true,
      isSuperuser: false,
    });
  });

  test('returns superuser status', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'user-123',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
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
      userId: 'user-123',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });
  });
});
