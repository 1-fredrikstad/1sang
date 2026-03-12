import { describe, test, expect, vi } from 'vitest';
import { isAdminUser } from '../../../lib/supabase/isAdminUser';

describe('isAdminUser', () => {
  test('returns admin true when user is in admin_users', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabassen.no';
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
        json: async () => [{ user_id: 'user-1' }],
      } as Response);

    const result = await isAdminUser('test-token');

    expect(result.isAdmin).toBe(true);
    expect(result.userId).toBe('user-1');
  });
});
