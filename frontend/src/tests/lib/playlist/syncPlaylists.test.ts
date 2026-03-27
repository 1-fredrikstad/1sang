import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const db = vi.hoisted(() => ({
  playlists: {
    where: vi.fn(),
    update: vi.fn(),
    add: vi.fn(),
  },
  playlist_items: {
    where: vi.fn(),
    bulkAdd: vi.fn(),
    delete: vi.fn(),
  },
}));

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/src/lib/db', () => ({ db }));
vi.mock('@/src/lib/supabase/client', () => ({
  createClient: () => supabaseMock,
}));

import { syncLocalToServer, syncPlaylists } from '@/src/lib/playlists/syncPlaylists';

// ----------------------
// Helpers
// ----------------------

beforeEach(() => {
  vi.clearAllMocks();

  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true },
    configurable: true,
  });

  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: vi.fn(() => 'uuid-123'),
    },
    configurable: true,
  });
});

describe('syncPlaylists', () => {
  it('skips sync when offline', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      configurable: true,
    });

    await syncPlaylists();

    expect(db.playlists.where).not.toHaveBeenCalled();
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
  it('syncs local playlist to server and marks it synced', async () => {
    db.playlists.where.mockReturnValue({
      equals: () => ({
        and: () => ({
          toArray: () =>
            Promise.resolve([
              {
                id: 'local-1',
                title: 'Test',
                is_public: true,
                synced: 0,
                expires_at: null,
              },
            ]),
        }),
      }),
    });

    db.playlist_items.where.mockReturnValue({
      equals: () => ({
        sortBy: () => Promise.resolve([]),
      }),
    });

    supabaseMock.from.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'server-1' },
              error: null,
            }),
        }),
      }),
    });

    await syncLocalToServer();

    expect(db.playlists.update).toHaveBeenCalled();
  });
});
