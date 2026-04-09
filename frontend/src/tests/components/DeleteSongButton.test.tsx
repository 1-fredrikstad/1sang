import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, test, expect } from 'vitest';

const mockReplace = vi.fn();
const mockUseOnlineStatus = vi.fn();
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
    songs: {
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
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

import { DeleteSongButton } from '@/src/components/DeleteSongButton';
import { db } from '@/src/lib/db';

beforeEach(() => {
  vi.clearAllMocks();

  mockUseOnlineStatus.mockReturnValue(true);
  vi.mocked(db.songs.delete).mockResolvedValue(undefined);
  mockGetSession.mockResolvedValue({
    data: {
      session: {
        access_token: 'test-token',
      },
    },
  });

  global.fetch = vi.fn();
  global.confirm = vi.fn();
});

describe('DeleteSongButton', () => {
  test('renders button', () => {
    render(<DeleteSongButton songId="abc-123" />);
    expect(screen.getByRole('button', { name: /slett sang/i })).toBeInTheDocument();
  });

  test('shows error toast and does not delete when offline', async () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    expect(mockToastError).toHaveBeenCalledWith('Du er offline. Gå online for å slette sangen.');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.songs.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('shows error toast and does not delete when song id is missing', async () => {
    render(<DeleteSongButton songId="" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    expect(mockToastError).toHaveBeenCalledWith('Mangler sang-ID');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.songs.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('does nothing when user cancels confirm dialog', async () => {
    vi.mocked(global.confirm).mockReturnValue(false);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    expect(global.confirm).toHaveBeenCalledWith('Er du sikker på at du vil slette sangen?');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.songs.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('deletes song, removes from db, and redirects on success', async () => {
    vi.mocked(global.confirm).mockReturnValue(true);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
    } as unknown as Response);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/songs/abc-123', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    await waitFor(() => {
      expect(db.songs.delete).toHaveBeenCalledWith('abc-123');
      expect(mockToastSuccess).toHaveBeenCalledWith('Sangen ble slettet');
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  test('handles failed delete response and shows error toast', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(global.confirm).mockReturnValue(true);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Sletting feilet' }),
    } as unknown as Response);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Sletting feilet');
    });

    expect(db.songs.delete).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
