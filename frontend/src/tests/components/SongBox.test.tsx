import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import { SongBox } from '@/src/components/songs/SongBox';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock useLiveQuery
const mockUseLiveQuery = vi.fn();

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mockUseLiveQuery(),
}));

// Mock db
vi.mock('@/src/lib/db', async () => {
  const actual = await vi.importActual<typeof import('@/src/lib/db')>('@/src/lib/db');

  return {
    ...actual,
    db: {
      favorites: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

import { db, type Song } from '@/src/lib/db';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SongBox', () => {
  const song: Song = {
    id: 'abc-123',
    slug: 'test-song',
    title: 'Test Song',
    verses: ['Some lyrics'],
    has_chords: false,
  };

  test('renders song title and link', () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    render(<SongBox song={song} />);

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/songs/test-song');
    expect(screen.getByRole('button', { name: /legg til i favoritter/i })).toBeInTheDocument();
  });

  test('adds song to favorites when star is clicked and song is not favorited', async () => {
    mockUseLiveQuery.mockReturnValue(undefined);
    vi.mocked(db.favorites.put).mockResolvedValue(undefined as never);

    render(<SongBox song={song} />);

    await userEvent.click(screen.getByRole('button', { name: /legg til i favoritter/i }));

    await waitFor(() => {
      expect(db.favorites.put).toHaveBeenCalledWith({
        song_id: 'abc-123',
        created_at: expect.any(String),
      });
    });

    expect(db.favorites.delete).not.toHaveBeenCalled();
  });

  test('removes song from favorites when star is clicked and song is already favorited', async () => {
    mockUseLiveQuery.mockReturnValue({
      song_id: 'abc-123',
      created_at: '2026-03-13T12:00:00.000Z',
    });
    vi.mocked(db.favorites.delete).mockResolvedValue(undefined as never);

    render(<SongBox song={song} />);

    await userEvent.click(screen.getByRole('button', { name: /fjern fra favoritter/i }));

    await waitFor(() => {
      expect(db.favorites.delete).toHaveBeenCalledWith('abc-123');
    });

    expect(db.favorites.put).not.toHaveBeenCalled();
  });

  test('shows correct aria-label when song is favorited', () => {
    mockUseLiveQuery.mockReturnValue({
      song_id: 'abc-123',
      created_at: '2026-03-13T12:00:00.000Z',
    });

    render(<SongBox song={song} />);

    expect(screen.getByRole('button', { name: /fjern fra favoritter/i })).toBeInTheDocument();
  });

  test('shows correct aria-label when song is not favorited', () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    render(<SongBox song={song} />);

    expect(screen.getByRole('button', { name: /legg til i favoritter/i })).toBeInTheDocument();
  });
});
