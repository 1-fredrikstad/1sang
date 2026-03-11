import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import { DeleteSongButton } from '@/src/components/DeleteSongButton';

/**
 * Component tests for DeleteSongButton.
 *
 * The component is rendered with React Testing Library and user
 * interactions are simulated with userEvent.
 *
 * External dependencies (router, db, online status, fetch) are mocked
 * using Vitest so the component can be tested in isolation.
 */

// Mock router
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock db
vi.mock('@/src/lib/db', () => {
  return {
    db: {
      songs: {
        delete: vi.fn(),
      },
    },
  };
});

// Mock online status hook
const mockUseOnlineStatus = vi.fn();

vi.mock('@/src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

import { db } from '@/src/lib/db';

beforeEach(() => {
  vi.clearAllMocks();

  mockUseOnlineStatus.mockReturnValue(true);
  vi.mocked(db.songs.delete).mockResolvedValue(undefined);

  global.fetch = vi.fn();
  global.alert = vi.fn();
  global.confirm = vi.fn();
});

describe('DeleteSongButton', () => {
  test('renders button with default text', () => {
    render(<DeleteSongButton songId="abc-123" />);
    expect(screen.getByRole('button', { name: /slett sang/i })).toBeInTheDocument();
  });

  test('alerts and does not delete when offline', async () => {
    mockUseOnlineStatus.mockReturnValue(false);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    expect(global.alert).toHaveBeenCalledWith('Du er offline. Gå online for å slette sangen');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.songs.delete).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('does nothing when user cancels confirm dialog', async () => {
    vi.mocked(global.confirm).mockReturnValue(false);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    expect(global.confirm).toHaveBeenCalledWith('Er du sikker på at du vil slette sangen?');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(db.songs.delete).not.toHaveBeenCalled();
  });

  test('deletes song, removes from db, redirects and refreshes on success', async () => {
    vi.mocked(global.confirm).mockReturnValue(true);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
    } as Response);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    expect(global.fetch).toHaveBeenCalledWith('/api/songs/abc-123', {
      method: 'DELETE',
    });

    await waitFor(() => {
      expect(db.songs.delete).toHaveBeenCalledWith('abc-123');
      expect(mockPush).toHaveBeenCalledWith('/songs');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  test('handles failed delete response and shows alert', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(global.confirm).mockReturnValue(true);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue('Sletting feilet'),
    } as unknown as Response);

    render(<DeleteSongButton songId="abc-123" />);
    await userEvent.click(screen.getByRole('button', { name: /slett sang/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Kunne ikke slette sang');
    });

    expect(db.songs.delete).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
