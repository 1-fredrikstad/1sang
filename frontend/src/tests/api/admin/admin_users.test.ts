import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/admin/users/route';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';
import { NextRequest } from 'next/server';

vi.mock('@/src/lib/supabase/isAdmin', () => ({
  checkAdminAccess: vi.fn(),
}));

const createResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    global.fetch = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeRequest = (token = 'test-token'): NextRequest =>
    new NextRequest('http://localhost/api/admin/users', {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });

  test('returns 401 when token is missing', async () => {
    const req = makeRequest('');

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      error: 'Mangler token',
    });
  });

  test('returns 403 when user is not superuser', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'user-1',
      role: 'admin',
      isAdmin: true,
      isSuperuser: false,
    });

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body).toEqual({
      ok: false,
      error: 'Ikke tilgang',
    });
  });

  test('returns empty list when no users exist', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([], 200) as unknown as Response);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      data: [],
    });
  });

  test('returns users list successfully', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    const users = [
      { user_id: '1', name: 'A', email: 'a@test.com', role: 'admin' },
      { user_id: '2', name: 'B', email: 'b@test.com', role: 'regular' },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce(
      createResponse(users, 200) as unknown as Response
    );

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      data: users,
    });
  });

  test('returns 500 when Supabase request fails', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'db error' }),
    } as Response);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toContain('Kunne ikke hente brukere');
  });

  test('returns 500 when fetch throws', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('network error'));

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
  });
});
