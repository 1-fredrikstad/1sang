import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkAdminAccess } from '../../../lib/supabase/isAdmin';

describe('checkAdminAccess', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.no',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'pubkey',
      SUPABASE_SERVICE_ROLE_KEY: 'service',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  function mockUserAndRole(role: 'regular' | 'admin' | 'superuser' | null) {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'bruker-1' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => (role ? [{ role }] : []),
      } as Response);
  }

  test('returns isAdmin false and isSuperuser false for regular user', async () => {
    mockUserAndRole('regular');

    const result = await checkAdminAccess('test-token');

    expect(result).toEqual({
      userId: 'bruker-1',
      role: 'regular',
      isAdmin: false,
      isSuperuser: false,
    });
  });

  test('returns isAdmin true and isSuperuser false for admin user', async () => {
    mockUserAndRole('admin');

    const result = await checkAdminAccess('test-token');

    expect(result).toEqual({
      userId: 'bruker-1',
      role: 'admin',
      isAdmin: true,
      isSuperuser: false,
    });
  });

  test('returns isAdmin true and isSuperuser true for superuser', async () => {
    mockUserAndRole('superuser');

    const result = await checkAdminAccess('test-token');

    expect(result).toEqual({
      userId: 'bruker-1',
      role: 'superuser',
      isAdmin: true,
      isSuperuser: true,
    });
  });

  test('returns no admin access when user has no role row', async () => {
    mockUserAndRole(null);

    const result = await checkAdminAccess('test-token');

    expect(result).toEqual({
      userId: 'bruker-1',
      role: null,
      isAdmin: false,
      isSuperuser: false,
    });
  });

  test('returns no access when auth user lookup fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'invalid token' }),
    } as Response);

    const result = await checkAdminAccess('test-token');

    expect(result).toEqual({
      userId: null,
      role: null,
      isAdmin: false,
      isSuperuser: false,
    });
  });

  test('throws when role lookup fails', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'bruker-1' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'error' }),
      } as Response);

    await expect(checkAdminAccess('test-token')).rejects.toThrow('Kunne ikke sjekke brukerrolle');
  });
});
