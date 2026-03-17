import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DELETE, GET, PATCH } from '../../../app/api/songs/[id]/route';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

vi.mock('@/src/lib/supabase/isAdmin', () => ({
  checkAdminAccess: vi.fn(),
}));

describe('songs [id] route', () => {
  const songId = '123';
  const ctx = { params: Promise.resolve({ id: songId }) };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabasse.no';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  //bytter ut den globale fetch-funksjonen med en falsk versjon i testen
  test('GET returns song', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: songId, title: 'Test song' }],
      })
    );

    const res = await GET(new Request(`http://localhost/api/songs/${songId}`), ctx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.id).toBe(songId);
  });

  test('PATCH returns 403 when user is not admin', async () => {
    vi.mocked(checkAdminAccess).mockResolvedValue({
      isAdmin: false,
      userId: null,
      role: null,
    });

    const req = new Request(`http://localhost/api/songs/${songId}`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer test-token' },
      body: JSON.stringify({
        title: 'Ny tittel',
        lyrics: 'Dette er en gyldig sangtekst med mer enn tjue tegn.',
      }),
    });

    const res = await PATCH(req, ctx);
    const body = await res.json();

    expect(checkAdminAccess).toHaveBeenCalledWith('test-token');
    expect(res.status).toBe(403);
    expect(body.error).toBe('Du har ikke tilgang til å redigere sanger');
  });

  test('DELETE returns 404 when nothing is deleted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      })
    );

    const res = await DELETE(new Request(`http://localhost/api/songs/${songId}`), ctx);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Nothing deleted (id not found or RLS blocked)');
  });
});
