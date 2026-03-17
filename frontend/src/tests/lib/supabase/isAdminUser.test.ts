import { describe, test, expect, vi } from 'vitest';
import { checkUser } from '../../../lib/supabase/isUser';

describe('isUser', () => {
  test('returns admin true when user is in users', async () => {
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

    const result = await checkUser('test-token');

    expect(result.isUser).toBe(true);
    expect(result.userId).toBe('user-1');
  });
});
