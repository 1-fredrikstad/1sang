import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { PATCH } from '@/app/api/admin/users/role/route';
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

describe('PATCH /api/admin/users/role', () => {
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

  const makeRequest = (body?: unknown, token = 'test-token'): NextRequest =>
    new NextRequest('http://localhost/api/admin/users/role', {
      method: 'PATCH',
      headers: token
        ? {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          }
        : {
            'content-type': 'application/json',
          },
      body: body ? JSON.stringify(body) : undefined,
    });

  test('returns 401 when token is missing', async () => {
    const req = makeRequest({ targetUserId: 'u1', role: 'admin' }, '');

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      error: 'Mangler token',
    });
  });

  test('returns 403 when requester is not superuser', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'admin-1',
      role: 'admin',
      isAdmin: true,
      isSuperuser: false,
    });

    const res = await PATCH(makeRequest({ targetUserId: 'u1', role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Ikke tilgang');
  });

  test('returns 400 when targetUserId missing', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    const res = await PATCH(makeRequest({ role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Mangler bruker-ID');
  });

  test('returns 400 when role is invalid', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    const res = await PATCH(makeRequest({ targetUserId: 'u1', role: 'superuser' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Ugyldig rolle');
  });

  test('returns 400 when changing own role', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    const res = await PATCH(makeRequest({ targetUserId: 'super-1', role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Du kan ikke endre din egen rolle her');
  });

  test('returns 404 when target user does not exist', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch).mockResolvedValueOnce(createResponse([], 200));

    const res = await PATCH(makeRequest({ targetUserId: 'u1', role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Fant ikke bruker');
  });

  test('returns 403 when target user is superuser', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch).mockResolvedValueOnce(
      createResponse([{ user_id: 'u1', role: 'superuser' }], 200)
    );

    const res = await PATCH(makeRequest({ targetUserId: 'u1', role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Superuser kan ikke endres her');
  });

  test('updates role successfully', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(createResponse([{ user_id: 'u1', role: 'regular' }], 200))
      .mockResolvedValueOnce(createResponse([{ user_id: 'u1', role: 'admin' }], 200));

    const res = await PATCH(makeRequest({ targetUserId: 'u1', role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      data: {
        user_id: 'u1',
        role: 'admin',
      },
    });
  });

  test('returns 500 when target lookup fails', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch).mockResolvedValueOnce(
      createResponse([{ user_id: 'super-1', role: 'superuser' }], 500)
    );

    const res = await PATCH(makeRequest({ targetUserId: 'u1', role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Kunne ikke hente målbruker');
  });

  test('returns 500 when update fails', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      userId: 'super-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(createResponse([{ user_id: 'u1', role: 'regular' }], 200))
      .mockResolvedValueOnce(createResponse({ message: 'db error' }, 500));

    const res = await PATCH(makeRequest({ targetUserId: 'u1', role: 'admin' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Kunne ikke oppdatere rolle');
  });
});
