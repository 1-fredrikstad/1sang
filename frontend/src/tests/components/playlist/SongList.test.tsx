import SongList from '@/src/components/playlist/SongList';
import { Song } from '@/src/lib/db';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, expect, test } from 'vitest';

const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

describe('SongList', () => {
  test('renders error state', () => {
    render(
      <SongList
        songs={[]}
        isLoading={false}
        error={new Error('fail')}
        onToggleSong={vi.fn()}
        isAdded={() => false}
      />
    );

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  test('calls onToggleSong when song is clicked', async () => {
    const user = userEvent.setup();
    const song = {
      id: '1',
      title: 'A',
      verses: [],
      has_chords: false,
    } as Song;

    const scoredSong = {
      song,
      score: 10,
    };

    const onToggleSong = vi.fn();

    render(
      <SongList
        songs={[scoredSong]}
        isLoading={false}
        error={null}
        onToggleSong={onToggleSong}
        isAdded={() => false}
      />
    );

    await user.click(screen.getByText('A'));

    expect(onToggleSong).toHaveBeenCalledTimes(1);
    expect(onToggleSong).toHaveBeenCalledWith(song);
  });
});
