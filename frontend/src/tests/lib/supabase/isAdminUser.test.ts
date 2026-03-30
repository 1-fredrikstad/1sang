import { describe, test, expect, vi } from 'vitest';
import { checkAdminAccess } from '../../../lib/supabase/isAdmin';

describe('checkAdminAccess', () => {
  test('returns admin true when user has role of admin', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.no';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'pubkey';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-1' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ role: 'admin' }],
      } as Response);

    const result = await checkAdminAccess('test-token');

    expect(result.role).toBe('admin');
    expect(result.userId).toBe('user-1');
  });
});
