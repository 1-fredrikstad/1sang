import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, test, expect } from 'vitest';

const mockReplace = vi.fn();
const mockGetSession = vi.fn();

const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock('@/src/lib/db', () => ({
  db: {
    playlists: {
      delete: vi.fn(),
    },
    playlist_items: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([
            { playlist_id: 'playlist-1', song_id: 'song-1' },
            { playlist_id: 'playlist-1', song_id: 'song-2' },
          ]),
        })),
      })),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/src/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

import { DeletePlaylistButton } from '@/src/components/playlist/DeletePlaylistButton';
import { db } from '@/src/lib/db';

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(db.playlists.delete).mockResolvedValue(undefined);
  vi.mocked(db.playlist_items.delete).mockResolvedValue(undefined);

  mockGetSession.mockResolvedValue({
    data: {
      session: {
        access_token: 'test-token',
      },
    },
  });

  global.fetch = vi.fn();
  sessionStorage.clear();
});

describe('DeletePlaylistButton', () => {
  test('renders button', () => {
    render(<DeletePlaylistButton playlistId="playlist-1" isPublic={false} />);
    expect(screen.getByRole('button', { name: /slett spilleliste/i })).toBeInTheDocument();
  });

  test('shows error toast and does not delete when playlist id is missing', async () => {
    const user = userEvent.setup();

    render(<DeletePlaylistButton playlistId="" isPublic={false} />);
    await user.click(screen.getByRole('button', { name: /slett spilleliste/i }));
    await user.click(screen.getByRole('button', { name: /^slett$/i }));

    expect(mockToastError).toHaveBeenCalledWith('Mangler playlist-ID');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.playlists.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('does nothing when user cancels delete dialog', async () => {
    const user = userEvent.setup();

    render(<DeletePlaylistButton playlistId="playlist-1" isPublic={false} />);
    await user.click(screen.getByRole('button', { name: /slett spilleliste/i }));
    await user.click(screen.getByRole('button', { name: /avbryt/i }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.playlists.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('deletes private playlist locally and redirects on success', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('playlist-password-playlist-1', '1234');

    render(<DeletePlaylistButton playlistId="playlist-1" isPublic={false} />);
    await user.click(screen.getByRole('button', { name: /slett spilleliste/i }));
    await user.click(screen.getByRole('button', { name: /^slett$/i }));

    await waitFor(() => {
      expect(db.playlist_items.delete).toHaveBeenCalledWith(['playlist-1', 'song-1']);
      expect(db.playlist_items.delete).toHaveBeenCalledWith(['playlist-1', 'song-2']);
      expect(db.playlists.delete).toHaveBeenCalledWith('playlist-1');
      expect(mockToastSuccess).toHaveBeenCalledWith('Spilleliste slettet');
      expect(mockReplace).toHaveBeenCalledWith('/');
    });

    expect(sessionStorage.getItem('playlist-password-playlist-1')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('deletes public playlist through API and redirects on success', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('playlist-password-playlist-1', '1234');

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
    } as unknown as Response);

    render(<DeletePlaylistButton playlistId="playlist-1" isPublic={true} />);
    await user.click(screen.getByRole('button', { name: /slett spilleliste/i }));
    await user.click(screen.getByRole('button', { name: /^slett$/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/playlists/playlist-1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        password: '1234',
      }),
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Spilleliste slettet');
      expect(mockReplace).toHaveBeenCalledWith('/');
    });

    expect(sessionStorage.getItem('playlist-password-playlist-1')).toBeNull();
    expect(db.playlists.delete).not.toHaveBeenCalled();
  });

  test('handles failed public delete response and shows error toast', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.setItem('playlist-password-playlist-1', '1234');

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ ok: false }),
    } as unknown as Response);

    render(<DeletePlaylistButton playlistId="playlist-1" isPublic={true} />);
    await user.click(screen.getByRole('button', { name: /slett spilleliste/i }));
    await user.click(screen.getByRole('button', { name: /^slett$/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Kunne ikke slette spilleliste');
    });

    expect(mockReplace).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
