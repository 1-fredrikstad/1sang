import { describe, test, expect, vi, beforeEach } from 'vitest';

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

import { syncPlaylists } from '@/src/lib/playlists/syncPlaylists';

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
  test('skips sync when offline', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      configurable: true,
    });

    await syncPlaylists();

    expect(db.playlists.where).not.toHaveBeenCalled();
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
});
